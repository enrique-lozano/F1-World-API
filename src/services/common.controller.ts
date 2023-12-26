import { Controller } from 'tsoa';
import { HttpException } from '../utils/custom-error';

export class CommonController extends Controller {
  protected async tryKyselyExecution<T extends Promise<unknown>>(toReturn: T) {
    try {
      return await toReturn;
    } catch (err) {
      if (!err.message) throw err;

      const match = /no such column: (\w+)/.exec(err.message);

      if (err.code == 'SQLITE_ERROR' && match) {
        const missingColumn = match[1];
        throw HttpException.noSuchColumn(missingColumn);
      }

      throw err;
    }
  }
}
