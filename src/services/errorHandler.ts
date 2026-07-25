import * as vscode from "vscode";

export function handleError(error: unknown) {

    console.error("========== AutoTestSync Error ==========");
    console.error(error);

    let message = "Unknown error occurred.";

    if (error instanceof Error) {
        message = error.message;
    }

    // API Key Missing
    if (message.includes("OPENROUTER_API_KEY")) {

        vscode.window.showErrorMessage(
            "❌ OpenRouter API Key is missing. Please check your .env file."
        );

        return;
    }

    // Rate Limit
    if (
        message.includes("429") ||
        message.toLowerCase().includes("rate limit")
    ) {

        vscode.window.showErrorMessage(
            "⚠️ OpenRouter rate limit exceeded. Please try again later."
        );

        return;
    }

    // Unauthorized
    if (
        message.includes("401") ||
        message.toLowerCase().includes("unauthorized")
    ) {

        vscode.window.showErrorMessage(
            "❌ Invalid OpenRouter API Key."
        );

        return;
    }

    // Network
    if (
        message.includes("fetch failed") ||
        message.includes("ENOTFOUND") ||
        message.includes("ECONNREFUSED")
    ) {

        vscode.window.showErrorMessage(
            "🌐 Unable to connect to OpenRouter. Check your internet connection."
        );

        return;
    }

    vscode.window.showErrorMessage(
        `❌ ${message}`
    );
}