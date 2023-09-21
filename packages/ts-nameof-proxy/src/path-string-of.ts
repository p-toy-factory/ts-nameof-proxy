import { pathStringsOf } from "./path-strings-of";
import { NameSelector } from "./types";

/**
 * @example
 * pathStringOf(student, (s) => s.name.firstName[0]); // "['name']['firstName']['0']"
 * pathStringOf<Student>((s) => s.name.firstName[0]); // "['name']['firstName']['0']"
 */
export function pathStringOf<T>(selector: NameSelector<T>): string;
export function pathStringOf<T>(obj: T, selector: NameSelector<T>): string;

export function pathStringOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string {
	// @ts-ignore
	const separatedPath = pathStringsOf(arg1, arg2);
	if (separatedPath.length === 0) {
		throw new Error("ts-nameof-proxy: No properties were read.");
	}
	return separatedPath[0];
}
