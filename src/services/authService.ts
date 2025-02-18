import axios from "axios";
import { ref } from "vue";
import type { ApiError } from "../types/error";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  uid: string;
  name: string;
  email: string;
  certificates?: Certificate[];
  diveCount?: number;
}

export interface Certificate {
  system: string;
  level: string;
  url?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const useAuthService = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const register = async (name: string, email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/register`,
        {
          name,
          email,
          password,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "註冊失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    console.log(API_URL);
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "登入失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken,
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      throw error_response.response?.data?.error || "Token 刷新失敗";
    }
  };

  const getUserProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "獲取用戶資料失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (data: {
    name: string;
    email: string;
    certificates?: Certificate[];
    currentPassword?: string;
    newPassword?: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put(`${API_URL}/api/profile`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "更新用戶資料失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    register,
    login,
    refreshToken,
    getUserProfile,
    updateProfile,
    loading,
    error,
  };
};
