import { nameOf } from "../src";
import { student } from "./fixtures";

describe("nameOf", () => {
  test("Do not use type parameter", () => {
    const age = nameOf(student, (s) => s.age);
    const length = nameOf(student, (s) => s.name.length);

    expect(age).toBe("age");
    expect(length).toBe("length");
  });

  test("Use type parameter", () => {
    const age = nameOf<typeof student>((s) => s.age);
    const length = nameOf<typeof student>((s) => s.name.length);

    expect(age).toBe("age");
    expect(length).toBe("length");
  });

  test("Get the property name of the function", () => {
    const name = nameOf(
      () => {},
      (fn) => fn.call
    );
    expect(name).toBe("call");
  });
});
