import { ProjectContext } from "../types/ProjectContext";

export function buildPrompt(context: ProjectContext): string {
    const changedFunctionText = context.changedFunction
        ? `Name: ${context.changedFunction.name}\n\nCode:\n${context.changedFunction.code}`
        : "No changed function detected.";

   return `
You are an expert Software Development Engineer in Test.

A developer has modified a function.

Your task is to update ONLY the affected unit tests.

Rules (STRICT):

1. Update ONLY the affected test cases.
2. Do NOT rewrite the entire test file.
3. Preserve all unrelated tests exactly as they are.
4. Preserve formatting and indentation.
5. Return ONLY valid JavaScript/TypeScript code.
6. Do NOT include explanations.
7. Do NOT include Markdown.
8. Do NOT wrap the response inside \`\`\`.
9. Do NOT include \`\`\`javascript or \`\`\`typescript.
10. The response must be directly writable into the existing test file without any modification.
11. Generate tests compatible with the detected testing framework.
12. Do NOT convert one testing framework to another.

====================================================

Testing Framework

${context.framework}

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

Return ONLY the complete updated test file as plain code.
`;
}