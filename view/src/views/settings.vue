<template>
  <main>
    <div class="settings">
      <div v-for="(setting, index) in settings" :key="index">
        <h2 v-text="setting.name"></h2>
        <p v-text="setting.description"></p>
        <div class="number" v-if="setting.type === 'number'">
          <button
            @click="config[setting.key] < setting.max && config[setting.key]++"
          >
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
          <input v-model="config[setting.key]" type="number" disabled />
          <button
            @click="config[setting.key] > setting.min && config[setting.key]--"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-dash-lg"
              viewBox="0 0 16 16"
            >
              <path d="M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z" />
            </svg>
          </button>
        </div>
        <div
          class="checkbox"
          v-else-if="setting.type === 'checkbox'"
          @click="config[setting.key] = !config[setting.key]"
          :data-checked="config[setting.key]"
          v-text="config[setting.key] ? '開啟' : '關閉'"
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Config from "VS/config";
import DataType from "VS/protocol";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      settings: [
        {
          name: "構建時的線程數",
          description: "數量越多將會越快，但同時更消耗性能",
          key: "thread_count",
          type: "number",
          min: 1,
          max: 32,
        },
        {
          name: "關閉時刪除快取",
          description: "軟體關閉時，清理快取的資料",
          key: "clear_tmp",
          type: "checkbox",
        },
        {
          name: "關閉時刪除輸出",
          description: "軟體關閉時，清理輸出的資料夾",
          key: "clear_output",
          type: "checkbox",
        },
        {
          name: "使用前刪除輸出",
          description: "建構或壓縮前，清理輸出的資料夾",
          key: "before_clear_output",
          type: "checkbox",
        },
        {
          name: "開發者模式",
          description: "啟用開發者模式",
          key: "dev_mode",
          type: "checkbox",
        },
      ] as {
        name: string;
        description: string;
        key: keyof Config;
        type: "number" | "checkbox";
        min?: number;
        max?: number;
      }[],
      config: {
        thread_count: 5,
        dev_mode: false,
        clear_tmp: false,
        clear_output: false,
        before_clear_output: true,
      } as Config,
    };
  },
  watch: {
    config: {
      handler() {
        const save = [];
        for (const [key, val] of Object.entries(this.config))
          save.push({ key, val });
        this.$ws.send(
          "upload_config",
          save as DataType["upload_config"]["req"]
        );
      },
      deep: true,
    },
  },
  async created() {
    this.$ws
      .get("config", undefined)
      .then((res) => (this.config = Object.assign(this.config, res.data)));
  },
});
</script>

<style lang="scss" scoped>
@import "@/app.scss";
.settings {
  display: flex;
  flex-wrap: wrap;
  & > div {
    margin: 0.6rem;
    padding: 0.4rem 1rem 1rem 1rem;
    background-color: $side-3;
    & > h2 {
      margin: 0.6em 0;
    }
    & > div.number {
      display: flex;
      border: $border;
      & > input {
        width: 100%;
        color: $main;
        font-size: 1.4em;
        background-color: $side-2;
        border: none;
        &[type="number"] {
          text-align: center;
          appearance: none;
          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
          }
        }
      }
      & > button {
        color: $main;
        background-color: $side-2;
        border: none;
        &:hover {
          background-color: $side-3;
        }
        &:active {
          background-color: $bg;
        }
      }
    }
    & > div.checkbox {
      padding: 0.2em 0;
      cursor: pointer;
      border: $border;
      text-align: center;
      font-weight: 800;
      &:hover {
        background-color: $bg;
      }
      &[data-checked="true"] {
        color: $bg;
        background-color: $main;
        &:hover {
          background-color: $side-1;
        }
      }
    }
  }
}
.save {
  cursor: pointer;
  margin: 1em 0;
  width: 100%;
  height: 2em;
  font-size: 1.6em;
  border-radius: 0;
  font-weight: 800;
  color: $main;
  border: $border;
  background-color: $side-3;
  &:hover {
    background-color: $side-2;
  }
  &:active {
    background-color: $bg;
  }
}
</style>
