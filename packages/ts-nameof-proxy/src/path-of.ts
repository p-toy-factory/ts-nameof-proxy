import { pathsOf } from "./paths-of";
import { NameSelector } from "./types";

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
	selectorOrNil?: NameSelector<T>
): string[] {
	return pathsOf(objOrSelector, selectorOrNil)[0] ?? [];
}
