import { separatedPathsOf } from "./separated-paths-of";
import { NameSelector } from "./types";
import { last } from "./utils";

/**
 * @example
 * unstable_namesOf(student, (s) => (s.age, s.name.length));  // ["age", "length"]
 * unstable_namesOf<Student>((s) => (s.age, s.name.length));  // ["age", "length"]
 */
export function namesOf<T>(callback: NameSelector<T>): string[];
export function namesOf<T>(obj: T, callback: NameSelector<T>): string[];

export function namesOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[] {
	return separatedPathsOf(arg1, arg2).map(last);
}
