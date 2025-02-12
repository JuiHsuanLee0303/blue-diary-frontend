<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          {{ isEditMode ? "編輯潛水日誌" : "新增潛水日誌" }}
        </h1>

        <!-- 錯誤提示 -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-form ref="form">
          <v-card class="pa-6">
            <!-- 基本資訊 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 d-flex align-center">
                <v-icon icon="mdi-information" class="mr-2" />
                基本資訊
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="formData.name"
                      label="日誌名稱"
                      variant="outlined"
                      prepend-inner-icon="mdi-format-title"
                      hint="若未填寫將自動使用「日期_時間_潛點」格式"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.date"
                      label="潛水日期"
                      type="date"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.time"
                      label="潛水時間"
                      type="time"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-clock"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="formData.location"
                      :items="diveSpots"
                      :loading="isLoadingSpots"
                      label="潛點位置"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker"
                      item-title="name"
                      item-value="name"
                      :filter="filterSpots"
                      hide-no-data
                      :rules="[requiredRule]"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-map"
                          variant="text"
                          @click="showMapDialog = true"
                        />
                      </template>
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #prepend>
                            <v-icon icon="mdi-map-marker" />
                          </template>
                          <v-list-item-title>{{
                            item.raw.name
                          }}</v-list-item-title>
                          <v-list-item-subtitle v-if="item.raw.region">
                            {{ item.raw.region }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 環境資訊 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-weather-partly-cloudy" class="mr-2" />
                環境資訊
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.airTemp"
                      label="氣溫 (°C)"
                      type="number"
                      variant="outlined"
                      prepend-inner-icon="mdi-thermometer"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.waterTemp"
                      label="水溫 (°C)"
                      type="number"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-thermometer-water"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="formData.weather"
                      label="天氣"
                      :items="weatherOptions"
                      variant="outlined"
                      prepend-inner-icon="mdi-weather-partly-cloudy"
                      :rules="[requiredRule]"
                    />
                  </v-col>

                  <!-- 水域類型 -->
                  <v-col cols="12" md="6">
                    <label class="text-subtitle-1 mb-2 d-block text-white"
                      >水域類型</label
                    >
                    <v-btn-toggle
                      v-model="formData.waterType"
                      mandatory
                      color="primary"
                      density="comfortable"
                      class="mb-2"
                      :rules="[requiredRule]"
                    >
                      <v-btn
                        v-for="type in waterTypeOptions"
                        :key="type.value"
                        :value="type.value"
                        :prepend-icon="type.icon"
                      >
                        {{ type.text }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>

                  <!-- 潛水型態 -->
                  <v-col cols="12" md="6">
                    <label class="text-subtitle-1 mb-2 d-block text-white"
                      >潛水型態</label
                    >
                    <v-btn-toggle
                      v-model="formData.diveType"
                      mandatory
                      color="primary"
                      density="comfortable"
                      class="mb-2"
                      :rules="[requiredRule]"
                    >
                      <v-btn
                        v-for="type in diveTypeOptions"
                        :key="type.value"
                        :value="type.value"
                        :prepend-icon="type.icon"
                      >
                        {{ type.text }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>

                  <!-- 水流 -->
                  <v-col cols="12" md="6">
                    <label class="text-subtitle-1 mb-2 d-block text-white"
                      >水流</label
                    >
                    <v-btn-toggle
                      v-model="formData.current"
                      mandatory
                      color="primary"
                      density="comfortable"
                      class="mb-2"
                      :rules="[requiredRule]"
                    >
                      <v-btn
                        v-for="level in currentOptions"
                        :key="level.value"
                        :value="level.value"
                        :prepend-icon="level.icon"
                      >
                        {{ level.text }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>

                  <!-- 浪況 -->
                  <v-col cols="12" md="6">
                    <label class="text-subtitle-1 mb-2 d-block text-white"
                      >浪況</label
                    >
                    <v-btn-toggle
                      v-model="formData.waveCondition"
                      mandatory
                      color="primary"
                      density="comfortable"
                      class="mb-2"
                      :rules="[requiredRule]"
                    >
                      <v-btn
                        v-for="wave in waveOptions"
                        :key="wave.value"
                        :value="wave.value"
                        :prepend-icon="wave.icon"
                      >
                        {{ wave.text }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 潛水數據 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-chart-line" class="mr-2" />
                潛水數據
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="formData.maxDepth"
                      label="最大深度 (m)"
                      type="number"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-arrow-collapse-down"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="formData.duration"
                      label="潛水時間 (分鐘)"
                      type="number"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-timer"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="formData.weight"
                      label="配重 (kg)"
                      type="number"
                      variant="outlined"
                      prepend-inner-icon="mdi-weight"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="formData.visibility"
                      label="能見度 (m)"
                      type="number"
                      variant="outlined"
                      prepend-inner-icon="mdi-eye"
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 氣瓶資訊區塊 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-gas-cylinder" class="mr-2" />
                氣瓶資訊
              </h2>

              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.tankType"
                      label="氣瓶類型"
                      :items="tankTypeOptions"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-diving-scuba-tank"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.tankVolume"
                      label="氣瓶容量 (L)"
                      type="number"
                      variant="outlined"
                      prepend-inner-icon="mdi-cube-outline"
                      hint="例：8L、12L"
                      persistent-hint
                      :rules="[requiredRule, numberRule]"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.startPressure"
                      label="起始氣壓 (bar)"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-gauge"
                      min="0"
                      max="300"
                      :rules="[requiredRule, numberRule]"
                      @update:model-value="validatePressure"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.endPressure"
                      label="結束氣壓 (bar)"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-gauge-empty"
                      min="0"
                      max="300"
                      :rules="[requiredRule, numberRule]"
                      @update:model-value="validatePressure"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      :model-value="pressureConsumption"
                      label="消耗氣壓 (bar)"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-gauge-low"
                    />
                  </v-col>

                  <!-- SAC 計算結果 -->
                  <v-col v-if="calculateSAC" cols="12">
                    <v-alert
                      color="info"
                      variant="tonal"
                      :text="`根據您的潛水數據，您的耗氣率 (SAC) 為 ${calculateSAC} L/min`"
                      class="mb-0"
                    >
                      <template #prepend>
                        <v-icon icon="mdi-information" />
                      </template>
                    </v-alert>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 夥伴資訊 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-account-group" class="mr-2" />
                夥伴資訊
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="formData.buddies"
                      label="潛伴"
                      multiple
                      chips
                      variant="outlined"
                      prepend-inner-icon="mdi-account-group"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.diveShop"
                      label="潛店名稱"
                      variant="outlined"
                      prepend-inner-icon="mdi-store"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 裝備清單 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-diving-scuba-tank" class="mr-2" />
                裝備清單
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="formData.equipment"
                      label="使用裝備"
                      :items="equipmentOptions"
                      multiple
                      chips
                      variant="outlined"
                      prepend-inner-icon="mdi-diving-scuba-tank"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 照片和筆記 -->
            <div class="form-section">
              <h2 class="text-h6 mb-4 mt-6 d-flex align-center">
                <v-icon icon="mdi-image-multiple" class="mr-2" />
                照片和筆記
              </h2>
              <v-card class="pa-4 mb-4" variant="flat">
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.images"
                      label="照片"
                      variant="outlined"
                      rows="3"
                      prepend-inner-icon="mdi-image-multiple"
                      hint="每行輸入一個圖片連結"
                      persistent-hint
                      :rules="[validateImageUrls]"
                    >
                      <template #append-inner>
                        <v-menu location="bottom end">
                          <template #activator="{ props }">
                            <v-btn
                              icon="mdi-help-circle"
                              variant="text"
                              density="comfortable"
                              v-bind="props"
                            />
                          </template>
                          <v-card class="pa-4" max-width="400">
                            <h3 class="text-h6 mb-2">如何添加圖片？</h3>
                            <p class="mb-4">您可以使用以下方式添加圖片：</p>
                            <ol class="mb-4">
                              <li class="mb-2">
                                <strong>Google Drive：</strong>
                                <ol class="ml-4">
                                  <li>上傳圖片到 Google Drive</li>
                                  <li>右鍵點擊圖片 > 分享 > 複製連結</li>
                                  <li>確保連結權限設為「任何人都可以查看」</li>
                                  <li>將連結貼上到此處</li>
                                </ol>
                              </li>
                              <li class="mb-2">
                                <strong>免費圖庫：</strong>
                                <ul class="ml-4">
                                  <li>
                                    <a
                                      href="https://imgur.com"
                                      target="_blank"
                                      class="text-decoration-none"
                                    >
                                      Imgur
                                    </a>
                                    - 免費圖片上傳服務
                                  </li>
                                  <li>
                                    <a
                                      href="https://postimages.org"
                                      target="_blank"
                                      class="text-decoration-none"
                                    >
                                      PostImages
                                    </a>
                                    - 無需註冊的圖片上傳
                                  </li>
                                </ul>
                              </li>
                            </ol>
                            <p class="text-caption">
                              注意：請確保圖片連結是公開可訪問的，且以 http://
                              或 https:// 開頭
                            </p>
                          </v-card>
                        </v-menu>
                      </template>
                    </v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.notes"
                      label="潛水筆記"
                      variant="outlined"
                      rows="4"
                      prepend-inner-icon="mdi-notebook"
                      hint="記錄遇到的生物、特殊經歷或心得"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 操作按鈕 -->
            <div class="d-flex gap-4 mt-6">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-check"
                :loading="isSubmitting"
                class="mr-4"
                @click="handleSubmit"
              >
                上傳日誌
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                prepend-icon="mdi-content-save"
                class="mr-4"
              >
                存為草稿
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                prepend-icon="mdi-close"
                @click="$router.back()"
              >
                取消
              </v-btn>
            </div>
          </v-card>
        </v-form>
      </v-col>
    </v-row>

    <!-- 地圖選擇對話框 -->
    <v-dialog v-model="showMapDialog" width="800">
      <v-card class="w-full mx-0">
        <v-card-title>從地圖選擇潛點</v-card-title>
        <v-card-text>
          <div id="select-map" style="height: 500px" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showMapDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import type { VForm } from "vuetify/components";
import { useRouter, useRoute } from "vue-router";
import { useDiveLogService } from "@/services/diveLogService";
import type { RouteParams } from "vue-router";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL;

interface DiveSpot {
  name: string;
  lat: number;
  lng: number;
  region?: string;
}

interface DiveLogParams extends RouteParams {
  id: string;
}

const router = useRouter();
const route = useRoute();
const {
  createDiveLog,
  updateDiveLog,
  getDiveLog,
  loading: isSubmitting,
  error,
} = useDiveLogService();

const isEditMode = computed(() => !!(route.params as DiveLogParams).id);

// 選項數據
const weatherOptions = ["晴天", "多雲", "陰天", "雨天"];
const waterTypeOptions = [
  { text: "海洋", value: "ocean", icon: "mdi-waves" },
  { text: "湖泊", value: "lake", icon: "mdi-water" },
  { text: "洞穴", value: "cave", icon: "mdi-tunnel" },
];
const diveTypeOptions = [
  { text: "岸潛", value: "shore", icon: "mdi-shore" },
  { text: "船潛", value: "boat", icon: "mdi-sail-boat" },
];
const currentOptions = [
  { text: "無", value: "none", icon: "mdi-current-dc" },
  { text: "弱", value: "weak", icon: "mdi-arrow-right" },
  { text: "中", value: "medium", icon: "mdi-arrow-right-bold" },
  { text: "強", value: "strong", icon: "mdi-arrow-right-bold-outline" },
];
const waveOptions = [
  { text: "平靜", value: "calm", icon: "mdi-wave" },
  { text: "小浪", value: "small", icon: "mdi-waves" },
  { text: "中浪", value: "medium", icon: "mdi-waves" },
  { text: "大浪", value: "rough", icon: "mdi-waves" },
];
const tankTypeOptions = ["鋁", "鋼"];
const equipmentOptions = [
  "BCD",
  "調節器",
  "面鏡",
  "蛙鞋",
  "防寒衣",
  "電腦錶",
  "指北針",
  "SMB",
];

// 表單數據
const requiredRule = (v: unknown) => !!v || "此欄位為必填";
const numberRule = (v: number) => v > 0 || "請輸入大於 0 的數值";

interface DiveLogForm {
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
  images: string;
}

const form = ref<VForm | null>(null);
const formData = ref<DiveLogForm>({
  name: "",
  // 基本資訊
  date: new Date().toISOString().split("T")[0],
  time: "",
  location: "",

  // 環境資訊
  airTemp: 0,
  waterTemp: 0,
  weather: "",
  waterType: "ocean",
  diveType: "shore",
  current: "none",
  waveCondition: "calm",

  // 潛水數據
  maxDepth: 0,
  duration: 0,
  weight: 0,
  visibility: 0,

  // 氣瓶資訊
  tankType: "",
  tankVolume: 0,
  startPressure: 0,
  endPressure: 0,

  // 夥伴資訊
  buddies: [],
  diveShop: "",

  // 裝備
  equipment: [],

  // 照片和筆記
  images: "",
  notes: "",
});

// 計算消耗氣壓
const pressureConsumption = computed(() => {
  const start = Number(formData.value.startPressure);
  const end = Number(formData.value.endPressure);

  if (start && end && start >= end) {
    return start - end;
  }
  return null;
});

// 計算 SAC (Surface Air Consumption)
const calculateSAC = computed(() => {
  const consumption = pressureConsumption.value;
  const duration = Number(formData.value.duration);
  const depth = Number(formData.value.maxDepth);
  const tankVolume = Number(formData.value.tankVolume);

  if (consumption && duration && depth && tankVolume) {
    // SAC = (消耗氣壓 * 氣瓶容積) / (潛水時間 * (平均深度/10 + 1))
    const averageDepth = depth / 2;
    const atm = averageDepth / 10 + 1;
    const sac = (consumption * tankVolume) / (duration * atm);
    return sac.toFixed(1);
  }
  return null;
});

// 驗證氣壓輸入
const validatePressure = () => {
  const start = Number(formData.value.startPressure);
  const end = Number(formData.value.endPressure);

  if (start && end && end > start) {
    formData.value.endPressure = formData.value.startPressure;
  }
};

// 驗證圖片 URL
const validateImageUrls = (value: string) => {
  if (!value) return true;

  const urls = value.split("\n").filter((url) => url.trim());
  for (const url of urls) {
    if (!url.match(/^https?:\/\/.+/)) {
      return "請輸入有效的圖片連結（以 http:// 或 https:// 開頭）";
    }
  }
  return true;
};

// 載入現有日誌數據
const loadExistingLog = async () => {
  if (isEditMode.value) {
    const log = await getDiveLog((route.params as DiveLogParams).id);
    if (log) {
      formData.value = {
        ...log,
        images: log.images?.join("\n") || "",
      };
    }
  }
};

const handleSubmit = async () => {
  const isValid = await form.value?.validate();
  if (!isValid?.valid) return;

  try {
    if (!formData.value.name.trim()) {
      formData.value.name = `${formData.value.date}_${formData.value.time}_${formData.value.location}`;
    }

    const submitData = {
      ...formData.value,
      images: formData.value.images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url),
    };

    if (isEditMode.value) {
      await updateDiveLog((route.params as DiveLogParams).id, submitData);
    } else {
      await createDiveLog(submitData);
    }
    router.push("/dive-log");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

// 潛點相關狀態
const diveSpots = ref<DiveSpot[]>([]);
const isLoadingSpots = ref(false);
const showMapDialog = ref(false);
let map: L.Map | null = null;

// 載入潛點數據
const loadDiveSpots = async () => {
  isLoadingSpots.value = true;
  try {
    const response = await axios.get<DiveSpot[]>(`${API_URL}/api/diveMap`);
    diveSpots.value = response.data;
  } catch (err) {
    console.error("Error loading dive spots:", err);
  } finally {
    isLoadingSpots.value = false;
  }
};

// 過濾潛點
const filterSpots = (item: DiveSpot, query: string) => {
  if (!query) return true;
  const searchText = query.toLowerCase();
  return (
    item.name.toLowerCase().includes(searchText) ||
    item.region?.toLowerCase().includes(searchText)
  );
};

// 監聽地圖對話框
watch(showMapDialog, async (newValue) => {
  if (newValue) {
    // 等待 DOM 更新
    await nextTick();

    // 初始化地圖
    if (!map) {
      map = L.map("select-map").setView([23.5, 121.5], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    }

    // 添加標記
    diveSpots.value.forEach((spot) => {
      if (map) {
        // 確保地圖已初始化
        L.marker([spot.lat, spot.lng])
          .bindPopup(spot.name)
          .on("click", () => {
            formData.value.location = spot.name;
            showMapDialog.value = false;
          })
          .addTo(map);
      }
    });
  }
});

// 初始載入潛點數據
onMounted(() => {
  loadDiveSpots();
  if (isEditMode.value) {
    loadExistingLog();
  }
});
</script>

<style scoped>
.v-card {
  max-width: 1200px;
  margin: 0 auto;
}

/* 統一所有區塊的樣式 */
.form-section :deep(.v-field__input) {
  font-size: 1.1rem;
  font-weight: 500;
  min-height: 44px;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
}

.form-section :deep(.v-field--readonly) {
  background-color: var(--v-theme-grey-lighten-4);
}

.form-section :deep(.v-alert) {
  font-size: 0.95rem;
}

.form-section :deep(.v-card) {
  transition: all 0.3s ease;
}

/* 所有輸入欄位使用 comfortable 密度並置中 */
.form-section :deep(.v-field) {
  --v-field-padding-top: 0;
  --v-field-padding-bottom: 0;
}

/* 調整多行文本框的內容位置 */
.form-section :deep(.v-textarea .v-field__input) {
  min-height: unset;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: flex-start;
}

/* 調整檔案上傳元件的內容位置 */
.form-section :deep(.v-file-input .v-field__input) {
  min-height: unset;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* 按鈕組樣式 */
.v-btn-toggle {
  flex-wrap: wrap;
  gap: 8px;
}

.v-btn-toggle .v-btn {
  flex: 1;
  min-width: 100px;
}

/* 標籤樣式 */
label {
  color: rgba(255, 255, 255, 0.87);
}

/* Leaflet 樣式 */
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
  margin: 8px 12px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
}
</style>
