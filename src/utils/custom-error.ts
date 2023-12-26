import { HttpStatusCodeLiteral, TsoaResponse } from 'tsoa';
import i18n from '../i18n/i18n-config';
import enTranslations from '../i18n/locales/en.json';

export function sendTsoaError<T extends HttpStatusCodeLiteral>(
  tsoaFunc: TsoaResponse<T, HttpException, object>,
  status: T,
  errorCode: keyof typeof enTranslations.HTTP_ERRORS
) {
  return tsoaFunc(status, HttpException.fromStatusAndCode(status, errorCode));
}

export interface JsonApiError {
  /** HTTP Status code of the response.
   *
   * @see {@link https://restfulapi.net/http-status-codes/ | HTTP status codes}
   */
  status: HttpStatusCodeLiteral;

  /** An application-specific error code, expressed as a string value */
  code: string;

  /** The error title */
  title: string;

  /** A human-readable explanation of the problem */
  detail?: string;
}

export class HttpException extends Error implements JsonApiError {
  status: HttpStatusCodeLiteral;
  code: string;
  detail?: string;
  title: string;

  /**
   * @param params Params to construct the `details` attribute of the response.
   */
  constructor(data: JsonApiError) {
    super(data.title);

    this.title = data.title;
    this.status = data.status;
    this.code = data.code;
    this.detail = data.detail;
  }

  toJsonApiError() {
    return {
      code: this.code,
      status: this.status,
      title: this.title,
      detail: this.detail
    } satisfies JsonApiError;
  }

  /** Create a `HttpException` instance from a status an a translate key from the `HTTP_ERRORS` in the locales json files.*/
  static fromStatusAndCode(
    status: HttpStatusCodeLiteral,
    key: keyof typeof enTranslations.HTTP_ERRORS,
    translateInterpolateParams?: {
      title?: Record<string, string>;
      detail?: Record<string, string>;
    }
  ) {
    return new HttpException({
      status,
      code: key.toLocaleUpperCase(),
      title: i18n.t(
        `HTTP_ERRORS.${key}.title`,
        translateInterpolateParams?.title
      ),
      detail: i18n.t(
        `HTTP_ERRORS.${key}.detail`,
        translateInterpolateParams?.detail
      )
    });
  }

  /** A HttpException with a 400 status */
  static resourceNotFound(
    key: keyof typeof enTranslations.HTTP_ERRORS.not_found.descriptions
  ) {
    return new HttpException({
      status: 400,
      code:
        `${key != 'default' ? key.toLocaleUpperCase() + '_' : ''}` +
        'NOT_FOUND',
      title: i18n.t(`HTTP_ERRORS.not_found.title`),
      detail: i18n.t(`HTTP_ERRORS.not_found.descriptions.${key}`)
    });
  }

  static noSuchColumn(missingColumn: string) {
    return HttpException.fromStatusAndCode(400, 'no_such_column', {
      detail: { column: missingColumn }
    });
  }
}
