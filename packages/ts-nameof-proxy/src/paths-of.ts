import { NameSelector } from "./types";
import { last } from "./utils";

/**
 * @example
 * pathsOf(student, (s) => (s.age, s.name.length));  // [["age"], ["name", "length"]]
 * pathsOf<Student>((s) => (s.age, s.name.length));  // [["age"], ["name", "length"]]
 */
export function pathsOf<T>(callback: NameSelector<T>): string[][];
export function pathsOf<T>(obj: T, callback?: NameSelector<T>): string[][];

export function pathsOf<T>(
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

const emptyObj = Object.freeze({});

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
			last(paths).push(property);
			return receiver;
		},
	};
}
