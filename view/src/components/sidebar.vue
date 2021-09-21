<template>
  <aside id="sidebar">
    <div id="sidebar-top">
      <router-link v-for="item in list" :key="item.index" :to="item.path">{{
        item.name
      }}</router-link>
    </div>
    <div id="sidebar-bottom">
      <router-link to="/settings">設置</router-link>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { list } from "../router";
list.pop();

export default defineComponent({
    data() {
    return {
      list,
    };
  }
})
</script>

<style lang="scss">
@import "../app.scss";
#sidebar {
  width: max-content;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  background-color: $side-3;
  div > a {
    font-weight: 800;
    word-break: keep-all;
    display: block;
    width: 100%;
    color: $main;
    text-decoration: none;
    font-size: 1.6em;
    position: relative;
    padding: 0 0.2em;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0em;
      height: 100%;
      background-color: $main;
      transition: width 0.2s ease-in-out;
    }
    &:hover::after {
      width: 0.15em;
    }
    &.router-link-exact-active {
      color: $bg;
      z-index: 1;
      &::after {
        width: 100%;
        z-index: -1;
      }
    }
  }
}
</style>