export type Type =
  | 'string'
  | 'date'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'undefined'
  | 'object'
  | 'null'
  | 'function'
  | 'symbol'
  | 'array';

/**
 * A better replacement for `typeof`
 *
 * @param {unknown} val value to detect type
 * @returns {Type} Type of val - `string`, `date`, `boolean`,
 * `number`, `bigint`, `undefined`, `null`, `object`,
 * `function`, `symbol`, `array`
 */
export const typeOf = (val: unknown): Type => {
  const nativeType = typeof val;
  const isNull = val === null;
  const isArray = Array.isArray(val);
  const isDate = val instanceof Date;
  const isObject = !isNull && !isDate && !isArray && nativeType === 'object';

  return (
    (isNull && 'null') ||
    (isDate && 'date') ||
    (isArray && 'array') ||
    (isObject && 'object') ||
    nativeType
  );
};

export const isSSR = () => typeof window === 'undefined';

export type JSON =
  | null
  | boolean
  | Date
  | number
  | string
  | { [prop: string]: JSON | JSON[] };

export type JSONCompatible = {
  [prop: string]: JSON | JSON[];
};

// TODO: or this https://github.com/ts-essentials/ts-essentials/tree/master/lib/deep-readonly
// https://github.com/microsoft/TypeScript/issues/13923

// Always will be some compromise between how strict checks are and readability
export type DeepReadonly<T> =
  T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends Set<infer S>
      ? ReadonlySet<DeepReadonly<S>>
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T;

export const getParams = (strOrSearchParams?: string | URLSearchParams) =>
  new URLSearchParams(
    typeof strOrSearchParams === 'string'
      ? getQueryFromHref(strOrSearchParams)
      : strOrSearchParams?.toString?.() || '',
  );

const getQueryFromHref = (str: string) => str.split('?')?.[1] || str || '';

export type UnknownObj = { [key: string]: unknown };

export const isEqual = (val1: unknown, val2: unknown) =>
  JSON.stringify(val1) === JSON.stringify(val2);
