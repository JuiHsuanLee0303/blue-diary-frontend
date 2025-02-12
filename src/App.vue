<template>
  <main-layout ref="mainLayout" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "./stores/auth";
import MainLayout from "@/layouts/MainLayout.vue";

const mainLayout = ref<InstanceType<typeof MainLayout> | null>(null);
const authStore = useAuthStore();

onMounted(() => {
  authStore.initializeAuth();
  // 設置全局引用
  const app = document.querySelector("#app")?.__vue_app__;
  if (app) {
    app.config.globalProperties.$mainLayout = mainLayout.value;
  }
});
</script>
