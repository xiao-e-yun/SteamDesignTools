import SocketServer = require('ws')
export default class {
    constructor(ws:SocketServer) {
        this.ws = ws
        console.log(this._info + "已連線")
        this.ws.addEventListener("message", (event) => {
            const $data = JSON.parse(event.data) as WebSocketEvent["sender"]|WebSocketEvent["receiver"]
            switch ($data.type) {
                case "get":
                case "send":{
                    let $return = null
                    if (typeof this.event[$data.key] === "undefined") console.warn(this._info + $data.type + "|" + $data.key + "|未註冊")
                    else $return = this.event[$data.key]($data)
                    
                    if( $data.type === "get") {
                        const req = JSON.stringify({ key: $data.key, data: $return, hash:$data.hash, type: "receive"} as WebSocketEvent["receiver"])
                        this.ws.send(req)
                    }
                    break
                }
                case "receive":{
                    const sysc_list = this._sync_list
                    if(typeof sysc_list[$data.hash] === "undefined") return
                    sysc_list[$data.hash]($data as WebSocketEvent["receiver"])
                    delete sysc_list[$data.hash]
                    break
                }
            }
        })
        this.ws.addEventListener("close", () => console.error(this._info + "已斷線"))
    }

    on(key: string, fun: (data: WebSocketEvent["sender"]) => any) {
        if (this.event[key]) console.warn(this._info + key + "|重複註冊")
        else {
            this.event[key] = fun
            console.log(this._info + key + "|註冊成功")
        }
    }

    off(key: string) {
        if (!this.event[key]) console.warn(this._info + key + "|嘗試刪除未註冊")
        else {
            delete this.event[key]
            console.log(this._info + key + "|刪除註冊")
        }
    }

    send(key: string, data: any) {
        const req = JSON.stringify({ key: key, data: data, type: "send" } as WebSocketEvent["sender"])
        this.ws.send(req)
    }

    //==========================================
    //      sync 互動
    //==========================================

    async get(key: string, data: any) {
        const hash = this._hash()
        const req = JSON.stringify({ key: key, data: data, type: "get", hash} as WebSocketEvent["sender"])
        this.ws.send(req)
        return new Promise((resolve, reject) => this._sync_list[hash] = resolve)
    }

    ws: SocketServer
    event: { [key: string]: (enevt: WebSocketEvent["sender"]) => any } = {}
    private _info = "|websocket|"
    private _sync_list: { [hash: string]: (req: WebSocketEvent["receiver"]) => void } = {}
    private _hash() { let result = ''; const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 12; i++)result += characters.charAt(Math.floor(Math.random() * 62)); return result }
}

interface WebSocketEvent {
    sender: { key: string, data: any,hash?:string ,type:"send"|"get"}
    receiver: { key: string, data: any,hash:string ,type:"receive"}
}