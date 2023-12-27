/** Remove the null/undefined or the empty properties of an object */
export function removeEmptyAttributes<T extends object>(obj: T) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, v]) => v != null && v != '')
  ) as Partial<T>;
}
