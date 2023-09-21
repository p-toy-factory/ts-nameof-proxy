import { namesOf } from "./names-of";
import { NameSelector } from "./types";

/**
 * @example
 * nameOf(student, (s) => s.age);         // "age"
 * nameOf(student, (s) => s.name.length); // "length"
 * nameOf<Student>((s) => s.name.length); // "length"
 */
export function nameOf<T>(selector: NameSelector<T>): string;
export function nameOf<T>(obj: T, selector: NameSelector<T>): string;

export function nameOf<T>(
	objOrSelector: T | NameSelector<T>,
	selectorOrNil?: NameSelector<T>
): string {
	// @ts-ignore
	const names = namesOf(objOrSelector, selectorOrNil);
	if (names.length === 0) {
		throw new Error("ts-nameof-proxy: No properties were read.");
	}
	return names[0];
}
