import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function showTestDiff(
    testFilePath: string,
    updatedTest: string
): Promise<string> {

    const dir = path.dirname(testFilePath);

    const fileName = path.basename(testFilePath);

    const tempFilePath = path.join(
        dir,
        fileName.replace(
            ".test",
            ".autotestsync.temp.test"
        )
    );

    fs.writeFileSync(tempFilePath, updatedTest, "utf8");

    await vscode.commands.executeCommand(
        "vscode.diff",
        vscode.Uri.file(testFilePath),
        vscode.Uri.file(tempFilePath),
        "AutoTestSync Preview"
    );

    return tempFilePath;
}