<template>
  <main class="full">
    <aside class="account_list">
      <button
        v-for="name of Object.keys(cookies)"
        :class="{ active: active === name }"
        :key="name"
        @click="active = name"
        v-text="name"
      />
      <button @click="active = ''" :class="{ active: active === '' }">
        登入帳號
      </button>
    </aside>
    <main class="upload_steam">
      <LoginSteam @reload="reload" v-if="active === ''" />
      <FilesManage
        v-else
        :keep_imgs="imgs"
        @base64="(i) => (edit_setting.base64 = i)"
        @imgs="(i) => (imgs = i)"
      >
        <template v-slot:type>
          <h2>上傳藝術作品</h2>
        </template>

        <template v-slot:list>
          <div class="inline_select">
            <button
              v-for="(text, key) in type"
              v-text="text"
              @click="edit_setting.type = key"
              :class="{ active: key === edit_setting.type }"
              :key="key"
            />
          </div>

          <button @click="upload">開始構建</button>
        </template>
      </FilesManage>
    </main>
  </main>
</template>

<script lang="ts">
import { Protocol } from "puppeteer-core";
import { defineComponent } from "vue";
import FilesManage from "@/components/files_manage.vue";
import LoginSteam from "@/components/login_steam.vue";
import DataType from "VS/protocol";
import { mixin } from "@/store";

export default defineComponent({
  components: {
    FilesManage,
    LoginSteam,
  },
  mixins: [mixin],
  data() {
    let edit_setting: DataType["upload_artwork"]["req"]["option"];
    const save = localStorage.getItem("steam_design_tools$upload_setting");
    edit_setting = save
      ? JSON.parse(save)
      : {
          base64: false,
          type: "artwork",
        };
    return {
      edit_setting,
      type: {
        artwork: "藝術作品",
        screenshot: "螢幕截圖",
        workshop: "工作坊",
      },
      active: "",
      imgs: [] as { name: string; path: string; file?: File }[],
      cookies: {} as { [user: string]: Protocol.Network.Cookie[] },
      user_imgs: {} as {
        [username: string]: { name: string; path: string; file?: File }[];
      },
    };
  },
  methods: {
    async upload() {
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
      const req = (
        await this.$ws.get("upload_artwork", {
          username: this.active,
          option,
          files: imgs,
        })
      ).data;
      this.loading(false);

      if (!req.success) this.$router.go(0);

      function read_img(img: File) {
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      }
    },
    async reload() {
      const config = await this.$ws.get("config", undefined);
      this.cookies = config.data.cookies || {};
      const keys = Object.keys(this.cookies);
      this.active = this.cookies && keys.length > 0 ? keys[0] : "";
    },
  },
  watch: {
    active(_new_user, old_user) {
      if (old_user === "") return;
      this.user_imgs[old_user] = this.imgs;
    },
  },
  async created() {
    this.reload();
  },
});
</script>

<style lang="scss" scoped>
@import "@/app.scss";

.account_list {
  width: 100%;
  background-color: $side-3;
  border-bottom: $border;
  & > button {
    font-size: 1.6em;
    color: $main;
    border: none;
    cursor: pointer;
    background-color: transparent;
    border-radius: 0;
    &:nth-child(even) {
      background-color: $bg;
    }
    &:hover {
      background-color: $side-2;
    }
    &.active {
      background-color: $main;
      color: $bg;
    }
  }
}

.upload_steam {
  width: 100%;
  padding: 1.5em 1.5em 0 1.5em;
}
</style>
