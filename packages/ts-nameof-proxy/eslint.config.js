const { buildConfig } = require("eslint-config-pcp");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = (async() => {
	return [
		{
			files: ["src/**/*.ts"],
		},
		...(await buildConfig({
			perfectionist: false, // Occur error in VS Code
		})),
	]
})();
