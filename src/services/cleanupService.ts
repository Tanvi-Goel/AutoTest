import * as fs from "fs";

export function cleanupTempFile(path: string) {

    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }

}