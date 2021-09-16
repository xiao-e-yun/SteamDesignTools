<template>
  <div class="imgs_preview">
    <aside>
      <div class="left">
        <p>圖片數量{{ imgs.length }}</p>
        <button
          @click="show_imgs = !show_imgs"
          v-text="show_imgs ? '顯示預覽圖片' : '顯示全部圖片'"
        />
      </div>
      <div class="right">
        <div v-if="!show_imgs">
          <p>預覽數量{{ preview_size }}</p>
          <button @click="preview_size === 1 || preview_size--">-</button>
          <button @click="preview_size === 20 || preview_size++">+</button>
        </div>
        <button @click="this.$emit('re_choose')">重新選擇</button>
      </div>
    </aside>
    <transition-group name="fade" mode="out-in">
      <img
        v-for="(img, index) in show_imgs ? imgs : preview"
        :key="index"
        :title="img.name"
        :src="img.link_url"
        @click="fullscreen_view = img"
      />
      <h2
        class="last_imgs"
        v-if="last_imgs !== 0 && !show_imgs"
        @click="show_imgs = true"
        title="顯示全部圖片"
      >
        剩下{{ last_imgs }}張圖片<br />點擊顯示全部
      </h2>
    </transition-group>
    <transition name="fade">
      <main
      class="fullscreen_view"
      v-if="fullscreen_view"
      @click="fullscreen_view = false"
      >
        <img :title="fullscreen_view.name" :src="fullscreen_view.link_url" />
      </main>
    </transition>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
const preview_length = localStorage.getItem("preview_length");

@Options({
  props: ["imgs"],
  computed: {
    preview() {
      const preview_list = this.imgs.slice(0, this.preview_size);
      return preview_list;
    },
    last_imgs() {
      return this.imgs.length - this.preview.length;
    },
  },
  watch: {
    preview_size: {
      handler(val) {
        localStorage.setItem("preview_length", val.toString());
      },
      immediate: true,
    },
  },
})
export default class Home extends Vue {
  data() {
    return {
      preview_size: preview_length === null ? 4 : parseInt(preview_length),
      show_imgs: false,
      fullscreen_view: false,
    };
  }
}
</script>

<style lang="scss">
@import "../app.scss";
.imgs_preview {
  margin-right: 2em;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  & > aside {
    font-weight: 800;
    font-size: 1.2em;
    width: 100%;
    background-color: $side-2;
    display: flex;
    justify-content: space-between;
    & div {
      display: flex;
      align-items: center;
      align-content: center;
    }
    & button {
      font-size: 1em;
      color: $main;
      background-color: $side-2;
      border: none;
      border-radius: 0;
      cursor: pointer;
      &:hover {
        color: $bg;
        background-color: $side-1;
      }
    }
    & p,
    & span {
      margin: 0 0.2em;
    }
  }
  & > img,
  & > .last_imgs {
    width: 24%;
    min-height: 100%;
    max-height: 20em;
    margin: 0.5%;
    background-color: $side-2;
    object-fit: cover;
    cursor: pointer;
  }
  & > .last_imgs {
    min-height: 5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > .fullscreen_view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $bg;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    & > img {
      height: 95%;
    }
  }
}
.fade-move {
  transition: all .4s;
}
</style>