/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import DataType from "VS/protocol";
export default class {
  constructor() {
    this.ws = new WebSocket("ws://localhost:" + location.port);
    this.ws.addEventListener("message", (event) => {
      const $data = JSON.parse(event.data) as
        | WebSocketEvent["sender"]
        | WebSocketEvent["receiver"];
      switch ($data.type) {
        case "get": //發送請求
        case "send": {
          let promise_data: any = null;
          if (typeof this.event[$data.key] === "undefined")
            console.warn(this._info + $data.key + "|未註冊");
          else promise_data = this.event[$data.key]($data);

          if ($data.type === "get") {
            const req = JSON.stringify({
              key: $data.key,
              data: promise_data,
              hash: $data.hash,
              type: "receive",
            } as WebSocketEvent["receiver"]);
            if (this.ws.readyState === 0) this._wait_send.push(req);
            else this.ws.send(req);
          }
          break;
        }
        case "receive": {
          //取得請求
          this._sync_list[$data.hash]($data as WebSocketEvent["receiver"]);
          delete this._sync_list[$data.hash];
          break;
        }
      }
    });
    this.ws.addEventListener("open", () => {
      console.debug(this._info + "已連線");
      this._wait_send.forEach((req) => this.ws.send(req));
      this._wait_send = [];
    });
    this.ws.addEventListener("close", () => {
      console.error(this._info + "已斷線");
      close(); //如果無法close，嘗試重新連線
      console.warn(this._info + "無法關閉");
      setTimeout(() => {
        const mode = process.env.NODE_ENV;
        if (mode === "development") location.reload();
        else alert("無法關閉，請檢查是否已被啟動");
      }, 500);
    });
  }

  on<T extends keyof DataType>(
    key: T,
    fun: (
      data: WebSocketEvent<T>["sender"]
    ) => DataType[T]["resolve"] | Promise<DataType[T]["resolve"]>
  ): void;
  on(key: string, fun: (data: WebSocketEvent["sender"]) => any) {
    if (this.event[key]) console.warn(this._info + key + "|重複註冊");
    else {
      this.event[key] = fun;
      console.log(this._info + key + "|註冊成功");
    }
  }

  once<T extends keyof DataType>(
    key: T,
    fun: (
      data: WebSocketEvent<T>["sender"]
    ) => DataType[T]["resolve"] | Promise<DataType[T]["resolve"]>
  ): void;
  once(key: string, fun: (data: WebSocketEvent["sender"]) => any) {
    this.event[key] = (data) => {
      fun(data);
      delete this.event[key];
    };
    console.log(this._info + key + "|一次性註冊成功");
  }

  off<T extends keyof DataType>(key: T): void;
  off(key: string) {
    if (!this.event[key]) console.warn(this._info + key + "|嘗試刪除未註冊");
    else {
      delete this.event[key];
      console.log(this._info + key + "|刪除註冊");
    }
  }
  send<T extends keyof DataType>(key: T, data: DataType[T]["req"]): void;
  send(key: string, data: any): void {
    const req = JSON.stringify({
      key: key,
      data: data,
      type: "send",
    } as WebSocketEvent["sender"]);
    if (this.ws.readyState === 0) this._wait_send.push(req);
    else this.ws.send(req);
  }

  //==========================================
  //      sync 互動
  //==========================================

  get<T extends keyof DataType>(
    key: T,
    data: DataType[T]["req"]
  ): Promise<WebSocketEvent<T>["receiver"]>;
  async get(key: string, data: any): Promise<WebSocketEvent<any>["receiver"]> {
    const hash = this._hash();
    const req = JSON.stringify({
      key: key,
      data: data,
      type: "get",
      hash,
    } as WebSocketEvent["sender"]);
    if (this.ws.readyState === 0) {
      this._wait_send.push(req);
    } else this.ws.send(req);
    return new Promise((resolve) => (this._sync_list[hash] = resolve));
  }

  ws: WebSocket;
  event: { [key: string]: (enevt: WebSocketEvent["sender"]) => any } = {};
  private _info = "|websocket|";
  private _wait_send: string[] = [];
  private _sync_list: {
    [hash: string]: (req: WebSocketEvent["receiver"]) => void;
  } = {};
  private _hash() {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 12; i++)
      result += characters.charAt(Math.floor(Math.random() * 62));
    return result;
  }
}

interface WebSocketEvent<T extends keyof DataType = keyof DataType> {
  sender:
    | { key: string; data: DataType[T]["req"]; type: "send" }
    | { key: string; data: DataType[T]["req"]; hash: string; type: "get" };
  receiver: {
    key: string;
    data: DataType[T]["resolve"];
    hash: string;
    type: "receive";
  };
}
