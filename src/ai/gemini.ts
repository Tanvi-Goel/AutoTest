import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

export function findEnvFile(startDir: string = __dirname): string | undefined {
    let currentDir = path.resolve(startDir);

    while (true) {
        const candidatePath = path.join(currentDir, ".env");

        if (fs.existsSync(candidatePath)) {
            return candidatePath;
        }

        const parentDir = path.dirname(currentDir);

        if (parentDir === currentDir) {
            return undefined;
        }

        currentDir = parentDir;
    }
}

const envFilePath = findEnvFile();

if (envFilePath) {
    dotenv.config({ path: envFilePath });
}

const API_KEY = process.env.OPENROUTER_API_KEY;
    export async function generateUpdatedTest(
    prompt: string,
    model: string,
    temperature: number
): Promise<string> {

    if (!API_KEY) {
        throw new Error("OPENROUTER_API_KEY is missing.");
    }

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "AutoTestSync"
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert software testing assistant."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature
            })
        }
    );

    console.log("========== OPENROUTER STATUS ==========");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    const data: any = await response.json();

    console.log("========== OPENROUTER RESPONSE ==========");
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {

    const errorMessage =
        data?.error?.message ||
        response.statusText ||
        "Unknown API Error";

    throw new Error(
        `${response.status} - ${errorMessage}`
    );
}

    // return (
    //     data?.choices?.[0]?.message?.content ??
    //     "No response received."
    // );
    let generatedCode =
    data?.choices?.[0]?.message?.content ?? "No response received.";
    if (!generatedCode.trim()) {
    throw new Error("AI returned an empty response.");
}

generatedCode = generatedCode
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

return generatedCode;
}