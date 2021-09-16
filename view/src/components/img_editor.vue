<template>
    <div class="img_editor">
        <transition name="fade" mode="out-in">
            <ChooseFiles v-if="!have_file" @files="upload" />
            <div v-else class="preview_and_setting">
                <ViewFiles :imgs="imgs" @re_choose="re_choose" />
                <div class="edit_setting">
                    <slot>沒有任何可以編輯的選項</slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ChooseFiles from "./choose_files.vue";
import ViewFiles from "./view_files.vue";

@Options({
    components: {
        ChooseFiles,
        ViewFiles,
    },
    methods: {
        upload($files: FileList) {
            const imgs = [] as { name: string; link_url: string ; file:File}[]
            const files = Array.from($files); //轉換成陣列
            for (const file of files) {
                //驗證檔案類型
                if (!/\.(jpe?g|png)$/i.test(file.name)) {
                    return this.log(
                        "無效的檔案類型",
                        `"${file.name}"無法讀取\n請選擇 .jpg .png 的檔案`
                    );
                }
                const name = file.name
                const link_url = URL.createObjectURL(file)
                imgs.push({ name, link_url, file })
            }
            this.have_file = true;
            this.imgs = imgs.sort((a, b) => {return a.name.localeCompare(b.name)})
            console.log("加載完成");
        },
        re_choose(){
            this.have_file = false;
            this.imgs = [];
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
.img_editor {
    width: 100%;
    .preview_and_setting {
        display: flex;
        &>div {
            background: $side-3;
        }
        .edit_setting {
            width: max-content;
            min-width: 20%;
            padding: 0 .4em;
            & > button {
                display: block;
                font-size: 1.2em;
                border:$border;
                margin: .2em 0;
                background: $side-2;
                color: $main;
                &:hover {
                    color: $side-3;
                    background: $side-1;
                }
            }
        }
    }
}
</style>