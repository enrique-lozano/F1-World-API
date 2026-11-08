import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { CommonQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import {
  DB,
  DriverCareerStats,
  DriverDTO,
  Drivers,
  FamilyRelationship,
  Gender
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { getSeasonFromIdColumn } from '../../utils/f1-sql-common-utils';
import { CareerService } from '../career.service';
import { CountryService } from '../countries/countries.service';
import { DriverStandingService } from '../driver-standings/driver-standings.service';
import { DriverController } from './driver.controller';

export interface DriverQueryParams extends CommonQueryParams {
  /** If specified, returns only drivers whose full name contains this value */
  name?: string;

  /** If specified, returns only drivers of this nationality */
  nationalityId?: string;

  /** If specified, return only the drivers whose birth is before this value.
   * The param value should have the format `YYYY-MM-DD`
   *
   * @example "1972-03-23"
   * @pattern [0-9]{4}-[0-9]{2}-[0-9]{2}
   */
  birthBefore?: string;

  /** If specified, return only the drivers whose birth is after this value.
   * The param value should have the format `YYYY-MM-DD`
   *
   * @example "1972-03-23"
   * @pattern [0-9]{4}-[0-9]{2}-[0-9]{2}
   */
  birthAfter?: string;

  /** If specified, returns only drivers of this gender */
  gender?: Gender;
}

export class DriverService
  extends DbService
  implements
    Pick<
      DriverController,
      | 'getById'
      | 'get'
      | 'getChampionshipResults'
      | 'getDriverFamilyRelationships'
      | 'getDriverSeasons'
      | 'getDriverStats'
    >
{
  /**
   * @param withCareerSpan Whether to select the `firstSeason` and `lastSeason` of the drivers. They are calculated, so we only select them in the `/drivers` endpoints, not when the drivers are nested inside other resources
   */
  static getDriversSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'drivers', object>,
    fieldsParam?: IncludeParam,
    withCareerSpan = false
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'abbreviation',
      'dateOfBirth',
      'dateOfDeath',
      'firstName',
      'fullName',
      'lastName',
      'id',
      'name',
      'permanentNumber',
      'placeOfBirth',
      'gender',
      'placeOfBirth'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'drivers', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('countryOfBirthCountry'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('countryOfBirthCountry')
            ).whereRef(
              'drivers.countryOfBirthCountryId',
              '==',
              'countries.alpha2Code'
            )
          ).as('countryOfBirthCountry')
        )
      )
      .$if(fieldsParam.shouldSelectObject('nationalityCountry'), (qb) =>
        qb.select((eb) => [
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('nationalityCountry')
            ).whereRef(
              'drivers.nationalityCountryId',
              '==',
              'countries.alpha2Code'
            )
          ).as('nationalityCountry')
        ])
      )
      .$if(fieldsParam.shouldSelectObject('secondNationalityCountry'), (qb) =>
        qb.select((eb) => [
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('secondNationalityCountry')
            ).whereRef(
              'drivers.secondNationalityCountryId',
              '==',
              'countries.alpha2Code'
            )
          ).as('secondNationalityCountry')
        ])
      )
      .$if(withCareerSpan && fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(DriverService.firstSeasonExpression.as('firstSeason'))
      )
      .$if(withCareerSpan && fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(DriverService.lastSeasonExpression.as('lastSeason'))
      ) as SelectQueryBuilder<DB, 'drivers' | T, DriverDTO>;
  }

  private static get firstSeasonExpression() {
    return CareerService.entrySeasonExpression('driverId', 'drivers.id', 'min');
  }

  private static get lastSeasonExpression() {
    return CareerService.entrySeasonExpression('driverId', 'drivers.id', 'max');
  }

  async get(
    obj: DriverQueryParams
  ): Promise<PageMetadata & { data: DriverDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Drivers>(obj.sort || 'fullName');

    const mainSelect = this.db
      .selectFrom('drivers')
      .where(
        sql`LOWER(drivers.fullName)`,
        'like',
        `%${obj.name?.toLocaleLowerCase() ?? ''}%`
      )
      .$if(obj.nationalityId != undefined, (qb) =>
        qb.where('nationalityCountryId', '==', obj.nationalityId!)
      )
      .$if(obj.gender != undefined, (qb) =>
        qb.where('gender', '==', obj.gender!)
      )
      .$if(obj.birthAfter != undefined, (qb) =>
        qb.where('dateOfBirth', '>', obj.birthAfter!)
      )
      .$if(obj.birthBefore != undefined, (qb) =>
        qb.where('dateOfBirth', '<', obj.birthBefore!)
      );

    return this.paginateSelect(
      mainSelect,
      DriverService.getDriversSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj),
        true
      ),
      paginator,
      sorter,
      {
        firstSeason: DriverService.firstSeasonExpression,
        lastSeason: DriverService.lastSeasonExpression
      }
    ).executeTakeFirstOrThrow();
  }

  getById(driverId: string): Promise<DriverDTO | undefined> {
    return DriverService.getDriversSelect(
      this.db.selectFrom('drivers'),
      undefined,
      true
    )
      .where('id', '==', driverId)
      .executeTakeFirst();
  }

  async getDriverStats(driverId: string): Promise<DriverCareerStats> {
    const driver = await this.db
      .selectFrom('drivers')
      .select('id')
      .where('id', '==', driverId)
      .executeTakeFirst();

    if (!driver) throw HttpException.resourceNotFound('default');

    const [stats, championships] = await Promise.all([
      new CareerService().getStats('driverId', driverId),
      this.countChampionships(driverId)
    ]);

    return { ...stats, championships };
  }

  /** Number of seasons that the driver finished in the first position of the drivers' standings */
  private async countChampionships(driverId: string) {
    const season = getSeasonFromIdColumn('raceResults.sessionId');

    // Seasons in which the driver has the maximum number of points
    const seasonsAsLeader = await this.db
      .with('seasonPoints', (db) =>
        db
          .selectFrom('raceResults')
          .innerJoin(
            'sessionEntrants',
            'sessionEntrants.id',
            'raceResults.entrantId'
          )
          .groupBy([season, 'sessionEntrants.driverId'])
          .select([
            season.as('season'),
            'sessionEntrants.driverId',
            sql<number>`TOTAL(raceResults.pointsGained)`.as('points')
          ])
      )
      .with('leaders', (db) =>
        db
          .selectFrom('seasonPoints')
          .groupBy('seasonPoints.season')
          .select(({ fn }) => [
            'seasonPoints.season',
            fn.max<number>('seasonPoints.points').as('maxPoints')
          ])
      )
      .selectFrom('seasonPoints')
      .innerJoin('leaders', (join) =>
        join
          .onRef('leaders.season', '==', 'seasonPoints.season')
          .onRef('leaders.maxPoints', '==', 'seasonPoints.points')
      )
      .where('seasonPoints.driverId', '==', driverId)
      .where('leaders.maxPoints', '>', 0)
      .select([
        'seasonPoints.season',
        sql<number>`(SELECT COUNT(*) FROM seasonPoints AS sp WHERE sp.season = seasonPoints.season AND sp.points = leaders.maxPoints)`.as(
          'tiedDrivers'
        )
      ])
      .execute();

    let championships = 0;

    for (const { season, tiedDrivers } of seasonsAsLeader) {
      if (tiedDrivers === 1) {
        championships++;
        continue;
      }

      // Tie in points: use the tie resolution of the standings
      const result = await this.championshipService.getDriverChampionshipResult(
        season,
        driverId
      );

      if (result?.position === 1) championships++;
    }

    return championships;
  }

  getDriverFamilyRelationships(
    driverId: string
  ): Promise<{ driver: DriverDTO | null; relationship: FamilyRelationship }[]> {
    return this.db
      .selectFrom('driversFamilyRelationships')
      .select(['AisToB as relationship'])
      .select(({ eb }) => [
        jsonObjectFrom(
          DriverService.getDriversSelect(eb.selectFrom('drivers')).whereRef(
            'drivers.id',
            '==',
            'driverB'
          )
        ).as('driver')
      ])
      .where('driverA', '=', driverId)
      .execute();
  }

  async getDriverSeasons(driverId: string) {
    const toReturn = await this.db
      .selectFrom('raceResults')
      .innerJoin(
        'sessionEntrants',
        'sessionEntrants.id',
        'raceResults.entrantId'
      )
      .where('driverId', '==', driverId)
      .select([getSeasonFromIdColumn('sessionId').as('year')])
      .groupBy('year')
      .execute();

    return toReturn.map((x) => x.year);
  }

  async getChampionshipResults(driverId: string) {
    const seasonsToGet = await this.getDriverSeasons(driverId);

    const toReturn: {
      season: number;
      position: number;
      points: number;
    }[] = [];

    for (const season of seasonsToGet) {
      const results =
        await this.championshipService.getDriverChampionshipResult(
          season,
          driverId
        );

      if (!results) continue;

      toReturn.push({
        season,
        points: results.points,
        position: results.position
      });
    }

    return { driver: await this.getById(driverId), results: toReturn };
  }

  private get championshipService() {
    return new DriverStandingService();
  }
}
