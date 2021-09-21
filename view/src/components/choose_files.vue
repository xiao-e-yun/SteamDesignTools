<template>
    <div
        @click="this.$refs.input.click"
        @drop="drag_file"
        @dragenter="drop_inout"
        @dragleave="drop_inout"
        @dragenter.prevent
        @dragover.prevent
        class="drop_here"
        :class="{ dropping: dragenter !== 0 }"
    >
        <h1>選擇圖片</h1>
        <input
            type="file"
            @change="file_change"
            multiple="multiple"
            accept=".gif,.jpg,.png"
            ref="input"
        />
    </div>
</template>

<script lang="ts">
import { mixin } from '@/store'
import { defineComponent } from 'vue'

export default defineComponent({
  mixins: [mixin],
  methods:{
    //拖入檔案
    drag_file(e:DragEvent){
      e.stopPropagation()
      e.preventDefault()
      this.dragenter = 0
      const files = (e.dataTransfer as DataTransfer).files
      if(files.length > 0) this.upload(files)
      else this.log("無檔案檔案","無法讀取到丟入的檔案")
    },
    //拖曳檔案中
    drop_inout(e:DragEvent){
      if(e.type == "dragenter") this.dragenter++
      else this.dragenter--
    },
    file_change(e:InputEvent){
        const input = e.target as HTMLInputElement
        this.upload(input.files as FileList)
        input.value = ""
    },
    //通知父層
    upload(files:FileList){
        this.$emit("files",files)
    },
  },
  data(){return{
    dragenter:0,
  }}
})
</script>

<style lang="scss" scoped>
@import "../app.scss";
.drop_here{
  width:100%;
  background-color:$side-3;
  transition: background-color 0.3s ease,color 0.3s ease;
  position: relative;
  cursor: pointer;
  &>h1{
    text-align:center;
  }
  &>input{
    display: none;
  }
  &:hover{
    background-color:$side-2;
  }
  &.dropping{
    background-color:$main;
    color: $bg;
  }
}
</style>