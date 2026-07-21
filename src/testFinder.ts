import * as vscode from "vscode";
import * as path from "path";

export async function findRelatedTestFile(
    sourceFile: string
): Promise<string | null> {

    const fileName = path.basename(sourceFile, path.extname(sourceFile));

    console.log("Searching test for:", fileName);

    const testFiles = await vscode.workspace.findFiles(
        `**/${fileName}.{test,spec}.{ts,tsx,js,jsx}`
    );

    if (testFiles.length === 0) {
        return null;
    }

    return testFiles[0].fsPath;
}