export function buildProjectContext(
    implementationPath: string,
    testPath: string,
    implementationCode: string,
    testCode: string,
    gitDiff: string,
    changedLines: number[],
    changedFunction: any,
    framework: string
) {

    return {

        implementationPath,

        testPath,

        implementationCode,

        testCode,

        gitDiff,

        changedLines,

        changedFunction,

        framework

    };

}