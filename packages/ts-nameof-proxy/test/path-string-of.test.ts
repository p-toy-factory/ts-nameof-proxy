import { pathStringOf } from "../src";
import { student } from "./fixtures";

describe("pathStringOf", () => {
	test("Do not use type parameter", () => {
		const path = pathStringOf(student, (s) => s.name[0]);
		expect(path).toBe("['name']['0']");
	});

	test("Use type parameter", () => {
		const path = pathStringOf<typeof student>((s) => s.name[0]);
		expect(path).toBe("['name']['0']");
	});

	test("Get the path of the function", () => {
		const path = pathStringOf(
			() => {},
			(fn) => fn.call
		);
		expect(path).toBe("['call']");
	});
});
