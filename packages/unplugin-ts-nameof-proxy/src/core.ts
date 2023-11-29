import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { NodePath } from "babel__traverse";
import { equals, head, identity, last, length, map, pipe } from "rambda";
import { match, P } from "ts-pattern";

/**
 * @example
 * ```
 * const ast = parse("a.b.c");
 * getInitialObjectNameOfMemberExpression(ast) === "a";
 * ```
 */
function getInitialObjectNameOfMemberExpression(
	node: t.MemberExpression,
): string {
	return match(node.object)
		.when(t.isIdentifier, (object) => object.name)
		.when(t.isMemberExpression, getInitialObjectNameOfMemberExpression)
		.otherwise(() => {
			throw new TypeError(`Unexpected node type: ${node.object.type}`);
		});
}

function propertiesToAST(
	properties: string | string[] | string[][],
): t.StringLiteral | t.ArrayExpression {
	return match(properties)
		.with(P.string, t.stringLiteral)
		.otherwise(pipe(map(propertiesToAST), t.arrayExpression));
}

/**
 * @todo Extract to a separate package
 * @example
 * ```
 * toPathString(["name", "length", "toString"]) === "['name']['length']['toString']"
 * ```
 */
function toPathString(path: string[]) {
	return `['${path.join("']['")}']`;
}

const pathsOf = identity<string[][]>;
const pathOf = pipe(pathsOf, head<string[][]>);
const pathStringsOf = pipe(pathsOf, map(toPathString));
const pathStringOf = pipe(pathStringsOf, head<string[]>);
const namesOf = pipe(pathsOf, map(last<string[]>));
const nameOf = pipe(namesOf, head<string[]>);

const propertiesMappers = {
	nameOf,
	namesOf,
	pathOf,
	pathsOf,
	pathStringOf,
	pathStringsOf,
} satisfies Record<
	string,
	(paths: string[][]) => string | string[] | string[][]
>;

const exportedFunctionNames = Object.keys(propertiesMappers) as Array<
	keyof typeof propertiesMappers
>;

function isCalleeIdentifierToTransform(
	path: NodePath<t.Identifier>,
	parentPath: NodePath<t.Node>,
	moduleSource: string,
): parentPath is NodePath<t.CallExpression> {
	if (path.parentPath !== parentPath) {
		throw new TypeError("path.parentPath !== parentPath");
	}
	return (
		path.parentPath.isCallExpression() &&
		exportedFunctionNames.some((name) =>
			path.referencesImport(moduleSource, name),
		)
	);
}

const isEmptyArray = pipe(length, equals(0));

export function tryGetCallExpressionToTransform(path: NodePath<t.Identifier>) {
	const { parentPath } = path;
	if (
		parentPath.isCallExpression() &&
		exportedFunctionNames.some((name) =>
			path.referencesImport("ts-nameof-proxy", name),
		) &&
		// Avoid the expressions like `String(pathStringOf)`
		parentPath.node.callee === path.node
	) {
		return {
			callExpressionPath: parentPath,
			functionName: path.node.name as keyof typeof propertiesMappers,
		};
	}
	return undefined;
}

export function tryGetInlineArrowFunctionSelector(
	callExpressionPath: NodePath<t.CallExpression>,
) {
	const args = callExpressionPath.node.arguments;
	const selector = args[1] ?? args[0];
	if (
		selector &&
		(t.isFunctionExpression(selector) || t.isArrowFunctionExpression(selector))
	) {
		return {
			selector,
		};
	}
	return undefined;
}

export function getMemberExpressionsIfCanBeTransformed(
	selector: t.FunctionExpression | t.ArrowFunctionExpression,
) {
	if (!t.isArrowFunctionExpression(selector)) {
		return undefined;
	}

	const selectorParam = selector.params[0];
	if (!t.isIdentifier(selectorParam)) {
		return undefined;
	}

	const memberExpressions = (() => {
		switch (selector.body.type) {
			case "MemberExpression":
				return [selector.body];

			case "SequenceExpression": {
				if (
					selector.body.expressions.length > 0 &&
					selector.body.expressions.every((expr) => t.isMemberExpression(expr))
				) {
					return selector.body.expressions as t.MemberExpression[];
				}
			}

			default:
				// The body of node of identify function is a identifier node
				return [];
		}
	})();

	// ✅ nameOf(p => p.name.length)
	// ❌ nameOf(p => a.name.length)
	const proxyName = selectorParam.name;
	const hasUnexpectedSelector = memberExpressions.some((expr) => {
		try {
			const initialObjectName = getInitialObjectNameOfMemberExpression(expr);
			return proxyName !== initialObjectName;
		} catch (error) {
			console.log(error);
			return true;
		}
	});

	if (hasUnexpectedSelector || memberExpressions.length === 0) {
		return undefined;
	}

	return {
		memberExpressions,
	};
}

function getMemberExpressionPropertyString(expr: t.MemberExpression): string {
	const { property } = expr;
	switch (property.type) {
		case "Identifier":
			return property.name;

		case "NumericLiteral":
		case "StringLiteral":
			return property.value.toString();

		default:
			throw new TypeError(`Unexpected property type: '${property.type}'`);
	}
}

function getMemberExpressionPath(expr: t.MemberExpression): string[] {
	const name = getMemberExpressionPropertyString(expr);

	switch (expr.object.type) {
		case "MemberExpression":
			return [...getMemberExpressionPath(expr.object), name];

		default:
			return [name];
	}
}

function identifierVisitor(path: NodePath<t.Identifier>) {
	const callExpressionPathResult = tryGetCallExpressionToTransform(path);
	if (!callExpressionPathResult) {
		return;
	}
	const { callExpressionPath, functionName } = callExpressionPathResult;

	const selectorResult = tryGetInlineArrowFunctionSelector(callExpressionPath);
	if (!selectorResult) {
		return;
	}
	const { selector } = selectorResult;

	const memberExpressionsResult =
		getMemberExpressionsIfCanBeTransformed(selector);
	if (!memberExpressionsResult) {
		return;
	}
	const { memberExpressions } = memberExpressionsResult;

	let hasUnexpectedNodeType = false;

	const propertiesArrays = memberExpressions.reduce<string[][]>(
		(propertiesArrays, expr) => {
			try {
				const properties = getMemberExpressionPath(expr);
				return [...propertiesArrays, properties];
			} catch (error) {
				console.log(error);
				hasUnexpectedNodeType = true;
				return propertiesArrays;
			}
		},
		[],
	);

	if (hasUnexpectedNodeType) {
		return;
	}

	const mapper = propertiesMappers[functionName];
	pipe(mapper, propertiesToAST, (ast) => callExpressionPath.replaceWith(ast))(
		propertiesArrays,
	);
}

export function transform(code: string): string {
	const ast = parser.parse(code, {
		sourceType: "module",
	});

	traverse(ast, {
		Identifier(path) {
			identifierVisitor(path);
		},
	});

	return generate(ast).code;
}
