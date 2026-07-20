import { expect, test } from "vitest";

import { unplugin } from "../src";
import { transform } from "../src/core";

type RawPlugin = {
	transformInclude?: (id: string) => boolean;
	transform?: (code: string, id: string) => Promise<string> | string;
};

test("transforms aliased imports but respects shadowed bindings", () => {
	const output = transform(`
		import { nameOf as fieldName } from "ts-nameof-proxy";
		fieldName((value) => value["name"][0]);
		function preserve(fieldName: (selector: unknown) => unknown) {
			return fieldName((value) => value.name);
		}
	`, "example.ts");

	expect(output).toContain('"0";');
	expect(output).toContain("return fieldName((value) => value.name);");
});

test("transforms parenthesized sequence selectors", () => {
	const output = transform(`
		import { namesOf } from "ts-nameof-proxy";
		namesOf((value) => ((value.profile.first, value.profile.last)));
	`);

	expect(output).toContain('["first", "last"]');
});

test("supports TypeScript and TSX inputs", () => {
	const output = transform(`
		import { nameOf } from "ts-nameof-proxy";
		type User = { name: string };
		const view = <div>{nameOf<User>((user) => user.name)}</div>;
	`, "example.tsx");

	expect(output).toContain('<div>{"name"}</div>');
});

test("preserves parse failures", () => {
	expect(() => transform("const =", "broken.ts")).toThrow(SyntaxError);
});

test("unplugin calls the core transform", async () => {
	const plugin = unplugin.raw({}, { framework: "rollup" }) as RawPlugin;
	const code = `import { nameOf } from "ts-nameof-proxy"; nameOf((value) => value.name);`;

	expect(plugin.transformInclude?.("/src/example.tsx")).toBe(true);
	expect(plugin.transformInclude?.("/src/example.css")).toBe(false);
	expect(await plugin.transform?.(code, "/src/example.ts")).toBe(
		transform(code, "/src/example.ts"),
	);
});
