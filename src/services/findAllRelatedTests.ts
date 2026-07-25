import * as vscode from "vscode";
import * as path from "path";

export async function findAllRelatedTests(
    implementationFile: string
): Promise<string[]> {

    const baseName = path.basename(
        implementationFile,
        path.extname(implementationFile)
    );

    const allTestFiles = await vscode.workspace.findFiles(
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/node_modules/**"
    );

    const relatedTests = allTestFiles.filter(file => {

        const name = path.basename(file.fsPath);

        return (
            name === `${baseName}.test.js` ||
            name === `${baseName}.test.jsx` ||
            name === `${baseName}.test.ts` ||
            name === `${baseName}.test.tsx` ||
            name === `${baseName}.spec.js` ||
            name === `${baseName}.spec.jsx` ||
            name === `${baseName}.spec.ts` ||
            name === `${baseName}.spec.tsx`
        );

    });

    console.log("Implementation:", implementationFile);
    console.log("Looking for:", baseName);
    console.log("Found Tests:", relatedTests.map(f => f.fsPath));

    return relatedTests.map(file => file.fsPath);
}