<template>
    <main>
        <h1>調整圖片大小，適配SteamProfile</h1>
        <ImgEditor>
            <div></div>
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
        upload($files: FileList) {
            const files = Array.from($files); //轉換成陣列
            for (const file of files) {
                //驗證檔案類型
                if (!/\.(jpe?g|png)$/i.test(file.name)) {
                    return this.log(
                        "無效的檔案類型",
                        `"${file.name}"無法讀取\n請選擇 .jpg .png 的檔案`
                    );
                }
            }

            console.log("加載圖片中");
            const vm = this; //保存this
            const reader = new FileReader();

            const s = {
                i: files.length,
                data: [] as { name: string; data: string }[],
                done() {
                    vm.have_file = true;
                    vm.imgs = s.data.sort((a, b) => {return a.name.localeCompare(b.name)});
                    console.log("加載完成");
                },
            };
            syncload();
            function syncload() {
                const file = files[s.i - 1];
								console.log("正在讀取" + file.name)
                reader.onload = function (e) {
                    s.data.push({
                        name: file.name,
                        data: (e.target as FileReader).result as string,
                    });
                    s.i--;
                    if (s.i === 0) s.done();
                    else syncload();
                };
                reader.readAsDataURL(file);
            }
        },

        log(title: string, content: string) {
            this.$store.commit("log", { title: title, content: content });
        },
    },
})
export default class Home extends Vue {
    data() {
        return {
            have_file: false,
            imgs: [] as { name: string; data: string }[],
            dragenter: 0,
        };
    }
}
</script>

<style lang="scss">
@import "../app.scss";
</style>