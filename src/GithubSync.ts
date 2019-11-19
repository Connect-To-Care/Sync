import * as fs from "fs-extra";
import * as path from "path";
import * as http from "http";
import * as cp from "child_process";

import {isConfig} from "./IConfig.guard";
import {IConfig} from "./IConfig";

const createHandler = require('github-webhook-handler');

export class GithubSync {
    private webhookHandler: any; // Types are SO messed up for this
    private config: IConfig;

    bootstrap = async () => {
        try {
            this.config = await fs.readJson(path.join(__dirname, "../config.json")) as IConfig;
        } catch (e) {
            console.log("[Info] Invalid config provided.");
            process.exit(1);
        }

        if (!isConfig(this.config)) {
            console.log("[Info] Invalid config object provided.");
            process.exit(1);
        }
        console.log("[Info] Got " + this.config.repos.length + " repo(s) from config");

        await this.initHttp();
    };

    handleError = (e: any) => {
        console.log("[Error] Got error from webhook " + e);
    };

    handlePush = async (event: any) => {
        if (event.payload.ref !== "refs/heads/master") { // Master branch only
            return;
        }

        const name = event.payload.repository.full_name;
        const configData = this.config.repos.find(repo => repo.repo.toLowerCase() === name.toLowerCase());
        if (!configData) {
            console.log("[Warn] Received push request from repo not in config: ", name);
            return;
        }

        try {
            this.executeCommand(configData.location, "git clone https://github.com/" + name + ".git", name)
        } catch (e) {
            console.log("[Error] Failed to pull repo " + name, e);
        }

        for (const cmd in configData.onPull) {
            try {
                await this.executeCommand(configData.location, cmd, name);
            } catch (e) {
                console.log(`[Error] Failed to execute cmd: ${ cmd } in ${ configData.location } for ${ name }`)
            }
        }

    };


    initHttp = () => {
        this.webhookHandler = createHandler({
            path: "/webhook",
            secret: this.config.secret
        });

        this.webhookHandler.on('error', this.handleError);
        this.webhookHandler.on('push', this.handlePush);

        http.createServer((req, res) => {
            this.webhookHandler(req, res, () => {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    "error": true,
                    "msg": "Connect To Care deploy"
                }));
            })
        }).listen(this.config.http.port);
        console.log("[Info] Listening on :" + this.config.http.port);
    };

    executeCommand = async (cwd: string, cmd: string, name: string) => {
        return new Promise(((resolve, reject) => {
            const exec = cp.exec(cmd, {
                cwd
            });

            exec.stdout.on('data', (data) => {
                console.log(`[${name} Stdin] ${data}`);
            });
            exec.stderr.on('data', (data) => {
                console.log(`[${name} Stderr] ${data}`);
            });
            exec.on('exit', () => {
                return resolve();
            });
            exec.on('error', (err) => {
                return reject(err);
            })
        }))
    }
}
