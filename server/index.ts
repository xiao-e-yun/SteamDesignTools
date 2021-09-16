import child_process from 'child_process';
import { promises as fs, existsSync as exists } from 'fs'
import express from 'express'
import SocketServer from 'ws'
import { Server } from 'http'
import process from "process"
import path from 'path'

//@ts-ignore 這個沒有定義
import isPortReachable = require('is-port-reachable');

//自訂的module
import _websocket from './websocket'
import main from './main'
import $app from './app'

const root_path = path.join(__dirname, '../')
const www_path = path.join(root_path, 'www/')
;(async () => {
    //初始化
    const tmp_path = path.join(root_path + "tmp/")
    if(!exists(tmp_path)) fs.mkdir(tmp_path)
    const config_path = path.join(root_path + "config.json")
    if(!exists(config_path)) fs.writeFile(config_path,"{}")
    
    //啟動伺服器
    //伺服器設定
    let websocket: _websocket
    let server: Server;
    let port = 8701

    const app = express()

    while (true) {
        if (!await isPortReachable(port, { host: 'localhost' })) break
        else port++
    }

    console.log("選擇的伺服器埠為", port);

    server = app.listen(port, () => {

    })
    const wss = new SocketServer.Server({ server })

    if (process.env.NODE_ENV === "development") {
        console.log("開發模式")
        console.log(`請手動開啟 http://localhost:${port}`)
    } else //啟動瀏覽器 
        child_process.exec(`start msedge --app=http://localhost:${port}`)

    //當 WebSocket 從外部連結時執行
    let connection_count = 0
    let timeout: NodeJS.Timeout
    wss.on('connection', ws => {
        connection_count++
        if (connection_count > 1) return ws.close() // 忽略連線
        if (timeout) clearTimeout(timeout)

        //開始收發資料
        websocket = new _websocket(ws)
        main(websocket, new $app)
        ws.on('close', () => {
            connection_count--
            timeout = setTimeout(() => {
                console.log("失去連線過久，退出進程");
                process.exit()
            }, 3000)
        })
    })

    app.use(express.static(www_path))
    app.get('*', function (req, res) {
        res.sendFile(path.join(www_path, 'index.html'));
    });
})()