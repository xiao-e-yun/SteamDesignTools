"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const process_1 = __importDefault(require("process"));
//@ts-ignore 這個沒有定義
const isPortReachable = require("is-port-reachable");
//自訂的module
const websocket_1 = __importDefault(require("./websocket"));
const utils = __importStar(require("./utils"));
const main_1 = __importDefault(require("./main"));
(async () => {
    //初始化
    const tmp_path = utils.path("tmp");
    if (!fs_1.existsSync(tmp_path))
        fs_1.promises.mkdir(tmp_path);
    const config_path = utils.path("config");
    if (!fs_1.existsSync(config_path))
        fs_1.promises.writeFile(config_path, "{}");
    //啟動伺服器
    //伺服器設定
    let websocket;
    let server;
    let port = 8701;
    const app = express_1.default();
    while (true) {
        if (!await isPortReachable(port, { host: 'localhost' }))
            break;
        else
            port++;
    }
    console.log("選擇的伺服器埠為", port);
    server = app.listen(port, () => {
    });
    const wss = new ws_1.default.Server({
        server,
        maxPayload: 1024 * 1024 * 1024 * 2 //2GB
    });
    if (process_1.default.env.NODE_ENV === "development") {
        console.log("開發模式");
        console.log(`請手動開啟 http://localhost:${port}`);
    }
    else //啟動瀏覽器 
        child_process_1.default.exec(`start msedge --app=http://localhost:${port} --window-size=1200,600`);
    //當 WebSocket 從外部連結時執行
    let connection_count = 0;
    let timeout;
    wss.on('connection', ws => {
        connection_count++;
        if (connection_count > 1)
            return ws.close(); // 忽略連線
        if (timeout)
            clearTimeout(timeout);
        //開始收發資料
        websocket = new websocket_1.default(ws);
        main_1.default(websocket);
        ws.on('close', () => {
            connection_count--;
            timeout = setTimeout(() => {
                console.log("失去連線過久，退出進程");
                process_1.default.exit();
            }, 3000);
        });
    });
    app.use(express_1.default.static(utils.path('www')));
    app.get('*', function (req, res) {
        res.sendFile(utils.path('www', 'index.html'));
    });
})();
//# sourceMappingURL=index.js.map