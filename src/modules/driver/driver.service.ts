import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../../models/pagination';
import { DB, DriverDTO, Gender } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { getSeasonFromIdColumn } from '../../utils/f1-sql-common-utils';
import { CountryService } from '../countries/countries.service';
import { DriverStandingService } from '../driver-standings.controller';
import { DriverController } from './driver.controller';

export interface DriverQueryParams extends PageQueryParams, IncludeQueryParam {
  /** Filter drivers by its full name */
  name?: string;

  /** Filter drivers by its nationality */
  nationalityId?: string;

  /** Filter drivers by its gender */
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

    const mainSelect = this.db
      .selectFrom('drivers')
      .where('drivers.fullName', 'like', `%${obj.name ?? ''}%`)
      .$if(obj.nationalityId != undefined, (qb) =>
        qb.where('nationalityCountryId', '==', obj.nationalityId!)
      )
      .$if(obj.gender != undefined, (qb) =>
        qb.where('gender', '==', obj.gender!)
      );

    return this.paginateSelect(
      mainSelect,
      DriverService.getDriversSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator
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
