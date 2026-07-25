import parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

export interface ChangedFunction {
    name: string;
    code: string;
}

export function extractChangedFunctions(
    implementationCode: string,
    changedLines: number[]
): ChangedFunction[] {

    const ast = parser.parse(implementationCode, {
        sourceType: "module",
        plugins: [
            "typescript",
            "jsx"
        ]
    });

    const changedFunctions: ChangedFunction[] = [];

    traverse(ast, {

        FunctionDeclaration(path) {

            if (!path.node.loc) {
                return;
            }

            const start = path.node.loc.start.line;
            const end = path.node.loc.end.line;

            const touched = changedLines.some(
                line => line >= start && line <= end
            );

            if (!touched) {
                return;
            }

            changedFunctions.push({

                name:
                    path.node.id?.name ??
                    "anonymous",

                code:
                    generate(path.node).code

            });

        },

        VariableDeclarator(path) {

            if (
                !t.isIdentifier(path.node.id) ||
                !path.node.loc
            ) {
                return;
            }

            if (
                !t.isArrowFunctionExpression(path.node.init) &&
                !t.isFunctionExpression(path.node.init)
            ) {
                return;
            }

            const start = path.node.loc.start.line;
            const end = path.node.loc.end.line;

            const touched = changedLines.some(
                line => line >= start && line <= end
            );

            if (!touched) {
                return;
            }

            changedFunctions.push({

                name: path.node.id.name,

                code: generate(path.node).code

            });

        }

    });

    return changedFunctions;

}