<template>
  <main>
    <div class="img_editor">
      <transition name="fade" mode="out-in">
        <ChooseFiles v-if="imgs.length === 0" @files="upload" />
        <div v-else class="preview_and_setting">
          <ViewFiles
            :base64="edit_setting.base64"
            :imgs="imgs"
            @re_choose="re_choose"
          />
          <div class="edit_setting">
            <div class="select_build_type">
              <h2
                v-text="build_type[edit_setting.main].name"
                @click="show_build_type_list = !show_build_type_list"
              />
              <transition name="fade">
                <div
                  class="build_type_list"
                  v-if="show_build_type_list"
                  @click="show_build_type_list = false"
                  @mouseleave="show_build_type_list = false"
                >
                  <button
                    v-for="(data, index) in build_type"
                    v-text="data.name"
                    @click="
                      edit_setting.main = index;
                      edit_setting.size = data.size;
                    "
                    :key="index"
                  />
                </div>
              </transition>
            </div>
            <div class="select_build_list">
              <div class="setting_background">
                <img
                  v-if="edit_setting.background.url !== ''"
                  :src="edit_setting.background.url"
                  alt="這個網址不可用"
                />
                <div>
                  <input
                    @input="get_bg_url"
                    :value="this.edit_setting.background.url"
                    type="text"
                    placeholder="背景網址"
                  /><br />
                  支持
                  <a
                    href="https://steam.design/"
                    target="_blank"
                    rel="noreferrer noopener"
                    >Steam.Design</a
                  >
                  ，直接複製網址。
                </div>
              </div>

              <p
                class="checkbox"
                v-if="edit_setting.main === 0 || edit_setting.main === 2"
                @click="edit_setting.auto_cut = !edit_setting.auto_cut"
                :data-checked="edit_setting.auto_cut"
              >
                自動切割
              </p>
              <p
                class="checkbox"
                v-if="edit_setting.main === 0 && edit_setting.auto_cut"
                @click="
                  edit_setting.right_more_img_clip =
                    !edit_setting.right_more_img_clip
                "
                :data-checked="edit_setting.right_more_img_clip"
              >
                裁減更多圖片
              </p>

              <button @click="build">開始構建</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<script lang="tsx">
import { defineComponent } from "vue";
import ChooseFiles from "@/components/choose_files.vue";
import ViewFiles from "@/components/view_files.vue";
import { mixin } from "@/store";
import DataType from "VS/protocol";

export default defineComponent({
  components: {
    ChooseFiles,
    ViewFiles,
  },

  mixins: [mixin],

  data() {
    let edit_setting: DataType["build"]["req"]["option"];
    const save = localStorage.getItem("steam_design_tools$build_setting");
    if (save) edit_setting = JSON.parse(save);
    else
      edit_setting = {
        base64: false,
        main: 0,
        size: 615,
        auto_cut: true,
        right_more_img_clip: true,
        background: {
          url: "",
        },
      };
    return {
      imgs: [] as { name: string; path: string; file?: File }[],
      show_build_type_list: false,
      edit_setting,
      build_type: [
        {
          name: "藝術作品展示欄",
          size: 615,
        },
        {
          name: "精選藝術作品展示欄",
          size: 630,
        },
        {
          name: "工作坊展示欄",
          size: 628,
        },
      ],
    };
  },

  watch: {
    edit_setting: {
      handler(val) {
        localStorage.setItem(
          "steam_design_tools$build_setting",
          JSON.stringify(val)
        );
      },
      deep: true,
    },
  },

  methods: {
    get_bg_url(event: Event) {
      let url = (event.target as HTMLInputElement).value?.trim();

      if (!/\.(jpe?g|png)$/i.test(url) || url.indexOf("http") !== 0)
        return (this.edit_setting.background.url = "");

      const index = url.indexOf("steam.design/#"); // length === 14
      if (index !== -1) url = url.substring(index + 14);

      this.edit_setting.background.url = url;
    },

    upload(upload: { files: FileList | string[]; use_base64: boolean }): void {
      const imgs = [] as { name: string; path: string; file?: File }[];
      this.edit_setting.base64 = upload.use_base64;
      if (upload.use_base64) {
        const files = Array.from(upload.files as FileList); //轉換成陣列
        for (const file of files) {
          //驗證檔案類型
          if (!/\.(jpe?g|png)$/i.test(file.name)) {
            this.log(`錯誤類型`, "");
            return;
          }
          const name = file.name;
          const path = URL.createObjectURL(file);
          imgs.push({ name, path, file });
        }
      } else {
        for (const path of upload.files as string[]) {
          imgs.push({
            name: path.split("\\").pop() || "",
            path,
          });
        }
      }

      this.imgs = imgs.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      console.log("加載完成");
    },

    re_choose(): void {
      this.imgs = [];
    },

    async build(): Promise<void> {
      this.loading(true);
      const reader = new FileReader();
      const imgs = [] as DataType["build"]["req"]["imgs"];

      if (this.edit_setting.base64) {
        for (const img of this.imgs) {
          const data = (await read_img(img.file as File)) as string;
          imgs.push({
            name: img.name,
            data,
          });
        }
      } else {
        for (const img of this.imgs) {
          imgs.push({
            name: img.name,
            data: img.path,
          });
        }
      }

      const option = this.edit_setting;
      await this.$ws.get("build", { option, imgs });
      this.loading(false);

      function read_img(img: File) {
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      }
    },
  },
});
</script>

<style lang="scss">
@import "../app.scss";
.img_editor {
  width: 100%;
  .preview_and_setting {
    display: flex;
    & > div {
      background: $side-3;
    }
    .edit_setting {
      max-width: 30%;
    }
  }
}

.select_build_type {
  position: relative;
  & > h2 {
    font-weight: 800;
    color: $main;
    background-color: $side-2;
    padding-right: 2em;
    margin: 0;
    min-width: 20%;
    padding: 0.1em 4em 0.1em 0.2em;
    word-break: keep-all;
    border-bottom: $border;
    cursor: pointer;
    &:hover {
      color: $bg;
      background-color: $main;
    }
  }
  & > .build_type_list {
    position: absolute;
    top: 100%;
    width: calc(100% - 0.2em);
    margin: 0.2em;
    background-color: $side-3;
    border: $border;
    & > button {
      font-size: 1em;
      font-weight: 800;
      padding: 0.2em 0;
      width: 100%;
      text-align: center;
      color: $main;
      background-color: transparent;
      border: none;
      &:hover {
        background-color: $main;
        color: $bg;
      }
    }
  }
}

.select_build_list {
  margin: 4%;
  & > .setting_background {
    overflow: hidden;
    background-color: $main;
    & > img,
    & > div {
      width: 96%;
    }
    & > img {
      margin: 2%;
      vertical-align: middle;
      text-align: center;
    }
    & > div {
      color: $bg;
      width: 100%;
      text-align: left;
      font-weight: 800;
      padding: 0.2em 0.6em;
      & input {
        width: 100%;
        padding: 0.3em 0 0.3em 0.6em;
        color: $main;
        border: none;
        background-color: $side-2;
        &::placeholder {
          color: $side-1;
          font-size: 1.2em;
          font-weight: 800;
        }
      }
      & a {
        font-weight: 1000;
        color: $side-2;
        text-decoration: none;
        &:hover {
          color: $bg;
        }
      }
    }
  }

  & > p {
    &.checkbox {
      display: flex;
      align-items: center;
      &::before {
        content: "";
        width: 0.8em;
        height: 0.8em;
        margin: 0.2em;
        border: $border;
        background-color: $side-3;
        transition: background-color 0.1s;
        cursor: pointer;
      }
      &[data-checked="true"]::before {
        background-color: $main;
      }
    }
  }

  & > button {
    width: 100%;
    font-size: 1.6em;
    margin-top: 0.6em;
    background-color: $side-2;
    border: none;
    color: $main;
    cursor: pointer;
    transition: background-color 0.16s;
    &:hover {
      background-color: $bg;
    }
  }
}
</style>
