import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { State } from '.'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $store: State
  }
}