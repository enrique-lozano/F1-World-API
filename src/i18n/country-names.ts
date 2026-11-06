import { AsyncLocalStorage } from 'node:async_hooks';

/** Locale used when the request does not specify one */
export const DEFAULT_LOCALE = 'en';

/** Locale of the request that is currently being processed */
export const requestLocale = new AsyncLocalStorage<string>();

const displayNames = new Map<string, Intl.DisplayNames>();

/**
 * Whether the string is a valid locale that this Node.js build can translate
 * region names to (e.g. `en`, `es`, `pt-BR`)
 */
export function isSupportedLocale(locale: string) {
  try {
    return Intl.DisplayNames.supportedLocalesOf([locale]).length > 0;
  } catch {
    return false;
  }
}

/**
 * Name of a country in the locale of the current request (English by
 * default). Translated on the fly with the ICU data bundled in Node.js, so no
 * translations need to be stored in the database.
 */
export function getCountryName(
  alpha2Code: string,
  locale = requestLocale.getStore() ?? DEFAULT_LOCALE
) {
  let names = displayNames.get(locale);

  if (!names) {
    names = new Intl.DisplayNames([locale], { type: 'region' });
    displayNames.set(locale, names);
  }

  return names.of(alpha2Code.toUpperCase()) ?? alpha2Code;
}
