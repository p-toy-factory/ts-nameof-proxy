import dts from "rollup-plugin-dts";
import rollupTypescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { terser } from "rollup-plugin-terser";

export default [
	defineConfig({
		input: "src/index.ts",
		plugins: [rollupTypescript()],
		output: [
			{
				file: "./dist/index.mjs",
				format: "esm",
			},
			{
				file: "./dist/index.min.mjs",
				format: "esm",
				sourcemap: "hidden",
				plugins: [terser()],
			},
			{
				file: "./dist/index.js",
				format: "cjs",
			},
			{
				file: "./dist/index.umd.js",
				format: "umd",
				name: "ts-nameof-proxy",
			},
		],
	}),
	defineConfig({
		input: "src/index.ts",
		output: [{ file: "dist/index.d.ts", format: "es" }],
		plugins: [dts()],
	}),
];
