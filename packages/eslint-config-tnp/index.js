const {
	rules,
	linterOptions: { reportUnusedDisableDirectives },
} = require("./flat-config/base");

/** @type {import("eslint").Linter.Config} */
module.exports = {
	rules,
	plugins: ["simple-import-sort", "import"],
	reportUnusedDisableDirectives,
};
