<template>
  <div class="files_manage">
    <transition name="fade" mode="out-in">
      <Choose v-if="imgs.length === 0" @files="upload" />
      <div v-else class="preview_and_setting">
        <View
          :base64="base64"
          :imgs="imgs"
          @re_choose="
            imgs = [];
            keep_imgs.length > 0 && $emit('imgs', []);
          "
        />
        <div class="setting">
          <div class="setting_type">
            <slot name="type" />
          </div>
          <div class="setting_list">
            <slot name="list" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mixin } from "@/store";
import Choose from "./files_manage/choose.vue";
import View from "./files_manage/view.vue";

export default defineComponent({
  components: {
    Choose,
    View,
  },
  mixins: [mixin],
  props: {
    keep_imgs: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
  },
  data() {
    const keep = this.keep_imgs as {
      name: string;
      path: string;
      file?: File;
    }[];
    let base64 =
      keep.length !== 0 && keep[0].path.indexOf("blob:") === 0 ? true : false;
    if (keep) this.base64;
    return {
      base64,
      imgs: keep,
    };
  },
  watch: {
    base64(val) {
      this.$emit("base64", val);
    },
  },
  methods: {
    upload(upload: { files: FileList | string[]; use_base64: boolean }): void {
      const imgs = [] as { name: string; path: string; file?: File }[];
      this.base64 = upload.use_base64;
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
      this.$emit("imgs", this.imgs);
      console.log("加載完成");
    },
  },
});
</script>

<style lang="scss">
@import "@/app.scss";

.files_manage {
  width: 100%;
  .preview_and_setting {
    display: flex;
    & > div {
      background: $side-3;
    }
    .setting {
      max-width: 30%;

      & > .setting_type {
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
        }
      }

      & > .setting_list {
        margin: 4%;
        .checkbox {
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

        .input_number {
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

        .inline_select {
          display: flex;
          justify-content: center;
          flex-direction: column;
          background-color: $side-2;
          & > button {
            font-size: 1.2em;
            font-weight: 600;
            color: $main;
            width: 100%;
            border: 2px solid transparent;
            background-color: transparent;
            transition: border-left-color 0.2s ease-in-out;
            border-radius: 0;
            &:hover {
              background-color: $black;
            }
            &.active {
              border-left-color: $main;
            }
          }
        }
      }
    }
  }
}
</style>
