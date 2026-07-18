import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "src/index.ts",
	format: "esm",
	dts: true,
	outExtensions: ({ format }) =>
		format === "es" ? { dts: ".d.ts", js: ".mjs" } : undefined,
	exports: {
		legacy: true,
		customExports: {
			"./package.json": "./package.json",
		},
	},
});
