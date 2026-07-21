import { exec } from "child_process";
import * as util from "util";
import * as path from "path";
import { GitDiffResult } from "../types/GitDiff";

const execAsync = util.promisify(exec);

export async function getGitDiff(filePath: string): Promise<GitDiffResult> {

    try {

        // Run git from the folder where the file exists
        const cwd = path.dirname(filePath);

        const { stdout } = await execAsync(
            `git diff --unified=0 "${path.basename(filePath)}"`,
            { cwd }
        );

        const changedLines: number[] = [];

        const regex = /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/g;

        let match;

        while ((match = regex.exec(stdout)) !== null) {

            const start = Number(match[1]);
            const count = Number(match[2] || 1);

            for (let i = 0; i < count; i++) {
                changedLines.push(start + i);
            }
        }

        return {
            diff: stdout,
            changedLines
        };

    } catch (error) {

        console.error(error);

        return {
            diff: "",
            changedLines: []
        };
    }
}