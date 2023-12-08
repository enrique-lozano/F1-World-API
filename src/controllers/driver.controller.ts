import { SelectQueryBuilder, sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { DbService } from '../services/db.service';
import { DB, DriverDTO, Gender } from './../models/types.dto';
import { CountryService } from './countries.controller';
import { DriverStandingService } from './driver-standings.controller';

interface DriverQueryParams extends PageQueryParams {
  /** Filter drivers by its full name */
  name?: string;

  /** Filter drivers by its nationality */
  nationalityId?: string;

  /** Filter drivers by its gender */
  gender?: Gender;
}

@Route('/drivers')
@Tags('Drivers')
export class DriverService extends DbService {
  static getDriversSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'drivers', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'drivers', {}>)
      .select([
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
      ])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef(
            'drivers.countryOfBirthCountryId',
            '==',
            'countries.alpha2Code'
          )
        ).as('countryOfBirthCountry'),
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef(
            'drivers.nationalityCountryId',
            '==',
            'countries.alpha2Code'
          )
        ).as('nationalityCountry'),
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef(
            'drivers.secondNationalityCountryId',
            '==',
            'countries.alpha2Code'
          )
        ).as('secondNationalityCountry')
      ]) as SelectQueryBuilder<DB, 'drivers' | T, DriverDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: DriverQueryParams
  ): Promise<PageMetadata & { data: DriverDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db
      .selectFrom('drivers')
      .where('drivers.fullName', 'like', `%${obj.name ?? ''}%`)
      .$if(obj.nationalityId != undefined, (qb) =>
        qb.where('nationalityCountryId', '==', obj.nationalityId!)
      )
      .$if(obj.gender != undefined, (qb) =>
        qb.where('gender', '==', obj.gender!)
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          DriverService.getDriversSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a driver by its ID
   *
   * @param driverId The ID of the driver to get */
  @Get('{driverId}')
  getById(driverId: string): Promise<DriverDTO | undefined> {
    return DriverService.getDriversSelect(this.db.selectFrom('drivers'))
      .where('id', '==', driverId)
      .executeTakeFirst();
  }

  /** Get the family relationship of a driver
   *
   * @param driverId The ID of the driver to get its relationship */
  @Get('{driverId}/relationships')
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

  /** Get the seasons where a specific driver has participated in at least one race or event
   *
   * @param driverId The ID of the driver to get */
  @Get('{driverId}/seasons')
  async getDriverSeasons(@Path() driverId: string) {
    const toReturn = await this.db
      .selectFrom('raceResults')
      .innerJoin('eventEntrants', 'eventEntrants.id', 'raceResults.entrantId')
      .where('driverId', '==', driverId)
      .select([sql<number>`cast(substr(sessionId, 1, 4) as INT)`.as('year')])
      .groupBy('year')
      .execute();

    return toReturn.map((x) => x.year);
  }

  /** Get WDC results of this driver */ @Get('{driverId}/championship-results')
  async getChampionshipResults(@Path() driverId: string) {
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
