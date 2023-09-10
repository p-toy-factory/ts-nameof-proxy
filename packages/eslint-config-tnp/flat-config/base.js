const js = require("@eslint/js");

/** @type {import("eslint").Linter.FlatConfig} */
module.exports = {
	linterOptions: {
		reportUnusedDisableDirectives: true,
	},
	rules: {
		...js.configs.recommended.rules,
		"class-methods-use-this": "error",
		"dot-notation": "error",
		eqeqeq: "error",
		"no-else-return": ["error", { allowElseIf: false }],
		"no-extra-bind": "error",
		"no-extra-label": "error",
		"no-floating-decimal": "error",
		"no-implicit-coercion": ["error", { disallowTemplateShorthand: true }],
		"no-lonely-if": "error",
		"no-undef-init": "error",
		"no-unneeded-ternary": "error",
		"no-useless-computed-key": ["error", { enforceForClassMembers: true }],
		"no-useless-rename": "error",
		"no-useless-return": "error",
		"no-var": "error",
		"object-shorthand": "error",
		"prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
		"prefer-const": ["error", { destructuring: "all" }],
		"prefer-destructuring": "error",
		"prefer-exponentiation-operator": "error",
		"prefer-object-has-own": "error",
		"prefer-object-spread": "error",
		"prefer-template": "error", // TODO: not auto fix
		"spaced-comment": "error",
		yoda: ["error", "never", { exceptRange: true }],

		"simple-import-sort/imports": "error",
		"simple-import-sort/exports": "error",
		"import/first": "error",
		"import/newline-after-import": "error",
		"import/no-duplicates": "error",
	},
};
