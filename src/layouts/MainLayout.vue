<template>
  <v-app>
    <v-app-bar>
      <template #prepend>
        <v-app-bar-nav-icon
          class="d-flex d-sm-none"
          @click="drawer = !drawer"
        />
      </template>

      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none">
          <span class="blue-diary-title">
            <span class="blue">BLUE</span>
            <span class="diary">DIARY</span>
          </span>
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- 桌面版選單 -->
      <div class="d-none d-md-flex mx-4 align-center">
        <v-btn to="/" variant="text" class="mr-2"> 首頁 </v-btn>
        <v-btn to="/dive-log" variant="text" class="mr-2"> 潛水日誌 </v-btn>
        <v-btn to="/dive-map" variant="text" class="mr-2"> 潛點地圖 </v-btn>
        <template v-if="authStore.isAuthenticated">
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
                <v-avatar color="primary" size="40">
                  {{ userInitials }}
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="handleLogout">
                <v-list-item-title>登出</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-else>
          <v-btn to="/login" variant="text" prepend-icon="mdi-account">
            登入
          </v-btn>
        </template>
      </div>
    </v-app-bar>

    <!-- 手機版側邊選單 -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" prepend-icon="mdi-home"> 首頁 </v-list-item>
        <v-list-item to="/dive-log" prepend-icon="mdi-notebook">
          潛水日誌
        </v-list-item>
        <v-list-item to="/dive-map" prepend-icon="mdi-map">
          潛點地圖
        </v-list-item>
        <template v-if="authStore.isAuthenticated">
          <v-list-item prepend-icon="mdi-logout" @click="handleLogout">
            登出
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item to="/login" prepend-icon="mdi-account">
            登入
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <!-- 添加提示框 -->
    <v-dialog v-model="showAuthDialog" width="auto" persistent>
      <v-card min-width="300">
        <v-card-title class="text-center"> 需要登入 </v-card-title>

        <v-card-text class="pt-4 text-center">
          請先登入以使用此功能
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="handleCancel">
            取消
          </v-btn>
          <v-btn color="primary" @click="handleLogin"> 前往登入 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter, type RouteLocationNormalized } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const drawer = ref(false);

const userInitials = computed(() => {
  if (!authStore.user?.name) return "";
  return authStore.user.name.charAt(0).toUpperCase();
});

const handleLogout = () => {
  authStore.clearAuth();
  router.push("/login");
  drawer.value = false; // 關閉側邊選單
};

// 新增的狀態和方法
const showAuthDialog = ref(false);
const pendingRoute = ref<RouteLocationNormalized | null>(null);

// 提供給全局使用的方法
const showAuthRequired = (targetRoute: RouteLocationNormalized) => {
  pendingRoute.value = targetRoute;
  showAuthDialog.value = true;
};

const handleCancel = () => {
  showAuthDialog.value = false;
  pendingRoute.value = null;
};

const handleLogin = () => {
  showAuthDialog.value = false;
  const redirect = pendingRoute.value?.fullPath || "/";
  router.push({
    path: "/login",
    query: { redirect },
  });
  pendingRoute.value = null;
};

// 暴露方法給其他組件使用
defineExpose({
  showAuthRequired,
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap");

.blue-diary-title {
  font-family: "Montserrat", sans-serif;
  letter-spacing: 2px;
}

.blue {
  color: #1e88e5;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.diary {
  margin-left: 8px;
  color: #0d47a1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
