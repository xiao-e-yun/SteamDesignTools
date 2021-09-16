<template>
    <div id="logger">
        <div v-for="(log,index) in logger" :key="index">
            <button @click="logger.splice(index, 1)"></button>
            <h2 v-html="log.title"></h2>
            <p v-html="log.content"></p>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options, setup } from "vue-class-component";
import { useStore } from "../store";
import { toRef} from "vue";

@Options({
})
export default class extends Vue {
    logger = setup(()=>{ return toRef(useStore().state,"logger") })
}
</script>

<style lang="scss">
@import "../app.scss";

</style>