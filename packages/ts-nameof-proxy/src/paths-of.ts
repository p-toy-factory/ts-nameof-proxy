import { separatedPathsOf } from "./separated-paths-of";
import { NameSelector } from "./types";

/**
 * @example
 * unstable_pathsOf(student, (s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 * unstable_pathsOf<Student>((s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
 */
export function pathsOf<T>(callback: NameSelector<T>): string[];
export function pathsOf<T>(obj: T, callback: NameSelector<T>): string[];

export function pathsOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[] {
	return separatedPathsOf(arg1, arg2).map(
		(separatedPath) => "['" + separatedPath.join("']['") + "']"
	);
}
