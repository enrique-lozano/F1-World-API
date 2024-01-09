import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { CommonQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, DriverDTO, Drivers, Gender } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { getSeasonFromIdColumn } from '../../utils/f1-sql-common-utils';
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
    >
{
  static getDriversSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'drivers', object>,
    fieldsParam?: IncludeParam
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
      ) as SelectQueryBuilder<DB, 'drivers' | T, DriverDTO>;
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
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  getById(driverId: string): Promise<DriverDTO | undefined> {
    return DriverService.getDriversSelect(this.db.selectFrom('drivers'))
      .where('id', '==', driverId)
      .executeTakeFirst();
  }

  getDriverFamilyRelationships(
    driverId: string
  ): Promise<{ driver: DriverDTO | null; relationship: string }[]> {
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

      if (!toReturn) return;

      toReturn.push({
        season,
        points: results!.points,
        position: results!.position
      });
    }

    return { driver: await this.getById(driverId), results: toReturn };
  }

  private get championshipService() {
    return new DriverStandingService();
  }
}
