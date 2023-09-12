import { pathsOf } from "./paths-of";
import { NameSelector } from "./types";

/**
 * @example
 * pathStringsOf(student, (s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 * pathStringsOf<Student>((s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 */
export function pathStringsOf<T>(callback: NameSelector<T>): string[];
export function pathStringsOf<T>(obj: T, callback: NameSelector<T>): string[];

export function pathStringsOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[] {
	return pathsOf(arg1, arg2).map(mapper);
}

function mapper(separatedPath: string[]) {
	return `['${separatedPath.join("']['")}']`;
}
