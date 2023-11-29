// @ts-check

const { buildConfig } = require("eslint-config-pcp");
const typeScriptESLintPlugin = require("@typescript-eslint/eslint-plugin");

const typeScriptESLintPluginConfigs =
	typeScriptESLintPlugin /* .default */.configs;

module.exports = (async () => {
	/** @type {import("eslint").Linter.FlatConfig[]} */
	const config = [
		{
			files: ["src/**/*.ts"],
		},
		...(await buildConfig({
			perfectionist: false, // Occur error in VS Code
		})),
		// {
		// 	rules: {
		// 		...typeScriptESLintPluginConfigs["eslint-recommended"].overrides[0]
		// 			.rules,
		// 		...typeScriptESLintPluginConfigs.recommended.rules,
		// 		"prefer-destructuring": "off",
		// 		"@typescript-eslint/prefer-destructuring": "error",
		// 	},
		// },
	];

	return config;
})();
