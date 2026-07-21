import { exec } from "child_process";
import * as util from "util";

const execAsync = util.promisify(exec);

export async function getGitDiff(filePath: string): Promise<string> {

	try {

		const { stdout } = await execAsync(
			`git diff -- "${filePath}"`
		);

		return stdout;

	} catch (error) {

		console.error("Git Diff Error:", error);

		return "";
	}
}