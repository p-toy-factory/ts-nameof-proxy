/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	ignorePatterns: ["dist"],
	extends: ["eslint-config-tnp", "eslint-config-tnp/typescript"],
};
