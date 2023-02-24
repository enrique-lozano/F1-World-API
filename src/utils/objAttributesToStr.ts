import { ConvertAllAttributesToString } from './types';

/** Convert all the attributes of an object to string (if possible) */
function objectAttributesToString<T extends object>(object: T) {
  Object.keys(object).forEach((k) => {
    const key = k as keyof T;

    object[key] = String(object[key]) as any;

    return;
  });

  return object as ConvertAllAttributesToString<T>;
}

/** Remove the null/undefined or the empty properties of an object */
function removeEmpty<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v != '')
  ) as Partial<T>;
}

/** Parse the query params of a call, removing undefined values and converting all properties to a string
 *
 * @param queryParams An object with the query params
 * @param toRemove Array of keys to delete from the final param object
 */
export function parseQueryParams<T extends object, K extends keyof T>(
  queryParams: T,
  toRemove?: K[]
) {
  if (typeof queryParams != 'object') {
    throw new Error(
      'Query params should be provided as an object to be parsed'
    );
  }

  if (toRemove) {
    Object.keys(toRemove).forEach((key) => {
      delete queryParams[key as keyof T];
    });
  }

  return removeEmpty(objectAttributesToString(queryParams));
}
