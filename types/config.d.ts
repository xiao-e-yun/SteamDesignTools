import { Protocol } from "puppeteer-core";

export default interface Config {
    thread_count: number
    clear_output:boolean
    clear_tmp:boolean
    before_clear_output:boolean
    cookies:{[user:string]:Protocol.Network.Cookie[]}
}