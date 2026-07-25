import * as vscode from "vscode";
import * as path from "path";

export async function findAllRelatedTests(
    implementationFile: string
): Promise<string[]> {

    const fileName = path
        .basename(implementationFile)
        .replace(/\.(ts|tsx|js|jsx)$/, "");

    const files = await vscode.workspace.findFiles(
        `**/*{${fileName}.test,${fileName}.spec,${fileName}.test.*,${fileName}.spec.*}.{ts,tsx,js,jsx}`,
        "**/node_modules/**"
    );

    return files.map(file => file.fsPath);
}