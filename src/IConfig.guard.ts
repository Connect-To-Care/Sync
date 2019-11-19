/*
 * Generated type guards for "IConfig.ts".
 * WARNING: Do not manually change this file.
 */
import { Repo, IConfig } from "./IConfig";

function evaluate(
    isCorrect: boolean,
    varName: string,
    expected: string,
    actual: any
): boolean {
    if (!isCorrect) {
        console.error(
            `${varName} type mismatch, expected: ${expected}, found:`,
            actual
        )
    }
    return isCorrect
}

export function isRepo(obj: any, argumentName: string = "repo"): obj is Repo {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.repo === "string", `${argumentName}.repo`, "string", obj.repo) &&
        evaluate(typeof obj.location === "string", `${argumentName}.location`, "string", obj.location) &&
        evaluate(Array.isArray(obj.onPull) &&
            obj.onPull.every((e: any) =>
                typeof e === "string"
            ), `${argumentName}.onPull`, "string[]", obj.onPull)
    )
}

export function isConfig(obj: any, argumentName: string = "iConfig"): obj is IConfig {
    return (
        typeof obj === "object" &&
        evaluate(Array.isArray(obj.repos) &&
            obj.repos.every((e: any) =>
                isRepo(e) as boolean
            ), `${argumentName}.repos`, "import(\"C:/Users/alec/WebstormProjects/github-sync/src/IConfig\").Repo[]", obj.repos) &&
        evaluate(typeof obj.http === "object" &&
            evaluate(typeof obj.http.port === "number", `${argumentName}.http.port`, "number", obj.http.port), `${argumentName}.http`, "{ port: number; }", obj.http) &&
        evaluate(typeof obj.secret === "string", `${argumentName}.secret`, "string", obj.secret)
    )
}
