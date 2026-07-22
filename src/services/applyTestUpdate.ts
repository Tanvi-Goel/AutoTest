import * as fs from "fs";

export function applyTestUpdate(
    testFile: string,
    updatedTest: string
) {
    fs.writeFileSync(testFile, updatedTest, "utf8");
}