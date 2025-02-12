import axios from "axios";
import { ref } from "vue";
import type { ApiError } from "../types/error";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  uid: string;
  name: string;
  email: string;
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

  return {
    register,
    login,
    refreshToken,
    loading,
    error,
  };
};
