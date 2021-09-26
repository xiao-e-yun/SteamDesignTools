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
            <h2 class="select_compression_type">壓縮圖片</h2>
            <div class="select_compression_list">
              <div>
                最高畫質
                <div>
                  <input
                    type="number"
                    v-model="edit_setting.quality[1]"
                    @change="max_quality"
                  />
                  <button @click="max_quality(true)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-plus-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"
                      />
                    </svg>
                  </button>
                  <button @click="max_quality(false)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-dash-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                最低畫質
                <div>
                  <input
                    type="number"
                    v-model="edit_setting.quality[0]"
                    @change="min_quality"
                  />
                  <button @click="min_quality(true)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-plus-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"
                      />
                    </svg>
                  </button>
                  <button @click="min_quality(false)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-dash-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                壓縮速度
                <div>
                  <button @click="speed(true)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-plus-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"
                      />
                    </svg>
                  </button>
                  <input disabled type="number" v-model="edit_setting.speed" />
                  <button @click="speed(false)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-dash-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <button @click="compression">開始壓縮</button>
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
import { DataType } from "VS/protocol";

export default defineComponent({
  components: {
    ChooseFiles,
    ViewFiles,
  },

  mixins: [mixin],

  data() {
    let edit_setting: DataType["compression"]["req"]["option"];
    const save = localStorage.getItem("steam_design_tools$compression_setting");
    if (save) {
      edit_setting = JSON.parse(save);
    } else {
      edit_setting = {
        base64: false,
        quality: [60, 100],
        speed: 1,
      };
    }
    return {
      imgs: [] as { name: string; path: string; file?: File }[],
      edit_setting,
    };
  },

  watch: {
    edit_setting: {
      handler(val: DataType["compression"]["req"]["option"]) {
        localStorage.setItem(
          "steam_design_tools$compression_setting",
          JSON.stringify(val)
        );
      },
      deep: true,
    },
  },

  methods: {
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

    async compression(): Promise<void> {
      this.loading(true);
      const reader = new FileReader();
      const imgs = [] as DataType["compression"]["req"]["imgs"];

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
      await this.$ws.get("compression", { option, imgs });
      this.loading(false);

      function read_img(img: File) {
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      }
    },

    speed(bool: boolean): void {
      let speed = this.edit_setting.speed + (bool ? 1 : -1);

      if (speed < 1) this.edit_setting.speed = 1;
      else if (speed > 10) this.edit_setting.speed = 10;
      else this.edit_setting.speed = speed;
    },

    max_quality(e: Event | boolean): void {
      let quality;
      if (typeof e === "boolean")
        quality = this.edit_setting.quality[1] + (e ? 10 : -10);
      else quality = (e.target as HTMLInputElement).valueAsNumber;

      if (quality > 100) quality = 100;
      else if (quality < 20) quality = 20;
      if (quality < this.edit_setting.quality[0])
        this.edit_setting.quality[0] = quality;

      this.edit_setting.quality[1] = quality;
    },

    min_quality(e: Event | boolean): void {
      let quality;
      if (typeof e === "boolean")
        quality = this.edit_setting.quality[0] + (e ? 10 : -10);
      else quality = (e.target as HTMLInputElement).valueAsNumber;

      if (quality > 100) quality = 100;
      else if (quality < 20) quality = 20;
      if (quality > this.edit_setting.quality[1])
        this.edit_setting.quality[1] = quality;

      this.edit_setting.quality[0] = quality;
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

.select_compression_type {
  position: relative;
  font-weight: 800;
  color: $main;
  background-color: $side-2;
  padding-right: 2em;
  margin: 0;
  min-width: 20%;
  padding: 0.1em 4em 0.1em 0.2em;
  word-break: keep-all;
  border-bottom: $border;
}

.select_compression_list {
  margin: 0.4em;
  & > div {
    padding: 0.2em 0;
    font-weight: 800;
    & > div {
      border: $border;
      display: inline-flex;
      align-items: stretch;
      & > input,
      & > button {
        background-color: $bg;
        text-align: center;
        font-weight: 800;
        padding: 0.4em;
        border: none;
        color: $main;
        &:hover {
          background-color: $side-2;
        }
      }
      & > input {
        padding: 0;
        width: 100%;
        font-size: 1.2em;
      }
      & > button {
        padding: 0.25em 0.5em;
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
