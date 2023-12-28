import { pathsOf } from "./paths-of";
import { NameSelector } from "./types";

/**
 * @example
 * pathStringsOf(student, (s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 * pathStringsOf<Student>((s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 */
export function pathStringsOf<T>(selector: NameSelector<T>): string[];
export function pathStringsOf<T>(obj: T, selector: NameSelector<T>): string[];

export function pathStringsOf<T>(
	objOrSelector: T | NameSelector<T>,
	selectorOrNil?: NameSelector<T>,
): string[] {
	return pathsOf(objOrSelector, selectorOrNil).map(mapper);
}

function mapper(separatedPath: string[]) {
	return `['${separatedPath.join("']['")}']`;
}
