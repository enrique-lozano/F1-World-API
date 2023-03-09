import { HttpStatusCodeLiteral, TsoaResponse } from 'tsoa';
import { ErrorCodes } from './error-codes';

export function sendTsoaError<T extends HttpStatusCodeLiteral>(
  tsoaFunc: TsoaResponse<T, ErrorMessage<T>, {}>,
  status: T,
  errorCode: keyof typeof ErrorCodes
) {
  return tsoaFunc(status, new ErrorMessage(status, errorCode));
}

export class ErrorMessage<T extends HttpStatusCodeLiteral> {
  status: T;
  code: string;
  details: string;

  constructor(status: T, code: keyof typeof ErrorCodes) {
    this.status = status;
    this.code = code;
    this.details = ErrorCodes[code];
  }
}
