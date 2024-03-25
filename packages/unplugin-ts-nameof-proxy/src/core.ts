import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { NodePath } from "babel__traverse";
import { Either as E, Function as F, Option as O, ReadonlyArray } from "effect";
import { head, identity, last, map, pipe } from "rambda";
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
): E.Either<string, TypeError> {
	return match(node.object)
		.when(t.isIdentifier, (object) => E.right(object.name))
		.when(t.isMemberExpression, getInitialObjectNameOfMemberExpression)
		.otherwise(() =>
			E.left(new TypeError(`Unexpected node type: ${node.object.type}`)),
		);
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

export function getCallExpressionToTransform(
	path: NodePath<t.Identifier>,
): O.Option<{
	callExpressionPath: NodePath<t.CallExpression>;
	functionName: keyof typeof propertiesMappers;
}> {
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
			functionName: path.node.name as keyof typeof propertiesMappers,
		});
	}
	return O.none();
}

export function getInlineArrowFunctionSelector(
	callExpressionPath: NodePath<t.CallExpression>,
) {
	const args = callExpressionPath.node.arguments;
	const selector = args[1] ?? args[0];
	if (
		t.isFunctionExpression(selector) ||
		t.isArrowFunctionExpression(selector)
	) {
		return O.some(selector);
	}
	return O.none();
}

export function getMemberExpressionsIfCanBeTransformed(
	selector: t.FunctionExpression | t.ArrowFunctionExpression,
): E.Either<O.Option<t.MemberExpression[]>, TypeError> {
	if (!t.isArrowFunctionExpression(selector)) {
		return E.right(O.none());
	}

	const selectorParam = selector.params[0];
	if (!t.isIdentifier(selectorParam)) {
		return E.right(O.none());
	}

	const memberExpressionsOption = match(selector.body)
		.when(t.isMemberExpression, (expr) => O.some([expr]))
		.when(t.isSequenceExpression, ({ expressions }) => {
			if (
				expressions.length > 0 &&
				expressions.every((expr) => t.isMemberExpression(expr))
			) {
				return O.some(expressions as t.MemberExpression[]);
			}
			return O.none();
		})
		.otherwise(() => O.none());

	return F.pipe(
		memberExpressionsOption,
		O.map((memberExpressions) => {
			let error: TypeError | undefined;

			// ✅ nameOf(p => p.name.length)
			// ❌ nameOf(p => a.name.length)
			const proxyName = selectorParam.name;

			const hasUnexpectedSelector = memberExpressions.some((expr) =>
				E.match(getInitialObjectNameOfMemberExpression(expr), {
					onLeft: (err) => ((error = err), true),
					onRight: (initialObjectName) => proxyName !== initialObjectName,
				}),
			);

			if (error) {
				return E.left(error);
			}
			return E.right(
				hasUnexpectedSelector ? O.none() : O.some(memberExpressions),
			);
		}),
		O.match({
			onNone: () => E.right(O.none()),
			onSome: identity,
		}),
	);
}

function getMemberExpressionPropertyString(
	expr: t.MemberExpression,
): E.Either<string, TypeError> {
	const { property } = expr;
	switch (property.type) {
		case "Identifier":
			return E.right(property.name);

		case "NumericLiteral":
		case "StringLiteral":
			return E.right(property.value.toString());

		default:
			return E.left(
				new TypeError(`Unexpected property type: '${property.type}'`),
			);
	}
}

function getMemberExpressionPath(
	expr: t.MemberExpression,
): E.Either<string[], TypeError> {
	return F.pipe(
		getMemberExpressionPropertyString(expr),
		E.flatMap((name) => {
			switch (expr.object.type) {
				case "MemberExpression":
					return F.pipe(
						getMemberExpressionPath(expr.object),
						E.map((path) => [...path, name]),
					);

				default:
					return E.right([name]);
			}
		}),
	);
}

function identifierVisitor(path: NodePath<t.Identifier>) {
	O.andThen(
		getCallExpressionToTransform(path),
		({ callExpressionPath, functionName }) => {
			F.pipe(
				getInlineArrowFunctionSelector(callExpressionPath),
				O.map(getMemberExpressionsIfCanBeTransformed),
				O.andThen((memberExpressionsEither) => {
					F.pipe(
						memberExpressionsEither,
						E.andThen((memberExpressionsOption) => {
							O.andThen(memberExpressionsOption, (memberExpressions) => {
								const reducer = (
									pathEither: E.Either<string[][], TypeError>,
									expr: t.MemberExpression,
								) => {
									return F.pipe(
										getMemberExpressionPath(expr),
										E.flatMap((path) =>
											F.pipe(
												pathEither,
												E.map((paths) => [...paths, path]),
											),
										),
									);
								};

								const mapper = propertiesMappers[functionName];

								return F.pipe(
									memberExpressions.reduce(reducer, E.right([])),
									E.match({
										onLeft: console.error,
										onRight: pipe(mapper, propertiesToAST, (ast) =>
											callExpressionPath.replaceWith(ast),
										),
									}),
								);
							});
						}),
						E.match({
							onLeft: console.error,
							onRight: noop,
						}),
					);
				}),
			);
		},
	);
}

const noop = () => {};

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
