<template>
    <main>
        <h1>調整圖片大小，適配SteamProfile</h1>
        <ImgEditor ref="editor">
            <h1>圖片調整至</h1>
            <button v-for="(name,index) in resize_to_list" @click="resize_to(index)" :key="index" v-text="name"></button>
        </ImgEditor>
    </main>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ImgEditor from "../components/img_editor.vue";

@Options({
    components: {
        ImgEditor,
    },
    methods: {
        async resize_to(i:number) {
            this.$store.commit("loading", true);
            const reader = new FileReader()
            const imgs = [] as {name:string,data:string}[]
            interface Editor{imgs:{name: string,link_url: string,file: File}[]}
            for (const img of this.$refs.editor.imgs as Editor["imgs"]) {
                const data = await read_img(img.file) as string
                imgs.push({
                    name: img.name,
                    data,
                })
            }
            window.ws.send("resize",{type:i,imgs})
            this.$store.commit("loading", false);

            async function read_img(img:File){
                return new Promise(async (resolve, reject)=>{
                    reader.onload = ()=> resolve(reader.result)
                    reader.readAsDataURL(img)
                })
            }
        },
    },
})
export default class Home extends Vue {
    data() {
        return {
            have_file: false,
            imgs: [] as { name: string; data: string }[],
            dragenter: 0,
            resize_to_list: [
                "精選藝術作品展示欄",
                "藝術作品展示欄",
            ]
        };
    }
}
</script>

<style lang="scss">
@import "../app.scss";
</style>