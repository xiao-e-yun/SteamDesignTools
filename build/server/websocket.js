"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    constructor(ws) {
        this.event = {};
        this._info = "|websocket|";
        this._sync_list = {};
        this.ws = ws;
        console.log(this._info + "已連線");
        this.ws.addEventListener("message", (event) => {
            const $data = JSON.parse(event.data);
            switch ($data.type) {
                case "get":
                case "send": {
                    let $return = null;
                    if (typeof this.event[$data.key] === "undefined")
                        console.warn(this._info + $data.type + "|" + $data.key + "|未註冊");
                    else
                        $return = this.event[$data.key]($data);
                    if ($data.type === "get") {
                        const req = JSON.stringify({ key: $data.key, data: $return, hash: $data.hash, type: "receive" });
                        this.ws.send(req);
                    }
                    break;
                }
                case "receive": {
                    const sysc_list = this._sync_list;
                    if (typeof sysc_list[$data.hash] === "undefined")
                        return;
                    sysc_list[$data.hash]($data);
                    delete sysc_list[$data.hash];
                    break;
                }
            }
        });
        this.ws.addEventListener("close", () => console.error(this._info + "已斷線"));
    }
    on(key, fun) {
        if (this.event[key])
            console.warn(this._info + key + "|重複註冊");
        else {
            this.event[key] = fun;
            console.log(this._info + key + "|註冊成功");
        }
    }
    off(key) {
        if (!this.event[key])
            console.warn(this._info + key + "|嘗試刪除未註冊");
        else {
            delete this.event[key];
            console.log(this._info + key + "|刪除註冊");
        }
    }
    send(key, data) {
        const req = JSON.stringify({ key: key, data: data, type: "send" });
        this.ws.send(req);
    }
    //==========================================
    //      sync 互動
    //==========================================
    async get(key, data) {
        const hash = this._hash();
        const req = JSON.stringify({ key: key, data: data, type: "get", hash });
        this.ws.send(req);
        return new Promise((resolve, reject) => this._sync_list[hash] = resolve);
    }
    _hash() { let result = ''; const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 12; i++)
        result += characters.charAt(Math.floor(Math.random() * 62)); return result; }
}
exports.default = default_1;
//# sourceMappingURL=websocket.js.map