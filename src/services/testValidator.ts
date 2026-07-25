import * as parser from "@babel/parser";

export interface ValidationResult {

    valid: boolean;

    error?: string;

}

export function validateGeneratedTest(
    code: string
): ValidationResult {

    try {

        parser.parse(code, {

            sourceType: "module",

            plugins: [
                "typescript",
                "jsx"
            ]

        });

        return {
            valid: true
        };

    } catch (err: any) {

        return {

            valid: false,

            error: err.message

        };

    }

}