/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:import/typescript",
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	rules: {
		"@typescript-eslint/ban-ts-comment": [
			"error",
			{
				"ts-ignore": false,
			},
		],
	},
	settings: {
		// https://github.com/un-es/eslint-plugin-i#typescript
		"import/resolver": {
			typescript: true,
			node: true,
		},
	},
};
