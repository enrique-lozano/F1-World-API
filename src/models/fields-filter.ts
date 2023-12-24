/** A interface to define only the optional `field` param */
export interface FieldsQueryParam {
  /** Comma separated string containing the fields to return  */
  fields?: string;
}

export class FieldsParam implements FieldsQueryParam {
  fields?: string;

  constructor(fieldsString?: string | null) {
    if (fieldsString) this.fields = fieldsString;
  }

  getFilteredFieldsArray<T extends string>(
    fieldsThatCanBeReturned: Readonly<T[]>
  ) {
    const fieldsArray = this.getFieldsArray();

    if (!fieldsArray || fieldsArray.length === 0) return null;

    return fieldsArray.filter((x) =>
      fieldsThatCanBeReturned.includes(x as any)
    ) as T[];
  }

  getFieldsArray(startWith?: string) {
    if (!this.fields) return null;

    const arrayToReturn = this.fields.replaceAll(' ', '').split(',');

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

  shouldSelectKey(key: string) {
    if (!this.fields) return true;

    const fieldsArray = this.getFieldsArray();

    return fieldsArray != null && fieldsArray.some((x) => x === key);
  }

  shouldSelectObject(key: string) {
    if (!this.fields) return true;

    const fieldsArray = this.getFieldsArray();

    return (
      fieldsArray != null &&
      (fieldsArray.some((x) => x === key) ||
        fieldsArray.some((x) => x.startsWith(`${key}.`)))
    );
  }

  clone(startWith?: string) {
    return new FieldsParam(this.getFieldsArray(startWith)?.join(','));
  }

  static fromFieldQueryParam(obj: FieldsQueryParam) {
    return new FieldsParam(obj.fields);
  }

  static fromFieldsArray(fieldsArray?: string[]) {
    return new FieldsParam(fieldsArray?.join(','));
  }
}
