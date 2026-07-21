export interface ChangedFunction {
    name: string;
    code: string;
}

export interface ProjectContext {

    implementationPath: string;

    testPath: string;

    implementationCode: string;

    testCode: string;

    gitDiff: string;

    changedLines: number[];

    changedFunction: ChangedFunction | null;
}