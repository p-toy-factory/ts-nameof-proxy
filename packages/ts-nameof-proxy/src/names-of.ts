import { pathsOf } from "./paths-of";
import { NameSelector } from "./types";
import { last } from "./utils";

/**
 * @example
 * namesOf(student, (s) => (s.age, s.name.length));  // ["age", "length"]
 * namesOf<Student>((s) => (s.age, s.name.length));  // ["age", "length"]
 */
export function namesOf<T>(callback: NameSelector<T>): string[];
export function namesOf<T>(obj: T, callback: NameSelector<T>): string[];

export function namesOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[] {
	return pathsOf(arg1, arg2).map(last);
}
