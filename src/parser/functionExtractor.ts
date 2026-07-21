import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { ChangedFunction } from "../types/ProjectContext";

export function extractFunctionByLine(
    sourceCode: string,
    changedLine: number
): ChangedFunction | null {

    const ast = parse(sourceCode, {
        sourceType: "module",
        plugins: ["typescript", "jsx"]
    });

    let extractedFunction: ChangedFunction | null = null;

    traverse(ast, {

        FunctionDeclaration(path) {

            const loc = path.node.loc;

            if (!loc) {
                return;
            }

            if (
                changedLine >= loc.start.line &&
                changedLine <= loc.end.line
            ) {

                extractedFunction = {
                    name: path.node.id?.name ?? "anonymous",
                    code: generate(path.node).code
                };

                path.stop();
            }

        }

    });

    return extractedFunction;
}