import * as vscode from "vscode";
import { findRelatedTestFile } from "./testFinder";
import { readFileContent } from "./fileReader";
import { getGitDiff } from "./gitDiff";

export function activate(context: vscode.ExtensionContext) {

	console.log("✅ AutoTest Sync Activated");

	const supportedExtensions = [".ts", ".tsx", ".js", ".jsx"];

	const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {

		const filePath = document.fileName;

		// Ignore unsupported files
		if (!supportedExtensions.some(ext => filePath.endsWith(ext))) {
			return;
		}

		console.log(`📄 File Saved: ${filePath}`);

		try {

			// Step 1: Find related test file
			const testFile = await findRelatedTestFile(filePath);

			if (!testFile) {
				vscode.window.showWarningMessage("❌ No related test file found.");
				return;
			}

			// Step 2: Read implementation
			const implementationCode = await readFileContent(filePath);

			// Step 3: Read test file
			const testCode = await readFileContent(testFile);

			// Step 4: Get Git Diff
			const gitDiff = await getGitDiff(filePath);

			console.clear();

			console.log("========== IMPLEMENTATION ==========");
			console.log(implementationCode);

			console.log("\n========== TEST ==========");
			console.log(testCode);

			console.log("\n========== GIT DIFF ==========");
			console.log(gitDiff || "No Git diff found.");

			vscode.window.showInformationMessage(
				`✅ Related Test Found: ${testFile}`
			);

		} catch (error) {

			console.error(error);

			vscode.window.showErrorMessage(
				"❌ Failed to process files."
			);
		}

	});

	context.subscriptions.push(saveListener);
}

export function deactivate() {}