import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store, mapMutations as mapMutations, mapState, mapActions } from 'vuex'

export interface State {
  console_opened: boolean
  loading: boolean
  logger:{title:string,content:string}[]
}

export const key: InjectionKey<Store<State>> = Symbol()

const $store = {
  state: {
    console_opened: false,
    loading:false,
    logger:[],
  },
  actions: {

  },
  mutations: {
    log(state:State,payload:{title:string,content:string}) {state.logger.push(payload)},
    loading(state:State,payload:boolean){state.loading=payload},
  }
}

export const store = createStore<State>($store)

export const mixin = {
  methods: {
    ...mapActions(Object.keys($store.actions) as Array<keyof typeof $store["actions"]>),
    ...mapMutations(Object.keys($store.mutations) as Array<keyof typeof $store["mutations"]>)
  }
}

export function useStore () {
  return baseUseStore(key)
}