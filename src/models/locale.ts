/** The optional `locale` query parameter, used to translate some content (e.g. the country names) */
export interface LocaleQueryParam {
  /**
   * Language of the translated content, as a BCP 47 tag (`en`, `es`, `pt-BR`...).
   *
   * @default "en"
   */
  locale?: string;
}
