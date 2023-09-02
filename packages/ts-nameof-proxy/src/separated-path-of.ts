import { separatedPathsOf } from "./separated-paths-of";
import { NameSelector } from "./types";

/**
 * @example
 * separatedPathOf(student, (s) => s.age);          // ["age"]
 * separatedPathOf(student, (s) => s.name.length);  // ["name", "length"]
 * separatedPathOf<Student>((s) => s.name.length);  // ["name", "length"]
 */
export function separatedPathOf<T>(callback: NameSelector<T>): string[];
export function separatedPathOf<T>(
	obj: T,
	callback?: NameSelector<T>
): string[];

export function separatedPathOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[] {
	return separatedPathsOf(arg1, arg2)[0] ?? [];
}
