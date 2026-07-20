import { Analyzer, SymbolFlags, type Import } from "yuku-analyzer";
import { b, is } from "yuku-ast";
import { print } from "yuku-codegen";
import type { ArrayExpression, Expression, MemberExpression, StringLiteral } from "yuku-parser";

const moduleSource = "ts-nameof-proxy";

function toPathString(path: string[]) {
  return `['${path.join("']['")}']`;
}

/**
 * Project the property paths collected from a selector into the value each
 * compile-time API would return. For example, `[["user", "name"]]` becomes
 * `"name"` for `nameOf`, `["user", "name"]` for `pathOf`, and
 * `"['user']['name']"` for `pathStringOf`.
 */
const propertiesMappers = {
  nameOf: (paths: string[][]) => paths[0]![paths[0]!.length - 1]!,
  namesOf: (paths: string[][]) => paths.map((path) => path[path.length - 1]!),
  pathOf: (paths: string[][]) => paths[0]!,
  pathsOf: (paths: string[][]) => paths,
  pathStringOf: (paths: string[][]) => toPathString(paths[0]!),
  pathStringsOf: (paths: string[][]) => paths.map(toPathString),
};

type FunctionName = keyof typeof propertiesMappers;

function isFunctionName(name: string): name is FunctionName {
  return Object.hasOwn(propertiesMappers, name);
}

type FunctionImport = Import & {
  local: NonNullable<Import["local"]>;
  name: FunctionName;
};

/**
 * Keep only supported value imports from the runtime package. Later we match
 * calls by this import binding's symbol instead of its spelling, so aliases
 * transform correctly while a shadowing local variable does not.
 */
function isFunctionImport(imported: Import): imported is FunctionImport {
  return (
    imported.specifier === moduleSource &&
    imported.local?.has(SymbolFlags.ValueImport) === true &&
    imported.name !== null &&
    isFunctionName(imported.name)
  );
}

// Build literal nodes recursively instead of generating JavaScript source text.
function propertiesToAst(
  properties: string | string[] | string[][],
): ArrayExpression | StringLiteral {
  if (typeof properties === "string") {
    return b.stringLiteral(properties);
  }
  return b.arrayExpression(properties.map(propertiesToAst));
}

/**
 * A selector can only be folded when every property is known statically.
 * Dot access plus string and numeric indexes are safe; dynamic indexes such as
 * `value[key]` return `undefined` and leave the original call untouched.
 */
function getMemberExpressionProperty(expr: MemberExpression): string | undefined {
  if (is.StaticMemberExpression(expr)) {
    return expr.property.name;
  }
  if (
    is.ComputedMemberExpression(expr) &&
    (is.StringLiteral(expr.property) || is.NumericLiteral(expr.property))
  ) {
    return String(expr.property.value);
  }
  return undefined;
}

// Walk from the outer member expression inward. The selector parameter itself
// is deliberately omitted: `value.user.name` is represented as ["user", "name"].
function getMemberExpressionPath(expr: MemberExpression): string[] | undefined {
  const property = getMemberExpressionProperty(expr);
  if (property === undefined) {
    return undefined;
  }
  if (is.MemberExpression(expr.object)) {
    const parentPath = getMemberExpressionPath(expr.object);
    return parentPath && [...parentPath, property];
  }
  return [property];
}

function unwrapParentheses(expression: Expression): Expression {
  return is.ParenthesizedExpression(expression)
    ? unwrapParentheses(expression.expression)
    : expression;
}

/**
 * Accept the small selector language that the transform can prove safe:
 * `value => value.user.name`, or a non-empty comma sequence such as
 * `value => (value.first, value.last)`. Every expression must start at the
 * first arrow parameter and have a fully static path; otherwise the whole call
 * stays in place rather than producing a partial result.
 */
function getSelectorPaths(selector: Expression): string[][] | undefined {
  if (!is.ArrowFunctionExpression(selector)) {
    return undefined;
  }

  const [parameter] = selector.params;
  if (!is.Identifier(parameter)) {
    return undefined;
  }

  if (!is.Expression(selector.body)) {
    return undefined;
  }

  const body = unwrapParentheses(selector.body);
  const memberExpressions = is.MemberExpression(body)
    ? [body]
    : is.SequenceExpression(body) &&
        body.expressions.length > 0 &&
        body.expressions.every(is.MemberExpression)
      ? body.expressions
      : undefined;
  if (!memberExpressions) {
    return undefined;
  }

  const paths = memberExpressions.map((expr) => {
    const root = getRootIdentifier(expr);
    return root === parameter.name ? getMemberExpressionPath(expr) : undefined;
  });
  return paths.every((path): path is string[] => path !== undefined) ? paths : undefined;
}

function getRootIdentifier(expr: MemberExpression): string | undefined {
  if (is.Identifier(expr.object)) {
    return expr.object.name;
  }
  return is.MemberExpression(expr.object) ? getRootIdentifier(expr.object) : undefined;
}


/**
 * Parse and analyze the module once, then replace recognized compile-time API
 * calls with literal AST nodes. Parser diagnostics are surfaced as syntax
 * errors so invalid source is never silently reprinted.
 */
export function transform(code: string, id = "source.ts"): string {
  const analyzer = new Analyzer();
  const module = analyzer.addFile(id, code, { attachComments: true });
  const diagnostic = module.diagnostics.find(({ severity }) => severity === "error");
  if (diagnostic) {
    throw new SyntaxError(diagnostic.message);
  }

  // The map is keyed by the local binding symbol, not the imported/local name.
  const importEntries = module.imports
    .filter(isFunctionImport)
    .map(({ local, name }) => [local, name] as const);
  const imports = new Map(importEntries);

  module.walk({
    CallExpression(node, context) {
      if (!is.Identifier(node.callee)) {
        return;
      }

      const reference = module.referenceOf(node.callee);
      const functionName = reference?.symbol ? imports.get(reference.symbol) : undefined;
      if (!functionName) {
        return;
      }

      // The APIs support both `api(selector)` and `api(object, selector)`;
      // only the selector carries the property path to fold.
      const selector = node.arguments[1] ?? node.arguments[0];
      if (!selector || !is.Expression(selector)) {
        return;
      }

      const paths = getSelectorPaths(selector);
      if (paths) {
        const properties = propertiesMappers[functionName](paths)
        const node = propertiesToAst(properties)
        // The proxy call is compile-time only: replace the complete call, not
        // just its selector, with the literal value it represents.
        context.replace(node);
      }
    },
  });

  // Reprint the modified module while retaining source comments and the
  // package's double-quote output convention.
  return print(module.ast, { comments: true, quotes: "double" }).code;
}
