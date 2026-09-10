import { pathsOf } from "./paths-of.ts";
import type { NameSelector } from "./types.ts";
import { last } from "./utils.ts";

/**
 * @example
 * namesOf(student, (s) => (s.age, s.name.length));  // ["age", "length"]
 * namesOf<Student>((s) => (s.age, s.name.length));  // ["age", "length"]
 */
export function namesOf<T>(selector: NameSelector<T>): string[];
export function namesOf<T>(obj: T, selector: NameSelector<T>): string[];

export function namesOf<T>(
  objOrSelector: T | NameSelector<T>,
  selectorOrNil?: NameSelector<T>,
): string[] {
  return pathsOf<T>(objOrSelector as T, selectorOrNil).map(last);
}
