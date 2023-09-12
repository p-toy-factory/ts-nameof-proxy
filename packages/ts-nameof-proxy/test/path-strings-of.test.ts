import { pathStringsOf } from "../src";
import { student } from "./fixtures";

describe("pathStringsOf", () => {
	test("Do not use type parameter", () => {
		const paths = pathStringsOf(student, (s) => (s.age, s.name.length[0]));
		expect(paths).toStrictEqual(["['age']", "['name']['length']['0']"]);
	});

	test("Use type parameter", () => {
		const paths = pathStringsOf<typeof student>(
			(s) => (s.age, s.name.length[0])
		);
		expect(paths).toStrictEqual(["['age']", "['name']['length']['0']"]);
	});

	test("Get the path of the function", () => {
		const paths = pathStringsOf(
			() => {},
			(fn) => fn.call
		);
		expect(paths).toStrictEqual(["['call']"]);
	});

	test("Do nothing", () => {
		const paths = pathStringsOf(student, () => {});
		expect(paths).toStrictEqual([]);
	});
});
