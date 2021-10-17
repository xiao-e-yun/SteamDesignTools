import $path from 'path';
import { promises as fs } from 'fs';
import Config from "VS/config";
import { Worker } from 'worker_threads';
import DataType from 'VS/Protocol';
import { FilterKeysToObject } from 'VS/utils';
import puppeteer from 'puppeteer-core';
import { getEdgePath } from 'edge-paths';

function path(path:"config"|"launch"):string
function path(path:"root"|"tmp"|"server"|"www"|"lib"|"output",filename?:string):string
function path(path: "server"|"www"|"lib"|"tmp"|"config"|"output"|"root"|"launch", filename?: string): string {
    const snapshot_path = $path.join(__dirname, "..")
    const local_path = process.env.NODE_ENV === "development" ? snapshot_path : $path.dirname(process.execPath);
    return {
        server: $path.join(snapshot_path, "server", filename || ""),
        www: $path.join(local_path, "www", filename || ""),
        lib: $path.join(local_path, "lib", filename || ""),
        output: $path.join(local_path, "output", filename || ""),
        tmp: $path.join(local_path, "tmp", filename || ""),
        config: $path.join(local_path, "config.json"),
        root: $path.join(local_path, filename || ""),
        launch: process.argv[3] || $path.join(local_path,"../dist/SteamDesignTools.exe"),
    }[path]
}

/**
 * 
 * @param key 要讀取的值
 * @returns 讀取的值
 */
function config<Key extends keyof Config>(key: Key): Promise<Config[Key]>

/**
 * @param key 要讀取的值
 * @param val 要設定的值
 */
function config<Key extends keyof Config>(key_and_val:{key: Key, val: Config[Key]}[]):Promise<void>

/** @returns 整個 Config */
function config(): Promise<Config>

async function config<Key extends keyof Config>
    (key?: Key | {key: Key, val: Config[Key]}[]) {
    const config_path = path("config");
    const f = await fs.readFile(config_path, "utf8");
    const config = JSON.parse(f) as Config;
    if (key === undefined) return config
    else if (typeof key === "string") return config[key]
    else {
        for (const item of key) {
            config[item.key] = item.val;
        } // 設定
        await fs.writeFile(config_path, JSON.stringify(config));
    }
}

async function worker<T extends keyof FilterKeysToObject<DataType,{worker:{option:any,data:any[]}}>>
(type: T, option: DataType[T]["worker"]["option"] , data: DataType[T]["worker"]["data"]) {
    let thread_count = (await config()).thread_count || 5

    console.log("多線程處理:" + data.length + "\n允許線程數:" + thread_count)
    const worker_threads = [] as Promise<number>[]
    while (thread_count > 0) {
        const take = Math.floor(data.length / thread_count)
        const worker_data = data.splice(0, take)

        thread_count--
        if (worker_data.length === 0){
            if (data.length === 0) break
            continue
        }
        worker_threads.push(new Promise((resolve,reject) => {
            new Worker(path("server", "threads.js"), { workerData: { type, data: { option ,data:worker_data } } })
                .on("exit", (e) => resolve(e)).on("error", (e) => reject(e))
        }))
    }
    return Promise.all(worker_threads)
}

async function create_browser(options?:puppeteer.LaunchOptions & puppeteer.BrowserLaunchArgumentOptions & puppeteer.BrowserConnectOptions){
    const opt = {
        executablePath:getEdgePath(),
        headless:!await config("dev_mode"),
        ...options||{}
    }
    return await puppeteer.launch(opt)
}

function hash(){ let result = ''; const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 12; i++)result += characters.charAt(Math.floor(Math.random() * 62)); return result }

export { config, path, worker, hash, create_browser }