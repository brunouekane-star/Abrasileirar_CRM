/**
 * Normalize a Supabase embedded relationship to a single object.
 *
 * Without generated DB types, Supabase infers to-one embeds (e.g. `company:companies(name)`)
 * as arrays at the type level, while returning a single object (or null) at runtime.
 * `one()` bridges that gap safely for both shapes.
 */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
