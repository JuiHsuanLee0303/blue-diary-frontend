import { createPinia } from "pinia";
import { useAuthStore } from "../stores/auth";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const pinia = createPinia();

export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore(pinia);

  if (!authStore.isAuthenticated) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
};
