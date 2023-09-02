import { namesOf } from "./names-of";
import { NameSelector } from "./types";

/**
 * @example
 * nameOf(student, (s) => s.age);         // "age"
 * nameOf(student, (s) => s.name.length); // "length"
 * nameOf<Student>((s) => s.name.length); // "length"
 */
export function nameOf<T>(callback: NameSelector<T>): string;
export function nameOf<T>(obj: T, callback: NameSelector<T>): string;

export function nameOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string {
	// @ts-ignore
	const names = namesOf(arg1, arg2);
	if (names.length === 0) {
		throw new Error("ts-nameof-proxy: No properties were read.");
	}
	return names[0];
}
