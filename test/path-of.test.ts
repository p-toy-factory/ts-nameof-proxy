import { pathOf } from "../src";
import { student } from "./fixtures";

describe("pathOf", () => {
  test("Do not use type parameter", () => {
    const path = pathOf(student, (s) => s.name[0]);
    expect(path).toBe("['name']['0']");
  });

  test("Use type parameter", () => {
    const path = pathOf<typeof student>((s) => s.name[0]);
    expect(path).toBe("['name']['0']");
  });

  test("Get the path of the function", () => {
    const path = pathOf(
      (foo) => foo.bar,
      (fn) => fn.call
    );
    expect(path).toBe("['call']");
  });
});
