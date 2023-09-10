const {
	rules,
	linterOptions: { reportUnusedDisableDirectives },
} = require("./flat-config/base");

/** @type {import("eslint").Linter.Config} */
module.exports = {
	rules,
	extends: ["plugin:import/typescript"],
	plugins: ["simple-import-sort", "import"],
	reportUnusedDisableDirectives,
	settings: {
		// https://github.com/un-es/eslint-plugin-i#typescript
		"import/resolver": {
			typescript: true,
			node: true,
		},
	},
};
