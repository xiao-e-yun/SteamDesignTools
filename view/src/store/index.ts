import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import ws from "../websocket"

export interface State {
  console_opened: boolean
  loading: boolean
  logger:{title:string,content:string}[]
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    console_opened: false,
    loading:false,
    logger:[],
  },
  mutations: {
    log(state,payload:{title:string,content:string}) {state.logger.push(payload)},
    loading(state,payload:boolean){state.loading=payload},
  }
})

export function useStore () {
  return baseUseStore(key)
}