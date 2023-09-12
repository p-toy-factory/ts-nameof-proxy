import { pathsOf } from "../src";
import { student } from "./fixtures";

describe("pathsOf", () => {
	test("Do not use type parameter", () => {
		const paths = pathsOf(student, (s) => (s.age, s.name.length));
		expect(paths).toStrictEqual([["age"], ["name", "length"]]);
	});

	test("Use type parameter", () => {
		const paths = pathsOf<typeof student>((s) => (s.age, s.name.length));
		expect(paths).toStrictEqual([["age"], ["name", "length"]]);
	});

	test("Get the path of the function", () => {
		const paths = pathsOf(
			() => {},
			(fn) => fn.call
		);
		expect(paths).toStrictEqual([["call"]]);
	});

	test("Do nothing", () => {
		const paths = pathsOf(student, () => {});
		expect(paths).toStrictEqual([]);
	});
});
