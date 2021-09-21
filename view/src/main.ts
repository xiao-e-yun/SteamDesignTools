import { createApp } from "vue";
import App from "./App.vue";
import {router} from "./router";
import { store , key} from "./store";
import _ws from "./websocket";

addEventListener("resize",()=>window.resizeTo(1200,600));window.resizeTo(1200,600)

const ws = window.ws = new _ws()

console.log("啟動GUI")
const app = createApp(App)

const app_prop = app.config.globalProperties
app_prop.$ws = ws

app
    .use(store,key)
    .use(router)
    .mount("#root")