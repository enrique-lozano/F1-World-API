/**
 * Interface to define the optional `include` query parameter according to JSON API specifications.
 * The `include` parameter allows clients to request related resources be included in the response.
 *
 * @interface IncludeQueryParam
 * @see {@link https://jsonapi.org/format/#fetching-includes | JSON API Specification - Fetching Includes}
 * */
export interface IncludeQueryParam {
  /**
   * A comma-separated string specifying the related resources or fields to include in the response.
   * If a relationship attribute is an object or has nested attributes, you can use dot notation to specify the attributes to include for that object.
   *
   * #### Examples:
   * - To include the author and comments for a post: `include=author,comments`
   * - To include only specific attributes of related objects: `include=author.name,comments.text`
   *
   * @see {@link https://jsonapi.org/format/#fetching-includes | JSON API Specification - Fetching Includes}
   * */
  include?: string;
}

/** The class that implement the 'include' query param with more utilities */
export class IncludeParam implements IncludeQueryParam {
  include?: string;

  constructor(fieldsString?: string | null) {
    if (fieldsString != undefined) this.include = fieldsString;
  }

  /** Filter the `include` query param to return only the specified elements */
  getFilteredFieldsArray<T extends string>(
    fieldsThatCanBeReturned: Readonly<T[]>
  ) {
    const fieldsArray = this.getFieldsArray();

    if (!fieldsArray || fieldsArray.length === 0)
      return fieldsThatCanBeReturned;

    return fieldsArray.filter((x) =>
      fieldsThatCanBeReturned.includes(x as any)
    ) as T[];
  }

  /** Get the array of fields that the `include` attribute represents. That is, split the `include` query param using the comma as a separator.
   *
   * @param startWith If defined, the returned array will only take into account the attributes of the specified nested key
   * */
  getFieldsArray(startWith?: string) {
    if (!this.include) return null;

    const arrayToReturn = this.include.replaceAll(' ', '').split(',');

    if (arrayToReturn.length === 0) return null;

    if (startWith && startWith.length > 0) {
      const toReturn = arrayToReturn
        .filter((x) => x.startsWith(`${startWith}.`))
        .map((y) => y.slice(startWith.length + 1));

      if (toReturn.length === 0) return null;

      return toReturn;
    }

    return arrayToReturn;
  }

  /** Get if a key is present in the `include` param */
  shouldSelectKey(key: string) {
    if (!this.include) return true;

    const fieldsArray = this.getFieldsArray();

    return fieldsArray != null && fieldsArray.some((x) => x === key);
  }

  /** Get if a resource/object is present in the `include` param */
  shouldSelectObject(key: string) {
    if (!this.include) return true;

    const fieldsArray = this.getFieldsArray();

    return (
      fieldsArray != null &&
      (fieldsArray.some((x) => x === key) ||
        fieldsArray.some((x) => x.startsWith(`${key}.`)))
    );
  }

  clone(startWith?: string) {
    return new IncludeParam(this.getFieldsArray(startWith)?.join(','));
  }

  static fromFieldQueryParam(obj: IncludeQueryParam) {
    return new IncludeParam(obj.include);
  }

  static fromFieldsArray(fieldsArray?: string[]) {
    return new IncludeParam(fieldsArray?.join(','));
  }
}
