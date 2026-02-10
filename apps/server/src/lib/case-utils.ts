/**
 * Thin transform utilities: snake_case (DB) <-> camelCase (app).
 */

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Convert a single DB row (snake_case) to camelCase. Handles nested objects/arrays. */
export function toCamel<T = Record<string, unknown>>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(toCamel) as T;
  if (typeof obj !== "object") return obj as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const camelKey = snakeToCamel(key);
    if (Array.isArray(value)) {
      result[camelKey] = value.map(toCamel);
    } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
      result[camelKey] = toCamel(value);
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

/** Convert an array of DB rows to camelCase. */
export function toCamelArray<T = Record<string, unknown>>(arr: unknown[]): T[] {
  return arr.map((item) => toCamel<T>(item));
}

/**
 * Unwrap a PostgREST joined relation that always returns an array.
 * For 1:1 relations, returns the first element or null.
 */
export function unwrapSingle<T>(value: unknown): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  if (value !== null && value !== undefined) return value as T;
  return null;
}

/** Convert a camelCase object to snake_case for DB inserts/updates. */
export function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}
