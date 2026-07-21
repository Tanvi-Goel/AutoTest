import * as assert from "assert";
import { buildPrompt } from "../Prompts/promptBuilder";
import { ProjectContext } from "../types/ProjectContext";

suite("Prompt Builder", () => {
    test("renders changed function details instead of [object Object]", () => {
        const context: ProjectContext = {
            implementationPath: "src/example.ts",
            testPath: "src/example.test.ts",
            implementationCode: "function add(a, b) { return a + b; }",
            testCode: "describe('add', () => {});",
            gitDiff: "diff --git a/src/example.ts b/src/example.ts",
            changedLines: [1],
            changedFunction: {
                name: "add",
                code: "function add(a, b) { return a + b; }"
            }
        };

        const prompt = buildPrompt(context);

        assert.ok(prompt.includes("Name: add"));
        assert.ok(prompt.includes("Code:"));
        assert.ok(prompt.includes("function add(a, b) { return a + b; }"));
        assert.ok(!prompt.includes("[object Object]"));
    });
});
