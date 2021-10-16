<template>
  <form class="login_steam" autocomplete="on">
    <h2>登入至Steam</h2>
    <template v-if="send_to === ''">
      <p>帳號:<input v-model="account.username" type="text" /></p>
      <p>
        密碼:<input
          v-model="account.password"
          type="password"
          autocomplete="on"
        />
      </p>
    </template>
    <p v-else>驗證碼:<input v-model="guard" type="text" /></p>
    <button
      type="submit"
      @click.prevent="login(send_to !== '')"
      v-text="send_to === '' ? '登入帳號' : '送出'"
    />
  </form>
</template>

<script lang="ts">
import { mixin } from "@/store";
import { defineComponent } from "vue";

export default defineComponent({
  mixins: [mixin],
  data() {
    return {
      account: {} as {
        username: string;
        password: string;
      },
      guard: "",
      send_to: "",
    };
  },
  methods: {
    async login(guard: boolean) {
      if (!guard) {
        const data = (await this.$ws.get("login_steam", this.account)).data;
        if (data.success) {
          console.log("登入成功");
          if (data.guard.need) this.send_to = data.guard.get as string;
          else this.$emit("reload");
        } else {
          console.log("登入失敗");
        }
      } else {
        const data = (
          await this.$ws.get(this.send_to as "login_guard", this.guard)
        ).data;
        if (data.success) {
          console.log("驗證成功");
          this.$emit("reload");
        } else {
          console.log("驗證失敗");
          console.warn(data.error);
        }
      }
    },
  },
  watch: {
    guard(val: string) {
      if (val.length > 5) this.guard = val.slice(0, 5);
    },
  },
});
</script>

<style lang="scss" scoped>
@import "@/app.scss";
</style>
