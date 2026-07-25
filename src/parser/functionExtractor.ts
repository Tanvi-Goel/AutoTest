import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { ChangedFunction } from "../types/ProjectContext";

export function extractFunctionByLine(
    sourceCode: string,
    changedLine: number
): ChangedFunction | null {

    const ast = parse(sourceCode, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
        sourceFilename: "temp.ts"
    });

    let extractedFunction: ChangedFunction | null = null;

    traverse(ast, {

        // function add() {}
        FunctionDeclaration(path) {

            const loc = path.node.loc;

            if (!loc) return;

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
        },

        // const add = () => {}
        VariableDeclarator(path) {

            if (extractedFunction) {
                return;
            }

            if (
                !t.isIdentifier(path.node.id) ||
                !path.node.init
            ) {
                return;
            }

            if (
                !t.isArrowFunctionExpression(path.node.init) &&
                !t.isFunctionExpression(path.node.init)
            ) {
                return;
            }

            const loc = path.node.loc;

            if (!loc) {
                return;
            }

            if (
                changedLine >= loc.start.line &&
                changedLine <= loc.end.line
            ) {

                extractedFunction = {
                    name: path.node.id.name,
                    code: generate(path.parent).code
                };

                path.stop();
            }

        }

    });

    return extractedFunction;
}