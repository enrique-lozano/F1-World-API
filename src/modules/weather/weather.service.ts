import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, WeatherPeriodDTO, WeatherPeriods } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session/session.service';
import { WeatherController, WeatherQueryParams } from './weather.controller';

export class WeatherService
  extends DbService
  implements Pick<WeatherController, 'get'>
{
  static getWeatherSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'weatherPeriods', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'lapStart',
      'weather',
      'airTemperature',
      'trackTemperature'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'weatherPeriods', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('weatherPeriods.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      ) as SelectQueryBuilder<DB, 'weatherPeriods' | T, WeatherPeriodDTO>;
  }

  async get(
    obj: WeatherQueryParams
  ): Promise<PageMetadata & { data: WeatherPeriodDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<WeatherPeriods>(obj.sort || 'sessionId,lapStart');

    const mainSelect = new ParamsBuilderService()
      .getSessionsWithParamas('weatherPeriods', obj)
      .$if(obj.weather != undefined, (qb) =>
        qb.where('weatherPeriods.weather', '==', obj.weather!)
      ) as unknown as SelectQueryBuilder<DB, 'weatherPeriods', object>;

    return this.paginateSelect(
      mainSelect,
      WeatherService.getWeatherSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
