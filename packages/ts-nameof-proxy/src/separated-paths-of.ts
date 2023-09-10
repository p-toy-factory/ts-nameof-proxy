import { NameSelector } from "./types";

/**
 * @example
 * unstable_separatedPathsOf(student, (s) => (s.age, s.name.length));  // [["age"], ["name", "length"]]
 * unstable_separatedPathsOf<Student>((s) => [s.age, s.name.length]);  // [["age"], ["name", "length"]]
 */
export function separatedPathsOf<T>(callback: NameSelector<T>): string[][];
export function separatedPathsOf<T>(
	obj: T,
	callback?: NameSelector<T>
): string[][];

export function separatedPathsOf<T>(
	arg1: T | NameSelector<T>,
	arg2?: NameSelector<T>
): string[][] {
	const paths: string[][] = [];
	const handler = generateProxyHandler(paths, true);
	const proxy = new Proxy(emptyObj, handler);
	const callback = (
		typeof arg2 === "function" ? arg2 : arg1
	) as NameSelector<T>;
	callback(proxy as T);
	return paths;
}

const emptyObj = {};

function generateProxyHandler(
	paths: string[][],
	isFirst: boolean
	// eslint-disable-next-line @typescript-eslint/ban-types
): ProxyHandler<Object> {
	return {
		get(_target, property, receiver) {
			if (typeof property === "symbol") {
				throw new Error(
					`ts-nameof-proxy: The path cannot contain ${property.toString()}.`
				);
			}
			if (isFirst) {
				paths.push([property]);
				const handler = generateProxyHandler(paths, false);
				return new Proxy(emptyObj, handler);
			}
			paths[paths.length - 1].push(property);
			return receiver;
		},
	};
}
