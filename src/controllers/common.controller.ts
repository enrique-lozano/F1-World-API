import { Controller } from 'tsoa';
import { HttpException } from '../utils/custom-error';

export class CommonController extends Controller {
  /** Awaits a query of a service. A SQLite error caused by the request becomes a 400, and no result (`undefined`, e.g. an id that does not exist) a 404 */
  protected async tryKyselyExecution<T>(toReturn: Promise<T | undefined>) {
    let res: T | undefined;
    try {
      res = await toReturn;
    } catch (err) {
      throw HttpException.fromSqliteError(err) ?? err;
    }
    if (res === undefined) throw HttpException.resourceNotFound('default');
    return res;
  }
}
