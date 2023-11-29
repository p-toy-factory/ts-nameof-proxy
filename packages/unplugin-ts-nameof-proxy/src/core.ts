import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { NodePath } from "babel__traverse";
import { Either as E, Function as F, Option as O } from "effect";
import { head, identity, last, map, pipe as flow } from "rambda";
import { match } from "ts-pattern";

/**
 * @throws {TypeError}
 *
 * @example
 * ```
 * const ast = parse("a.b.c");
 * getInitialObjectNameOfMemberExpression(ast) === "a";
 * ```
 */
function getInitialObjectNameOfMemberExpression(
	node: t.MemberExpression,
): string {
	switch (node.object.type) {
		case "Identifier":
			return node.object.name;

		case "MemberExpression":
			return getInitialObjectNameOfMemberExpression(node.object);

		default:
			throw new TypeError(
				`Unexpected node type: ${node.object.type} from ${generate(node).code}`,
			);
	}
}

function parseNameOrPathToAST(
	nameOrPath: string | string[] | string[][],
): t.ArrayExpression | t.StringLiteral {
	if (typeof nameOrPath === "string") {
		const name = nameOrPath;
		return t.stringLiteral(name);
	}
	const path = nameOrPath;
	const pathAST = path.map((property) => parseNameOrPathToAST(property));
	return t.arrayExpression(pathAST);
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
const pathOf = flow(pathsOf, head<string[][]>);
const pathStringsOf = flow(pathsOf, map(toPathString));
const pathStringOf = flow(pathStringsOf, head<string[]>);
const namesOf = flow(pathsOf, map(last<string[]>));
const nameOf = flow(namesOf, head<string[]>);

type PathMapper = (paths: string[][]) => string | string[] | string[][];

const pathMappers = {
	nameOf,
	namesOf,
	pathOf,
	pathsOf,
	pathStringOf,
	pathStringsOf,
} satisfies Record<string, PathMapper>;

const exportedFunctionNames = Object.keys(pathMappers) as Array<
	keyof typeof pathMappers
>;

export function getCallExpressionToTransform(path: NodePath<t.Identifier>) {
	const { parentPath } = path;
	if (
		parentPath.isCallExpression() &&
		exportedFunctionNames.some((name) =>
			path.referencesImport("ts-nameof-proxy", name),
		) &&
		// Avoid the expressions like `String(pathStringOf)`
		parentPath.node.callee === path.node
	) {
		return O.some({
			callExpressionPath: parentPath,
			functionName: path.node.name as keyof typeof pathMappers,
		});
	}
	return O.none();
}

export function getInlineArrowFunctionSelector(
	callExpressionPath: NodePath<t.CallExpression>,
): E.Either<t.ArrowFunctionExpression | t.FunctionExpression, string> {
	const args = callExpressionPath.node.arguments;
	const selector = args[1] ?? args[0];
	if (
		selector &&
		(t.isFunctionExpression(selector) || t.isArrowFunctionExpression(selector))
	) {
		return E.right(selector);
	}
	return E.left("Invalid function call");
}

/**
 * @todo Support `FunctionExpression`
 */
export function getMemberExpressionsToTransform(
	selector: t.ArrowFunctionExpression | t.FunctionExpression,
): E.Either<t.MemberExpression[], string> {
	if (!t.isArrowFunctionExpression(selector)) {
		return E.left("Not support FunctionExpression yet");
	}

	const selectorParam = selector.params[0];
	if (!t.isIdentifier(selectorParam)) {
		return E.left("The selector not have parameter");
	}

	const memberExpressions = match(selector.body)
		.when(t.isMemberExpression, (selectorBody) => [selectorBody])
		.when(t.isSequenceExpression, (selectorBody) =>
			selectorBody.expressions.filter((expr) => t.isMemberExpression(expr)),
		)
		.otherwise(() => []);

	if (memberExpressions.length === 0) {
		return E.left("Invalid selector body");
	}

	// ✅ nameOf(p => p.name.length)
	// ❌ nameOf(p => a.name.length)
	const proxyName = selectorParam.name;
	const hasUnexpectedSelector = memberExpressions.some((expr) => {
		const initialObjectName = getInitialObjectNameOfMemberExpression(expr);
		return proxyName !== initialObjectName;
	});

	if (hasUnexpectedSelector) {
		return E.left("The selector's parameter not be used");
	}
	return E.right(memberExpressions);
}

/**
 * @throws {TypeError}
 */
function getMemberExpressionPropertyString(expr: t.MemberExpression): string {
	const { property } = expr;
	switch (property.type) {
		case "Identifier":
			return property.name;

		case "NumericLiteral":
		case "StringLiteral":
			return property.value.toString();

		default:
			throw new TypeError(
				`Unexpected property type: '${property.type}' from expression: ${
					generate(expr).code
				}`,
			);
	}
}

/**
 * @throws {TypeError}
 */
function getMemberExpressionPath(expr: t.MemberExpression): string[] {
	const name = getMemberExpressionPropertyString(expr);

	switch (expr.object.type) {
		case "MemberExpression":
			return [...getMemberExpressionPath(expr.object), name];

		default:
			return [name];
	}
}

/**
 * @throws {TypeError}
 */
function identifierVisitor(path: NodePath<t.Identifier>) {
	const callExpressionPathOption = getCallExpressionToTransform(path);
	if (O.isNone(callExpressionPathOption)) {
		return;
	}
	const { callExpressionPath, functionName } = callExpressionPathOption.value;

	const selectorOption = getInlineArrowFunctionSelector(callExpressionPath);
	if (E.isLeft(selectorOption)) {
		console.warn(
			"warning:",
			selectorOption.left,
			generate(callExpressionPath.node).code,
		);
		return;
	}
	const selector = selectorOption.right;

	const memberExpressionsOption = getMemberExpressionsToTransform(selector);
	if (E.isLeft(memberExpressionsOption)) {
		console.warn(
			"warning:",
			memberExpressionsOption.left,
			generate(selector).code,
		);
		return;
	}
	const memberExpressions = memberExpressionsOption.right;

	const paths = memberExpressions.map((expr) => getMemberExpressionPath(expr));
	const pathMapper = pathMappers[functionName];
	F.pipe(
		paths,
		pathMapper,
		parseNameOrPathToAST,
		(ast) => callExpressionPath.replaceWith(ast), //
	);
}

export function transform(code: string): string {
	const ast = parser.parse(code, {
		sourceType: "module",
	});

	traverse(ast, {
		Identifier: identifierVisitor,
	});

	return generate(ast).code;
}
