import { exec } from "child_process";
import * as util from "util";
import * as path from "path";
import * as fs from "fs";
import { GitDiffResult } from "../types/GitDiff";

const execAsync = util.promisify(exec);

export async function getGitDiff(
    filePath: string
): Promise<GitDiffResult> {

    try {

        const cwd = path.dirname(filePath);
        const fileName = path.basename(filePath);

        // Check whether the file is already tracked by Git
        let tracked = true;

        try {

            await execAsync(
                `git ls-files --error-unmatch "${fileName}"`,
                { cwd }
            );

        } catch {

            tracked = false;

        }

        // New file (U)
        if (!tracked) {

            const content = fs.readFileSync(filePath, "utf8");

            const totalLines = content.split(/\r?\n/).length;

            return {
                diff: "NEW_FILE",
                changedLines: Array.from(
                    { length: totalLines },
                    (_, i) => i + 1
                )
            };

        }

        // Existing tracked file
        const { stdout } = await execAsync(
            `git diff --unified=0 "${fileName}"`,
            { cwd }
        );

        const changedLines: number[] = [];

        const regex =
            /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/g;

        let match: RegExpExecArray | null;

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