import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { ChassisDTO, DB } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ConstructorService } from '../constructor/constructor.service';

export class ChassisService extends DbService {
  static getChassisSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'chassis', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['id', 'name'] as const;

    return (qb as SelectQueryBuilder<DB, 'chassis', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'chassis.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('chassisConstructor'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            ConstructorService.getConstructorsSelect(
              eb.selectFrom('constructors'),
              fieldsParam?.clone('chassisConstructor')
            ).whereRef('chassis.constructorId', '==', 'constructors.id')
          ).as('chassisConstructor')
        )
      ) as SelectQueryBuilder<DB, 'chassis' | T, ChassisDTO>;
  }
}
