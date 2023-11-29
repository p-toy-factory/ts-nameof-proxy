// Tagged templates to add import statements at the head of code
const importStatements = `
import { nameOf, namesOf, pathOf, pathsOf, pathStringOf, pathStringsOf } from "ts-nameof-proxy"
`;

function withImportStatements(code: string) {
	return importStatements + code;
}

export const codeToOptimize = withImportStatements(`
nameOf((f) => f.name.length)
namesOf((f) => (f.name.length.toString, f.name.length))
pathOf((f) => f.name.length.toString)
pathsOf((f) => f.name.length.toString)
pathsOf((f) => (f.name.length.toString, f.name.length))
pathStringOf((f) => f.name.length.toString)
pathStringsOf((f) => (f.name.length.toString, f.name.length))
`);

export const codeToPreserve = withImportStatements(`
nameOf((f) => f)
nameOf((f) => {return f})
String(pathsOf)
pathsOf(["2"][1][""][index].length)
pathsOf((f) => [f.name.length.toString, f.name.length])
pathsOf((f) => [f.name, f])
pathsOf((f) => [f.name, globalThis.fetch])
`);
