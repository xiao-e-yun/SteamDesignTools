import { createApp } from "vue";
import App from "./App.vue";
import {router} from "./router";
import { store , key} from "./store";
import ws from "./websocket";

window.ws = new ws();
addEventListener("resize",()=>window.resizeTo(1200,600))

console.log("啟動GUI")
createApp(App)
    .use(store,key)
    .use(router)
    .mount("#root");