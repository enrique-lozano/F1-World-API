import { ConvertAllAttributesToString } from '../types/util-types';

/** Convert all the attributes of an object to string (if possible) */
export function objectAttributesToString<T extends object>(object: T) {
  Object.keys(object).forEach((k) => {
    const key = k as keyof T;

    object[key] = String(object[key]) as any;

    return;
  });

  return object as ConvertAllAttributesToString<T>;
}
