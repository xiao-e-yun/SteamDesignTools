<template>
  <div id="app">
    <transition name="fade">
        <div v-if="loading" id="loading"><span class="loader"><span class="loader_inner"></span></span></div>
    </transition>
    <SidebarTemplate />
    <router-view id="main" />
    <LoggerTemplate />
  </div>
</template>

<script lang="ts">
/// <reference path="../types/global.d.ts" />
import { Options, Vue, setup } from "vue-class-component";
import { useStore } from "./store";
import { ref, toRef } from "vue";
import Sidebar from "./components/sidebar.vue";
import Logger from "./components/logger.vue";
window.ws
@Options({
  components: {
    SidebarTemplate: Sidebar,
    LoggerTemplate: Logger,
  },
})
export default class extends Vue {
  loading = setup(() => {
    return toRef(useStore().state, "loading");
  });
}
</script>

<style lang="scss">
@import "./app.scss";
:root {
  --main: #f1dac4;
  --side-1: #a69cac;
  --side-2: #474973;
  --side-3: #161b33;
  --bg: #0d0c1d;
  --white: #d9d9d9;
  --black: #262626;
}

* {
    font-family: "Microsoft JhengHei";
    box-sizing: border-box;
}

body {
  background: $bg;
  margin: 0;
}

#app {
  color: $main;
  display: flex;
  height: 100vh;
  width: 100vw;
}

#main {
  width: 100%;
  padding: 0 1.5em;
  overflow: overlay;
  align-items: baseline;
  display: flex;
  flex-direction: column;
}

#loading {
  z-index: 99999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);

  & > .loader {
    position: absolute;
    top: 1.5em;
    right: 1.5em;
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 4px solid $main;
    animation: loader 2s infinite ease;
    & > .loader_inner {
      vertical-align: top;
      display: inline-block;
      width: 100%;
      background-color: $main;
      animation: loader_inner 2s infinite ease-in;
    }
  }

  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(180deg);
    }
    50% {
      transform: rotate(180deg);
    }
    75% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes loader_inner {
    0% {
      height: 0%;
    }
    25% {
      height: 0%;
    }
    50% {
      height: 100%;
    }
    75% {
      height: 100%;
    }
    100% {
      height: 0%;
    }
  }
}
.fade-enter-active {
  animation: fade_in .4s;
}
.fade-leave-active {
  animation: fade_in .4s reverse;
}
@keyframes fade_in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>