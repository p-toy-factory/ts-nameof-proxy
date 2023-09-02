import { pathsOf } from "../src/paths-of";
import { student } from "./fixtures";

describe("pathsOf", () => {
	test("Do not use type parameter", () => {
		const paths = pathsOf(student, (s) => (s.age, s.name.length[0]));
		expect(paths).toStrictEqual(["['age']", "['name']['length']['0']"]);
	});

	test("Use type parameter", () => {
		const paths = pathsOf<typeof student>((s) => (s.age, s.name.length[0]));
		expect(paths).toStrictEqual(["['age']", "['name']['length']['0']"]);
	});

	test("Get the path of the function", () => {
		const paths = pathsOf(
			() => {},
			(fn) => fn.call
		);
		expect(paths).toStrictEqual(["['call']"]);
	});

	test("Do nothing", () => {
		const paths = pathsOf(student, () => {});
		expect(paths).toStrictEqual([]);
	});
});
