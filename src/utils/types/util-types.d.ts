/** Converts an attribute to a string
 *
 * Is null sensitive, so if the attribute has the type `xxx | null` the return type will be `string | null`
 */
export type ConvertToString<Attribute> = null extends Attribute
  ? string | null
  : string;

/**
 * Convert all attributes of a prototype to a string.
 *
 * Is null sensitive, so if an attribute has the type `xxx | null` the return type will be `string | null`
 * */
export type ConvertAllAttributesToString<PropType> = {
  [PropertyKey in keyof PropType]: ConvertToString<PropType[PropertyKey]>;
};

/**
 * Convert certain attributes of a prototype to a string.
 *
 * Is null sensitive, so if an attribute has the type `xxx | null` the return type will be `string | null`
 * */
export type ConvertAttributesToString<
  PropType,
  toConvertKeys extends keyof PropType
> = {
  [PropertyKey in keyof PropType]: PropertyKey extends toConvertKeys
    ? ConvertToString<PropType[PropertyKey]>
    : PropType[PropertyKey];
};

/** Merge the attributes of the second object in the attributes of the first */
export type Modify<T, R> = Omit<T, keyof R> & R;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type NestedKeyOf<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<NestedKeyOf<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;
