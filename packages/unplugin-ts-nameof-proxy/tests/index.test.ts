import { expect, test } from "vitest";
import { transform } from "../src/core";
import { codeToOptimize, codeToPreserve } from "./fixtures";

test("Expect code will be optimized", () => {
	expect(transform(codeToOptimize)).toMatchSnapshot();
});

test("Expect code won't be optimized", () => {
	expect(transform(codeToPreserve)).toMatchSnapshot();
});
