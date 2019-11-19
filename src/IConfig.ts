/** @see {isRepo} ts-auto-guard:type-guard */
export interface Repo {
    repo: string,
    location: string
    onPull: string[]
}

/** @see {isConfig} ts-auto-guard:type-guard */
export interface IConfig {
    repos: Repo[],
    http: {
        port: number
    },
    secret: string
}
