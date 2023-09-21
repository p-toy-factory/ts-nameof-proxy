import { pathsOf } from "./paths-of";
import { NameSelector } from "./types";
import { last } from "./utils";

/**
 * @example
 * namesOf(student, (s) => (s.age, s.name.length));  // ["age", "length"]
 * namesOf<Student>((s) => (s.age, s.name.length));  // ["age", "length"]
 */
export function namesOf<T>(selector: NameSelector<T>): string[];
export function namesOf<T>(obj: T, selector: NameSelector<T>): string[];

export function namesOf<T>(
	objOrSelector: T | NameSelector<T>,
	selectorOrNil?: NameSelector<T>
): string[] {
	return pathsOf(objOrSelector, selectorOrNil).map(last);
}
