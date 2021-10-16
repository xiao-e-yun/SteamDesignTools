<template>
  <main>
    <FilesManage
      @base64="(i) => (edit_setting.base64 = i)"
      @imgs="(i) => (imgs = i)"
    >
      <template v-slot:type>
        <h2
          v-text="build_type[edit_setting.main].name"
          @click="show_type_list = !show_type_list"
        />
        <transition name="fade">
          <div
            class="type_list"
            v-if="show_type_list"
            @click="show_type_list = false"
            @mouseleave="show_type_list = false"
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
      </template>

      <template v-slot:list>
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
            edit_setting.right_more_img_clip = !edit_setting.right_more_img_clip
          "
          :data-checked="edit_setting.right_more_img_clip"
        >
          裁減更多圖片
        </p>

        <button @click="build">開始構建</button>
      </template>
    </FilesManage>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FilesManage from "@/components/files_manage.vue";
import { mixin } from "@/store";
import DataType from "VS/protocol";

export default defineComponent({
  components: {
    FilesManage,
  },

  mixins: [mixin],

  data() {
    let edit_setting: DataType["build"]["req"]["option"];
    const save = localStorage.getItem("steam_design_tools$build_setting");
    edit_setting = save
      ? JSON.parse(save)
      : {
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
      show_type_list: false,
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

    async build(): Promise<void> {
      this.loading(true);
      const reader = new FileReader();
      const imgs = [] as DataType["build"]["req"]["imgs"];

      console.log(this.imgs);
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

<style lang="scss" scoped>
@import "@/app.scss";
.files_manage {
  .setting_type {
    & > h2:hover {
      color: $bg;
      background-color: $main;
    }
    & > .type_list {
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

  .setting_list > .setting_background {
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
}
</style>
