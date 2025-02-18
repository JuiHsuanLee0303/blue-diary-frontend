import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../services/authService";
import { useAuthService } from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
  const isInitialized = ref(false);
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const authService = useAuthService();

  const isAuthenticated = computed(() => !!token.value);

  // 初始化時從 localStorage 讀取認證狀態
  const initializeAuth = () => {
    if (isInitialized.value) return;

    token.value = localStorage.getItem("token");
    refreshToken.value = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user.value = JSON.parse(userStr);
    }
    isInitialized.value = true;
  };

  // 設置認證資訊
  const setAuth = (
    userData: User,
    accessToken: string,
    refreshTokenValue: string
  ) => {
    user.value = userData;
    token.value = accessToken;
    refreshToken.value = refreshTokenValue;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshTokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 清除認證資訊
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    refreshToken.value = null;

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  // 刷新用戶資料
  const refreshUserData = async () => {
    try {
      const userData = await authService.getUserProfile();
      user.value = userData;
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("刷新用戶資料失敗:", error);
    }
  };

  return {
    isInitialized,
    user,
    token,
    refreshToken,
    isAuthenticated,
    initializeAuth,
    setAuth,
    clearAuth,
    refreshUserData,
  };
});
