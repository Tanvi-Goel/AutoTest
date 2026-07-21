import { ProjectContext, ChangedFunction } from "../types/ProjectContext";

export function buildProjectContext(

    implementationPath: string,

    testPath: string,

    implementationCode: string,

    testCode: string,

    gitDiff: string,

    changedLines: number[],

    changedFunction: ChangedFunction | null

): ProjectContext {

    return {

        implementationPath,

        testPath,

        implementationCode,

        testCode,

        gitDiff,

        changedLines,

        changedFunction

    };

}