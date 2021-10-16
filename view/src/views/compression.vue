<template>
  <main>
    <FilesManage
      @base64="(i) => (edit_setting.base64 = i)"
      @imgs="(i) => (imgs = i)"
    >
      <template v-slot:type>
        <h2>壓縮圖片</h2>
      </template>
      <template v-slot:list>
        <div>
          最高畫質
          <div class="input_number">
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
          <div class="input_number">
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
          <div class="input_number">
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
    let edit_setting: DataType["compression"]["req"]["option"];
    const save = localStorage.getItem("steam_design_tools$compression_setting");
    edit_setting = save
      ? JSON.parse(save)
      : {
          base64: false,
          quality: [60, 100],
          speed: 1,
        };
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
