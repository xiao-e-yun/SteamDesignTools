import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home.vue";

function import_vue(name: string) {
  return () => import(`../views/${name}.vue`);
}
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首頁",
    component: Home,
  },
  //
  {
    path: "/settings",
    name: "設置",
    component: import_vue("settings"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const list = [] as { path: string; name: string }[];
for (const item of routes) {
  list.push({
    path: item.path,
    name: item.name as string,
  });
}

export { router, list };
