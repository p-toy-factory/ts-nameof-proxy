import { pathsOf } from "./paths-of.ts";
import type { NameSelector } from "./types.ts";

/**
 * @example
 * pathOf(student, (s) => s.age);          // ["age"]
 * pathOf(student, (s) => s.name.length);  // ["name", "length"]
 * pathOf<Student>((s) => s.name.length);  // ["name", "length"]
 */
export function pathOf<T>(selector: NameSelector<T>): string[];
export function pathOf<T>(obj: T, selector?: NameSelector<T>): string[];

export function pathOf<T>(
  objOrSelector: T | NameSelector<T>,
  selectorOrNil?: NameSelector<T>,
): string[] {
  return pathsOf<T>(objOrSelector as T, selectorOrNil)[0] ?? [];
}
