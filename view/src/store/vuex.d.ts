import { ComponentCustomProperties } from 'vue'
import { State } from '.'
import ws from '@/websocket'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router,
    $store: State,
    $ws: ws
  }
}