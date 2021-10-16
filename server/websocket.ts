import { hash as $hash } from "./utils"
import DataType from "VS/protocol"
import SocketServer = require('ws')

export default class {
    constructor(ws: SocketServer) {
        this.ws = ws
        console.log(this._info + "已連線")
        this.ws.addEventListener("message", async (event) => {
            const $data = JSON.parse(event.data) as WebSocketEvent["sender"] | WebSocketEvent["receiver"]
            switch ($data.type) {
                case "get":
                case "send": {
                    let $return = null
                    if (typeof this.event[$data.key] === "undefined") console.warn(this._info + $data.type + "|" + $data.key + "|未註冊")
                    else $return = this.event[$data.key]($data)

                    if ($data.type === "get") {
                        if ($return.then) $return = await $return
                        const req = JSON.stringify({ key: $data.key, data: $return, hash: $data.hash, type: "receive" } as WebSocketEvent["receiver"])
                        this.ws.send(req)
                    }
                    break
                }
                case "receive": {
                    const sysc_list = this._sync_list
                    if (typeof sysc_list[$data.hash] === "undefined") return
                    sysc_list[$data.hash]($data as WebSocketEvent["receiver"])
                    delete sysc_list[$data.hash]
                    break
                }
            }
        })
        this.ws.addEventListener("close", () => console.error(this._info + "已斷線"))
    }

    on<T extends keyof DataType>(key: T, fun: (data: WebSocketEvent<T>["sender"]) => DataType[T]["resolve"]|Promise<DataType[T]["resolve"]>): void
    on(key: string, fun: (data: WebSocketEvent["sender"]) => any) {
        if (this.event[key]) console.warn(this._info + key + "|重複註冊")
        else {
            this.event[key] = fun
            console.log(this._info + key + "|註冊成功")
        }
    }

    once<T extends keyof DataType>(key: T, fun: (data: WebSocketEvent<T>["sender"]) => DataType[T]["resolve"]|Promise<DataType[T]["resolve"]>): void
    once(key: string, fun: (data: WebSocketEvent["sender"]) => any) {
        this.event[key] = (data)=>{
            fun(data)
            delete this.event[key]
        }
        console.log(this._info + key + "|一次性註冊成功")
    }

    off<T extends keyof DataType>(key: T): void
    off(key: string) {
        if (!this.event[key]) console.warn(this._info + key + "|嘗試刪除未註冊")
        else {
            delete this.event[key]
            console.log(this._info + key + "|刪除註冊")
        }
    }

    send<T extends keyof DataType>(key: T, data: DataType[T]["req"]): void
    send(key: string, data: any) {
        const req = JSON.stringify({ key: key, data: data, type: "send" } as WebSocketEvent["sender"])
        this.ws.send(req)
    }

    //==========================================
    //      sync 互動
    //==========================================

    get<T extends keyof DataType>(key: T, data: DataType[T]["req"]): Promise<WebSocketEvent<T>["receiver"]>
    async get(key: string, data: any) {
        const hash = $hash()
        const req = JSON.stringify({ key: key, data: data, type: "get", hash } as WebSocketEvent["sender"])
        this.ws.send(req)
        return new Promise((resolve, reject) => this._sync_list[hash] = resolve)
    }

    ws: SocketServer
    event: { [key: string]: (enevt: WebSocketEvent["sender"]) => any } = {}
    private _info = "|websocket|"
    private _sync_list: { [hash: string]: (req: WebSocketEvent["receiver"]) => void } = {}
}

interface WebSocketEvent<T extends keyof DataType = keyof DataType> {
    sender: { key: string, data: DataType[T]["req"], type: "send" } | { key: string, data: DataType[T]["req"], hash: string, type: "get" }
    receiver: { key: string, data: DataType[T]["resolve"], hash: string, type: "receive" }
}