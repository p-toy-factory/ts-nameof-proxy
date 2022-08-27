import { separatedPathsOf } from "../src/separated-paths-of";
import { student } from "./fixtures";

describe("separatedPathArrayOf", () => {
  test("Do not use type parameter", () => {
    const paths = separatedPathsOf(student, (s) => (s.age, s.name.length));
    expect(paths).toStrictEqual([["age"], ["name", "length"]]);
  });

  test("Use type parameter", () => {
    const paths = separatedPathsOf<typeof student>(
      (s) => (s.age, s.name.length)
    );
    expect(paths).toStrictEqual([["age"], ["name", "length"]]);
  });

  test("Get the path of the function", () => {
    const paths = separatedPathsOf(
      () => {},
      (fn) => fn.call
    );
    expect(paths).toStrictEqual([["call"]]);
  });

  test("Do nothing", () => {
    const paths = separatedPathsOf(student, () => {});
    expect(paths).toStrictEqual([]);
  });
});
