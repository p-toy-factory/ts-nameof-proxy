import { pathOf } from "../src";
import { student } from "./fixtures";

describe("pathOf", () => {
	test("Do not use type parameter", () => {
		const separatedPathIncludesAge = pathOf(student, (s) => s.age);
		const separatedPathIncludesNameAndZero = pathOf(student, (s) => s.name[0]);

		expect(separatedPathIncludesAge).toEqual(["age"]);
		expect(separatedPathIncludesNameAndZero).toEqual(["name", "0"]);
	});

	test("Use type parameter", () => {
		const separatedPathIncludesAge = pathOf<typeof student>((s) => s.age);
		const separatedPathIncludesNameAndZero = pathOf<typeof student>(
			(s) => s.name[0]
		);

		expect(separatedPathIncludesAge).toEqual(["age"]);
		expect(separatedPathIncludesNameAndZero).toEqual(["name", "0"]);
	});

	test("Get the separated path of the function", () => {
		const separatedPathIncludesCall = pathOf(
			() => {},
			(fn) => fn.call
		);
		expect(separatedPathIncludesCall).toStrictEqual(["call"]);
	});
});
