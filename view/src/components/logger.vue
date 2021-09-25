<template>
  <div id="logger">
    <transition-group name="fade" mode="out-in">
      <div v-for="(log, index) in logger" :key="index">
        <button @click="logger.splice(index, 1)"></button>
        <h2 v-html="log.title"></h2>
        <p v-html="log.content"></p>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { useStore } from "../store";
import { defineComponent, toRef } from "vue";

export default defineComponent({
  setup() {
    return {
      logger: toRef(useStore().state, "logger"),
    };
  },
});
</script>

<style lang="scss">
@import "../app.scss";
</style>
