import axios from "axios";
import type { ApiError } from "../types/error";
// 設置基礎 URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// 請求攔截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 錯誤且不是重試的請求
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem("token", token);

        // 更新原始請求的 token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (err: unknown) {
        const error_response = err as ApiError;
        // 刷新 token 失敗，清除本地存儲並重定向到登入頁
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(
          error_response.response?.data?.error || "Token 刷新失敗"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
