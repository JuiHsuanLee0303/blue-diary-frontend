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
    name: "DiveLogEdit",
    component: () => import("@/pages/DiveLogForm.vue"),
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (!authStore.isInitialized) {
    authStore.initializeAuth();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
