import { NameSelector } from "./types";
import { last } from "./utils";

/**
 * @example
 * pathsOf(student, (s) => (s.age, s.name.length));  // [["age"], ["name", "length"]]
 * pathsOf<Student>((s) => (s.age, s.name.length));  // [["age"], ["name", "length"]]
 */
export function pathsOf<T>(selector: NameSelector<T>): string[][];
export function pathsOf<T>(obj: T, selector?: NameSelector<T>): string[][];

export function pathsOf<T>(
	objOrSelector: T | NameSelector<T>,
	selectorOrNil?: NameSelector<T>,
): string[][] {
	const paths: string[][] = [];
	const handler = generateProxyHandler(paths, true);
	const proxy = new Proxy(emptyObj, handler);
	const selector = (
		typeof selectorOrNil === "function" ? selectorOrNil : objOrSelector
	) as NameSelector<T>;
	selector(proxy as T);
	return paths;
}

const emptyObj = Object.freeze({});

function generateProxyHandler(
	paths: string[][],
	isFirst: boolean,
): ProxyHandler<object> {
	return {
		get(_target, property, receiver) {
			if (typeof property === "symbol") {
				// Changing the type of the error is breaking change
				// eslint-disable-next-line unicorn/prefer-type-error
				throw new Error(
					`ts-nameof-proxy: The path cannot contain ${property.toString()}.`,
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
