import * as fs from "fs";
import * as path from "path";

export function detectTestFramework(
    implementationFile: string
): string {

    let currentDir = path.dirname(implementationFile);

    while (true) {

        const packageJson = path.join(
            currentDir,
            "package.json"
        );

        if (fs.existsSync(packageJson)) {

            try {

                const pkg = JSON.parse(
                    fs.readFileSync(packageJson, "utf8")
                );

                const deps = {
                    ...pkg.dependencies,
                    ...pkg.devDependencies
                };

                if (deps["vitest"]) {
                    return "Vitest";
                }

                if (deps["jest"]) {
                    return "Jest";
                }

                if (deps["mocha"]) {
                    return "Mocha";
                }

                if (deps["@playwright/test"]) {
                    return "Playwright";
                }

            } catch {

            }

            break;

        }

        const parent = path.dirname(currentDir);

        if (parent === currentDir) {
            break;
        }

        currentDir = parent;

    }

    return "Unknown";
}