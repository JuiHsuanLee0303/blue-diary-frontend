import axios from "axios";
import { ref } from "vue";
import type { ApiError } from "../types/error";

const API_URL = import.meta.env.VITE_API_URL;

export interface DiveLog {
  id: number;
  name: string;
  location: string;
  date: string;
  time: string;
  airTemp: number;
  waterTemp: number;
  weather: string;
  waterType: string;
  diveType: string;
  current: string;
  waveCondition: string;
  maxDepth: number;
  duration: number;
  weight: number;
  visibility: number;
  tankType: string;
  tankVolume: number;
  startPressure: number;
  endPressure: number;
  buddies: string[];
  diveShop: string;
  equipment: string[];
  notes: string;
  images: string[];
}

export const useDiveLogService = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createDiveLog = async (data: Partial<DiveLog>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post(`${API_URL}/api/divelog`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "建立潛水日誌失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const updateDiveLog = async (id: string, data: Partial<DiveLog>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put(`${API_URL}/api/divelog/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "更新潛水日誌失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const getDiveLogs = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<DiveLog[]>(`${API_URL}/api/divelog`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "獲取潛水日誌失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const getDiveLog = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<DiveLog>(
        `${API_URL}/api/divelog/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "獲取潛水日誌失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deleteDiveLog = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`${API_URL}/api/divelog/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (err: unknown) {
      const error_response = err as ApiError;
      error.value = error_response.response?.data?.error || "刪除潛水日誌失敗";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    createDiveLog,
    updateDiveLog,
    getDiveLogs,
    getDiveLog,
    deleteDiveLog,
    loading,
    error,
  };
};
