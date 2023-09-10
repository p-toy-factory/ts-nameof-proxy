/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ["plugin:@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "plugin:import/typescript"],
	rules: {
		"@typescript-eslint/ban-ts-comment": [
			"error",
			{
				"ts-ignore": false,
			},
		],
	},
};
