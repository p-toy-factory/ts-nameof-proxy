import { separatedPathOf } from "../src";
import { student } from "./fixtures";

describe("separatedPathOf", () => {
	test("Do not use type parameter", () => {
		const separatedPathIncludesAge = separatedPathOf(student, (s) => s.age);
		const separatedPathIncludesNameAndZero = separatedPathOf(
			student,
			(s) => s.name[0]
		);

		expect(separatedPathIncludesAge).toEqual(["age"]);
		expect(separatedPathIncludesNameAndZero).toEqual(["name", "0"]);
	});

	test("Use type parameter", () => {
		const separatedPathIncludesAge = separatedPathOf<typeof student>(
			(s) => s.age
		);
		const separatedPathIncludesNameAndZero = separatedPathOf<typeof student>(
			(s) => s.name[0]
		);

		expect(separatedPathIncludesAge).toEqual(["age"]);
		expect(separatedPathIncludesNameAndZero).toEqual(["name", "0"]);
	});

	test("Get the separated path of the function", () => {
		const separatedPathIncludesCall = separatedPathOf(
			() => {},
			(fn) => fn.call
		);
		expect(separatedPathIncludesCall).toStrictEqual(["call"]);
	});
});
