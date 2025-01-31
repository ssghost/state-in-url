import { SYMBOLS } from '../constants';
import { type JSONCompatible, typeOf } from '../utils';

/**
 * Encode any JSON serializable value to URL friendly string
 *
 * @param {unknown} payload any value to serialize
 * @returns {string} URLSearchParams compatible value string
 *
 *  * Docs {@link https://github.com/asmyshlyaev177/state-in-url/tree/main/packages/urlstate/encoder#encode}
 */
export function encode(payload: unknown): string {
  if (isEncoded(payload)) {
    return String(payload);
  }

  const type = typeOf(payload);

  switch (type) {
    case 'function':
    case 'symbol':
      return '';
    case 'date':
      return encodeDate(payload as Date);
    case 'string':
      return `${SYMBOLS.string}${encodeURIComponent(payload as string)}`;
    case 'number':
      return SYMBOLS.number + String(payload as number);
    case 'boolean':
      return SYMBOLS.boolean + String(payload as boolean);
    case 'object':
    case 'array':
      return JSON.stringify(payload as object, replacer).replaceAll('"', "'");
    case 'null':
      return SYMBOLS.null;
    case 'undefined':
      return SYMBOLS.undefined;
    default:
      return String(payload);
  }
}

export const replacer = (_key: string, value: unknown) => {
  const type = typeOf(value);

  let _value = structuredClone(value);

  if (type === 'object' || type === 'array') {
    _value = _value as object | Array<unknown>;
    Object.keys(_value as object | Array<unknown>).forEach((_key) => {
      const val = (_value as { [key: string]: unknown })[_key] as Date;

      if (typeOf(val) === 'date') {
        (_value as { [key: string]: unknown })[_key] = encodeDate(val);
      }
    });
  }
  return type !== 'object' && type !== 'array' ? encode(_value) : _value;
};

function encodeDate(val: Date) {
  return SYMBOLS.date + new Date(val).toISOString();
}

export type Primitive = Exclude<
  ReturnType<typeof decodePrimitive>,
  typeof errorSym
>;

/**
 * Decode value part of URLSearchParams back to JS value
 *
 * @param {string} payload URLSearchParams compatible value string
 * @param {any} fallback optional fallback value
 * @returns {unknown} decoded object
 *
 *  * Docs {@link https://github.com/asmyshlyaev177/state-in-url/tree/main/packages/urlstate/encoder#decode}
 */
export function decode<T>(payload: string, fallback?: T) {
  return parseJSON(payload.replaceAll("'", '"'), fallback as JSONCompatible);
}

export const decodePrimitive = (str: string) => {
  if (str === SYMBOLS.null) return null;
  if (str === SYMBOLS.undefined) return undefined;
  if (str?.startsWith?.(SYMBOLS.number))
    return Number.parseFloat(str.replace(SYMBOLS.number, ''));
  if (str?.startsWith?.(SYMBOLS.boolean))
    return str.includes('true') ? true : false;
  if (str?.startsWith?.(SYMBOLS.date)) return new Date(str.slice(1));

  if (str?.startsWith?.(SYMBOLS.string))
    return decodeURIComponent(str).replace(/^◖/, '');

  return errorSym;
};

export const errorSym = Symbol('isError');

export const reviver = (_key: string, value: unknown) => {
  const isStr = typeof value === 'string';
  const decoded = isStr && decodePrimitive(value);
  if (decoded === errorSym) return value;
  return isStr ? decoded : value;
};

/**
 * Parses a JSON string into a TypeScript object.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @param {T} [fallbackValue] - The fallback value to use if parsing fails.
 * @return {T | Primitive | undefined} - The parsed object or a primitive value, or undefined if parsing fails.
 *
 *  * Docs {@link https://github.com/asmyshlyaev177/state-in-url}
 */
export function parseJSON<T extends JSONCompatible>(
  jsonString: string,
  fallbackValue?: T,
): T | Primitive | undefined {
  try {
    return JSON.parse(jsonString, reviver) as T;
  } catch {
    const decodedValue = decodePrimitive(jsonString);
    return decodedValue !== errorSym ? decodedValue : fallbackValue;
  }
}

const isEncoded = (val: unknown) =>
  new RegExp(
    `^(${SYMBOLS.string}|${SYMBOLS.boolean}|${SYMBOLS.null}|${SYMBOLS.undefined}|${SYMBOLS.number}|${SYMBOLS.date})`,
  ).test(String(val));
