import * as vscode from "vscode";

export function getAutoTestSyncConfig() {

    const config =
        vscode.workspace.getConfiguration("autotestsync");

    return {

        enabled: config.get<boolean>("enabled", true),

        model: config.get<string>(
            "model",
            "google/gemini-2.5-flash-lite"
        ),

        autoOpenDiff: config.get<boolean>(
            "autoOpenDiff",
            true
        ),

        temperature: config.get<number>(
            "temperature",
            0.2
        )

    };

}