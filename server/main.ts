import _ws from "./websocket"
import _app from "./app"
export default function (ws:_ws,app:_app) {
    ws.on("resize",(data)=>{
        app.resize(data.data.type,data.data.imgs)
    })
}