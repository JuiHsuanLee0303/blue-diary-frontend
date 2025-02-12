/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/Home.vue"),
  },
  {
    path: "/dive-log",
    name: "DiveLog",
    component: () => import("@/pages/DiveLog.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dive-log/:id",
    name: "DiveLogDetail",
    component: () => import("@/pages/DiveLogDetail.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dive-log/:id/edit",
    name: "dive-log-edit",
    component: () => import("@/pages/DiveLogForm.vue"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/dive-map",
    name: "DiveMap",
    component: () => import("@/pages/DiveMap.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/pages/Register.vue"),
  },
  {
    path: "/dive-log/new",
    name: "NewDiveLog",
    component: () => import("@/pages/DiveLogForm.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (!localStorage.getItem("vuetify:dynamic-reload")) {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    } else {
      console.error("Dynamic import error, reloading page did not fix it", err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (!authStore.isInitialized) {
    authStore.initializeAuth();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    // 獲取主佈局實例
    const app = document.querySelector("#app")?.__vue_app__;
    const mainLayout = app?.config?.globalProperties?.$mainLayout;

    if (mainLayout) {
      // 顯示提示框
      mainLayout.showAuthRequired(to);
      next(false); // 取消導航
    } else {
      // 降級處理：如果無法獲取主佈局實例，直接跳轉
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
  } else {
    next();
  }
});

export default router;
