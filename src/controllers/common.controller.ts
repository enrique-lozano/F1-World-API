import { Controller } from 'tsoa';
import { HttpException } from '../utils/custom-error';

export class CommonController extends Controller {
  protected async tryKyselyExecution<T>(toReturn: Promise<T>) {
    try {
      return await toReturn;
    } catch (err) {
      throw HttpException.fromSqliteError(err) ?? err;
    }
  }
}
