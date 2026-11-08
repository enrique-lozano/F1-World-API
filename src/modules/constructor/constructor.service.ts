import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import {
  CareerStats,
  ConstructorDTO,
  Constructors,
  DB
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { CareerService } from '../career.service';
import { CountryService } from '../countries/countries.service';
import {
  ConstructorController,
  ConstructorQueryParams
} from './constructor.controller';

export class ConstructorService
  extends DbService
  implements
    Pick<
      ConstructorController,
      'get' | 'getById' | 'getConstructorSeasons' | 'getConstructorStats'
    >
{
  static getConstructorsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'constructors', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'name',
      'fullName',
      'wikiUrl',
      'summary',
      'photo'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'constructors', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'constructors.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('constructors.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      )
      .$if(fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(ConstructorService.firstSeasonExpression.as('firstSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(ConstructorService.lastSeasonExpression.as('lastSeason'))
      ) as SelectQueryBuilder<DB, 'constructors' | T, ConstructorDTO>;
  }

  private static get firstSeasonExpression() {
    return CareerService.entrySeasonExpression(
      'chassisManufacturerId',
      'constructors.id',
      'min'
    );
  }

  private static get lastSeasonExpression() {
    return CareerService.entrySeasonExpression(
      'chassisManufacturerId',
      'constructors.id',
      'max'
    );
  }

  async get(
    obj: ConstructorQueryParams
  ): Promise<PageMetadata & { data: ConstructorDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Constructors>(obj.sort || 'name');

    const mainSelect = this.db
      .selectFrom('constructors')
      .$if(obj.name != undefined, (qb) => {
        const name = `%${obj.name!.toLocaleLowerCase()}%`;

        return qb.where((eb) =>
          eb.or([
            eb(sql`LOWER(constructors.name)`, 'like', name),
            eb(sql`LOWER(constructors.fullName)`, 'like', name)
          ])
        );
      })
      .$if(obj.countryId != undefined, (qb) =>
        qb.where('constructors.countryId', '==', obj.countryId!)
      );

    return this.paginateSelect(
      mainSelect,
      ConstructorService.getConstructorsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        firstSeason: ConstructorService.firstSeasonExpression,
        lastSeason: ConstructorService.lastSeasonExpression
      }
    ).executeTakeFirstOrThrow();
  }

  getById(id: string, fields?: IncludeQueryParam): Promise<ConstructorDTO> {
    return ConstructorService.getConstructorsSelect(
      this.db.selectFrom('constructors'),
      IncludeParam.fromFieldQueryParam(fields ?? {})
    )
      .where('constructors.id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  async getConstructorSeasons(id: string) {
    await this.checkExists(id);

    return new CareerService().getEntrySeasons('chassisManufacturerId', id);
  }

  async getConstructorStats(id: string): Promise<CareerStats> {
    await this.checkExists(id);

    return new CareerService().getStats('chassisManufacturerId', id);
  }

  private async checkExists(id: string) {
    await this.db
      .selectFrom('constructors')
      .select('id')
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
