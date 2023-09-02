import { namesOf } from "../src/names-of";
import { student } from "./fixtures";

describe("namesOf", () => {
	test("Do not use type parameter", () => {
		const paths = namesOf(student, (s) => (s.age, s.name.length));
		expect(paths).toStrictEqual(["age", "length"]);
	});

	test("Use type parameter", () => {
		const paths = namesOf<typeof student>((s) => (s.age, s.name.length));
		expect(paths).toStrictEqual(["age", "length"]);
	});

	test("Get the path of the function", () => {
		const paths = namesOf(
			() => {},
			(fn) => fn.call
		);
		expect(paths).toStrictEqual(["call"]);
	});

	test("Do nothing", () => {
		const paths = namesOf(student, () => {});
		expect(paths).toStrictEqual([]);
	});
});
