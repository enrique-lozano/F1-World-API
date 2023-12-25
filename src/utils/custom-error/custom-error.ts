import { HttpStatusCodeLiteral, TsoaResponse } from 'tsoa';
import { ErrorCodes } from './error-codes';

export function sendTsoaError<T extends HttpStatusCodeLiteral>(
  tsoaFunc: TsoaResponse<T, ErrorMessage, object>,
  status: T,
  errorCode: keyof typeof ErrorCodes
) {
  return tsoaFunc(status, new ErrorMessage(status, errorCode));
}

export class ErrorMessage {
  /** HTTP Status code of the response.
   *
   * @see {@link https://restfulapi.net/http-status-codes/ | HTTP status codes}
   */
  status: HttpStatusCodeLiteral;

  /** An application-specific error code, expressed as a string value */
  code: string;

  /** A human-readable explanation of the problem */
  details: string;

  /**
   * @param params Params to construct the `details` attribute of the response.
   */
  constructor(
    status: HttpStatusCodeLiteral,
    code: keyof typeof ErrorCodes,
    ...params: string[]
  ) {
    this.status = status;
    this.code = code;
    this.details = this.formatErrorMessage(ErrorCodes[code], ...params);
  }

  static columnNotFound(missingColumn: string) {
    return new ErrorMessage(400, 'column.not.found', missingColumn);
  }

  private formatErrorMessage(message: string, ...params: string[]): string {
    return params.reduce((formattedMessage, param, index) => {
      return formattedMessage.replace(`{${index}}`, param);
    }, message);
  }
}
