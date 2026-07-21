import { ProjectContext } from "../types/ProjectContext";

export function buildPrompt(context: ProjectContext): string {
    const changedFunctionText = context.changedFunction
        ? `Name: ${context.changedFunction.name}\n\nCode:\n${context.changedFunction.code}`
        : "No changed function detected.";

    return `
You are an expert Software Development Engineer in Test.

A developer has modified a function.

Your job is to update ONLY the affected unit tests.

Rules:

1. Do NOT rewrite the entire test file.
2. Preserve formatting.
3. Preserve unrelated tests.
4. Return ONLY valid JavaScript/TypeScript code.
5. Do NOT explain anything.

====================================================

Changed Function

${changedFunctionText}

====================================================

Git Diff

${context.gitDiff}

====================================================

Current Test

${context.testCode}

====================================================

Return ONLY the updated test code.
`;
}