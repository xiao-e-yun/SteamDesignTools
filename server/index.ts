import child_process from 'child_process';
import express from 'express'
import SocketServer from 'ws'
import { Server } from 'http'
import process from "process"
import { createWriteStream } from "fs"

//@ts-ignore 這個沒有定義
import isPortReachable = require('is-port-reachable');

//自訂的module
import _websocket from './websocket'
import * as utils from "./utils"
import main from './main'

(async () => {
    const development = process.env.NODE_ENV === "development"
    const dev_mode = await utils.config("dev_mode")||false
    //初始化
    if(process.argv[2] !== "run" && !development) return

    //啟動伺服器
    //伺服器設定
    let websocket: _websocket
    let server: Server;
    let port = 8701

    const app = express()

    while (true) {
        if (!await isPortReachable(port, { host: '127.0.0.1' })) break
        else port++
    }

    console.log("選擇的伺服器埠為", port);

    server = app.listen(port)
    const wss = new SocketServer.Server({
        server,
        maxPayload: 1024 * 1024 * 1024 * 2 //2GB
    })

    if (development) {
        console.log("開發模式")
        console.log(`請手動開啟 http://localhost:${port}`)
    } else //啟動瀏覽器 
        child_process.exec(`start msedge --app=http://localhost:${port} --window-size=1200,600`)

    //當 WebSocket 從外部連結時執行
    let connection_count = 0
    let timeout: NodeJS.Timeout

    timeout = setTimeout(() => {
        console.log("尚未連線過久，退出進程");
        process.exit()
    }, 5000)

    wss.on('connection',async ws => {
        connection_count++
        if (connection_count > 1) return ws.close() // 忽略連線
        if (timeout) clearTimeout(timeout)

        //開發者模式
        if(dev_mode){
            const output = createWriteStream(utils.path("tmp","stdout.log"));
            const errorOutput = createWriteStream(utils.path("tmp","stderr.log"));
            const logger = new console.Console({
                stdout: output,
                stderr: errorOutput
            })
            console = logger
        }

        //開始收發資料
        websocket = new _websocket(ws)
        main(websocket)
        ws.on('close', () => {
            connection_count--
            timeout = setTimeout(() => {
                console.log("失去連線過久，退出進程");
                process.exit()
            }, 500)
        })
    })

    app.use(express.static(utils.path('www')))
    app.get('*', function (req, res) {
        const get_path = req.query.path
        if(get_path){
            const path = decodeURI(get_path as string)
            res.sendFile(path)
        }else{
            res.sendFile(utils.path('www','index.html'));
        }
    });
})()