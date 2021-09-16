/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// import ws from './websocket'

declare module 'vue/types/vue' {
  declare global {
    interface Window {
      ws: {}
    }
  }
  interface Vue {
    $router: VueRouter;
    $route: Route;
  }
}