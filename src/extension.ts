import * as vscode from "vscode";
import { findRelatedTestFile } from "./testFinder";
import { readFileContent } from "./fileReader";
import { getGitDiff } from "./git/gitDiff";
import { extractFunctionByLine } from "./parser/functionExtractor";
import { buildProjectContext } from "./services/projectContext";
import { buildPrompt } from "./Prompts/promptBuilder";
import { generateUpdatedTest } from "./ai/gemini";
import { showTestDiff } from "./services/diffService";
import { cleanupTempFile } from "./services/cleanupService";
import { applyTestUpdate } from "./services/applyTestUpdate";
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
			const gitInfo = await getGitDiff(filePath);

			console.clear();

			console.log("========== IMPLEMENTATION ==========");
			console.log(implementationCode);

			console.log("\n========== TEST ==========");
			console.log(testCode);

			console.log("\n========== GIT DIFF ==========");
			console.log(gitInfo.diff || "No Git diff found.");

			console.log("\n========== CHANGED LINES ==========");
			console.log(gitInfo.changedLines);

			// No code changes
			if (gitInfo.changedLines.length === 0) {
				vscode.window.showInformationMessage("No code changes detected.");
				return;
			}

			// Step 5: Extract changed function
			const changedFunction = extractFunctionByLine(
				implementationCode,
				gitInfo.changedLines[0]
			);

			if (!changedFunction) {
				vscode.window.showWarningMessage("No changed function found.");
				return;
			}

			console.log("\n========== CHANGED FUNCTION ==========");
			console.log("Function Name:", changedFunction.name);
			console.log(changedFunction.code);

			// Step 6: Build Project Context
			const projectContext = buildProjectContext(
				filePath,
				testFile,
				implementationCode,
				testCode,
				gitInfo.diff,
				gitInfo.changedLines,
				changedFunction
			);

			console.log("\n========== PROJECT CONTEXT ==========");
			console.log(projectContext);

			// Step 7: Build Prompt
			const prompt = buildPrompt(projectContext);

			console.log("\n========== PROMPT ==========");
			console.log(prompt);
            console.log("Calling Gemini...");

			const updatedTest = await generateUpdatedTest(prompt);
					const tempFile = await showTestDiff(
			testFile,
			updatedTest
		);
const choice = await vscode.window.showInformationMessage(
    "Replace the existing test with the AI generated test?",
    "Accept",
    "Reject"
);
if (choice === "Accept") {

    applyTestUpdate(testFile, updatedTest);

    cleanupTempFile(tempFile);

    vscode.window.showInformationMessage(
        "✅ Test file updated successfully."
    );

} else {

    cleanupTempFile(tempFile);

    vscode.window.showInformationMessage(
        "❌ AI changes discarded."
    );

}
			console.log("========== AI RESPONSE ==========");
			console.log(updatedTest);
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