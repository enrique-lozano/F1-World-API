import { HttpException } from '../../utils/custom-error';
import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { DB, GrandsPrixDTO } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { CountryService } from '../countries/countries.service';
import {
  GrandPrixController,
  GrandPrixQueryParams
} from './grandPrix.controller';

export class GrandPrixService
  extends DbService
  implements Pick<GrandPrixController, 'get' | 'getById'>
{
  static getGrandPrixSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'grandsPrix', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'countryId',
      'fullName',
      'id',
      'name',
      'shortName'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'grandsPrix', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'grandsPrix.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('grandsPrix.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      ) as SelectQueryBuilder<DB, 'grandsPrix' | T, GrandsPrixDTO>;
  }

  async get(
    obj: GrandPrixQueryParams
  ): Promise<PageMetadata & { data: GrandsPrixDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db
      .selectFrom('grandsPrix')
      .where('grandsPrix.fullName', 'like', `%${obj.name ?? ''}%`)
      .where(
        'grandsPrix.countryId',
        obj.countryId ? '=' : 'like',
        obj.countryId ? obj.countryId : '%%'
      );

    return this.paginateSelect(
      mainSelect,
      GrandPrixService.getGrandPrixSelect(mainSelect),
      paginator
    ).executeTakeFirstOrThrow();
  }

  getById(id: string): Promise<GrandsPrixDTO> {
    return GrandPrixService.getGrandPrixSelect(this.db.selectFrom('grandsPrix'))
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
