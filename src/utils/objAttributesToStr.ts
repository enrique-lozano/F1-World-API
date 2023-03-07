import { ConvertAllAttributesToString } from './types';

/** Convert all the attributes of an object to string (if possible) */
export function objectAttributesToString<T extends object>(object: T) {
  Object.keys(object).forEach((k) => {
    const key = k as keyof T;

    object[key] = String(object[key]) as any;

    return;
  });

  return object as ConvertAllAttributesToString<T>;
}

/** Remove the null/undefined or the empty properties of an object */
export function removeEmptyAttributes<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v != '')
  ) as Partial<T>;
}

/** Parse the search query params of a call, removing undefined values. A search query param is a param that is used in the `WHERE` clause, that is, has nothing to do with the pagination or with the order.
 *
 * @param queryParams An object with the query params
 * @param toRemove Array of keys to delete from the params object passed in the first parameter on this call. Defaults to `['pageNo', 'pageSize', 'orderDir', 'orderBy']`
 */
export function parseSearchQueryParams<T extends object, K extends keyof T>(
  queryParams: T,
  toRemove: K[] = ['pageNo', 'pageSize', 'orderDir', 'orderBy'] as any
) {
  if (typeof queryParams != 'object') {
    throw new Error(
      'Query params should be provided as an object to be parsed'
    );
  }

  if (toRemove) {
    toRemove.forEach((key) => {
      delete queryParams[key as keyof T];
    });
  }

  return removeEmptyAttributes(queryParams);
}
