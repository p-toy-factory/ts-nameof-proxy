// @ts-check

const base = require("./base.js");
const globals = require("globals");

/** @type {import("eslint").Linter.FlatConfig} */
module.exports = {
	...base,
	languageOptions: {
		globals: {
			...globals.browser,
		},
	},
};
