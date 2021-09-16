"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
//@ts-ignore 這個沒有定義
const isPortReachable = require("is-port-reachable");
//自訂的module
const websocket_1 = __importDefault(require("./websocket"));
const main_1 = __importDefault(require("./main"));
const app_1 = __importDefault(require("./app"));
const root_path = path_1.default.join(__dirname, '../');
const www_path = path_1.default.join(root_path, 'www/');
(async () => {
    //初始化
    const tmp_path = path_1.default.join(root_path + "tmp/");
    if (!fs_1.existsSync(tmp_path))
        fs_1.promises.mkdir(tmp_path);
    const config_path = path_1.default.join(root_path + "config.json");
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
    const wss = new ws_1.default.Server({ server });
    if (process_1.default.env.NODE_ENV === "development") {
        console.log("開發模式");
        console.log(`請手動開啟 http://localhost:${port}`);
    }
    else //啟動瀏覽器 
        child_process_1.default.exec(`start msedge --app=http://localhost:${port}`);
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
        main_1.default(websocket, new app_1.default);
        ws.on('close', () => {
            connection_count--;
            timeout = setTimeout(() => {
                console.log("失去連線過久，退出進程");
                process_1.default.exit();
            }, 3000);
        });
    });
    app.use(express_1.default.static(www_path));
    app.get('*', function (req, res) {
        res.sendFile(path_1.default.join(www_path, 'index.html'));
    });
})();
//# sourceMappingURL=index.js.map