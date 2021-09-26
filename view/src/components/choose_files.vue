<template>
  <div
    @click="file_choose"
    @drop="drag_file"
    @dragenter="drop_inout"
    @dragleave="drop_inout"
    @dragenter.prevent
    @dragover.prevent
    class="drop_here"
    :class="{ dropping: dragenter !== 0 }"
  >
    <h1>選擇或丟入圖片</h1>
  </div>
</template>

<script lang="ts">
import { mixin } from "@/store";
import { defineComponent } from "vue";

export default defineComponent({
  mixins: [mixin],
  methods: {
    //拖入檔案
    drag_file(e: DragEvent) {
      e.stopPropagation();
      e.preventDefault();
      this.dragenter = 0;
      const files = (e.dataTransfer as DataTransfer).files;
      if (files.length > 0) this.upload(files, true);
      else this.log("無檔案檔案", "無法讀取到丟入的檔案");
    },
    //拖曳檔案中
    drop_inout(e: DragEvent) {
      if (e.type == "dragenter") this.dragenter++;
      else this.dragenter--;
    },
    async file_choose() {
      const files_path = (await this.$ws.get("get_file", undefined)).data;
      if (files_path.length > 0) this.upload(files_path, false);
    },
    //通知父層
    upload(files: FileList | string[], use_base64: boolean) {
      this.$emit("files", { files, use_base64 });
    },
  },
  data() {
    return {
      dragenter: 0,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../app.scss";
.drop_here {
  width: 100%;
  background-color: $side-3;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative;
  cursor: pointer;
  & > h1 {
    text-align: center;
  }
  & > input {
    display: none;
  }
  &:hover {
    background-color: $side-2;
  }
  &.dropping {
    background-color: $main;
    color: $bg;
  }
}
</style>
