import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home.vue";


function import_vue(name:string){return import(`../views/${name}.vue`)}
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首頁",
    component: Home,
  },
  {
    path: "/resize",
    name: "調整圖片",
    component:()=>import_vue("resize"),
  },
  {
    path: "/add_bg",
    name: "新增背景",
    component:()=>import_vue("add_bg"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const list = [] as {path:string,name:string,}[] 
for (const item of routes) {
  list.push({
    path:item.path,
    name:(item.name as string),
  })
}

export {router,list}