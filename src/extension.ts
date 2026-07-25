import * as vscode from "vscode";
// import { findRelatedTestFile } from "./testFinder";
import { findAllRelatedTests } from "./services/findAllRelatedTests";
import { readFileContent } from "./fileReader";
import { getGitDiff } from "./git/gitDiff";
import { extractFunctionByLine } from "./parser/functionExtractor";
import { buildProjectContext } from "./services/projectContext";
import { buildPrompt } from "./Prompts/promptBuilder";
import { generateUpdatedTest } from "./ai/gemini";
import { showTestDiff } from "./services/diffService";
import { cleanupTempFile } from "./services/cleanupService";
import { applyTestUpdate } from "./services/applyTestUpdate";
import { handleError } from "./services/errorHandler";
import { getAutoTestSyncConfig } from "./services/configService";
import { detectTestFramework } from "./services/frameworkDetector";
import { validateGeneratedTest } from "./services/testValidator";
export function activate(context: vscode.ExtensionContext) {

	console.log("✅ AutoTest Sync Activated");

	const supportedExtensions = [".ts", ".tsx", ".js", ".jsx"];

	const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {

		const filePath = document.fileName;
        const config = getAutoTestSyncConfig();

if (!config.enabled) {
    return;
}
		// Ignore unsupported files
		if (!supportedExtensions.some(ext => filePath.endsWith(ext))) {
			return;
		}

		console.log(`📄 File Saved: ${filePath}`);

		try {

			// Step 1: Find related test file
			const testFiles = await findAllRelatedTests(filePath);

			// if (testFiles.length === 0) {
			// 	vscode.window.showWarningMessage("❌ No related test file found.");
			// 	return;
			// } 
			let testFile = testFiles[0];

if (testFiles.length > 1) {

    const selected =
        await vscode.window.showQuickPick(

            testFiles.map(file => ({
                label: file.split(/[\\/]/).pop()!,
                description: file
            })),

            {
                placeHolder:
                    "Select the test file to update"
            }

        );

    if (!selected) {
        return;
    }

    testFile = selected.description!;

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




			//Step 5: Extract changed function
			const changedFunction = extractFunctionByLine(
				implementationCode,
				gitInfo.changedLines[0]
			);
			console.log("========== EXTRACTED FUNCTION ==========");

if (changedFunction) {
    console.log(changedFunction.name);
    console.log(changedFunction.code);
} else {
    console.log("No function extracted");
}

			if (!changedFunction) {
				vscode.window.showWarningMessage("No changed function found.");
				return;
			}

			console.log("\n========== CHANGED FUNCTION ==========");
			console.log("Function Name:", changedFunction.name);
			console.log(changedFunction.code);

			// Step 6: Build Project Context
			await vscode.window.withProgress(
    {
        location: vscode.ProgressLocation.Notification,
        title: "AutoTestSync is updating tests...",
        cancellable: false
    },
    async (progress) => {

        progress.report({
            increment: 10,
            message: "Building project context..."
        });
const framework =
    detectTestFramework(filePath);

console.log("Framework:", framework);
        const projectContext = buildProjectContext(
            filePath,
            testFile,
            implementationCode,
            testCode,
            gitInfo.diff,
            gitInfo.changedLines,
            changedFunction,
			framework
        );

        progress.report({
            increment: 30,
            message: "Generating prompt..."
        });

        const prompt = buildPrompt(projectContext);

        console.log("\n========== PROMPT ==========");
        console.log(prompt);

        progress.report({
            increment: 30,
            message: "Calling Gemini..."
        });

					const updatedTest =
			await generateUpdatedTest(
				prompt,
				config.model,
				config.temperature
			);
			const validation =
    validateGeneratedTest(updatedTest);

if (!validation.valid) {

    vscode.window.showErrorMessage(
        `❌ AI generated invalid test.\n\n${validation.error}`
    );

    return;

}
console.log("========== VALIDATION ==========");

console.log(validation);
		// Remove extra spaces before comparing
		const normalize = (text: string) =>
			text.replace(/\r\n/g, "\n").trim();

		if (normalize(updatedTest) === normalize(testCode)) {
			vscode.window.showInformationMessage(
				"✅ Test file is already up to date."
			);
			return;
		}

        progress.report({
            increment: 20,
            message: "Preparing diff..."
        });

        let tempFile = "";

if (config.autoOpenDiff) {

    tempFile = await showTestDiff(
        testFile,
        updatedTest
    );

}

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

        progress.report({
            increment: 10,
            message: "Completed"
        });

    }
);
			vscode.window.showInformationMessage(
				`✅ Related Test Found: ${testFile}`
			);

		} catch (error) {

   			 handleError(error);

			}

	});

	context.subscriptions.push(saveListener);
}

export function deactivate() {}