<template>
  <v-container>
    <!-- 載入中狀態 -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <!-- 錯誤提示 -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- 潛水日誌詳情 -->
    <template v-else>
      <!-- 頂部導航列 -->
      <v-row class="mt-6">
        <v-col cols="12" class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
          <h1 class="text-h4 ml-4">{{ diveLog?.name }}</h1>
          <v-chip class="ml-4" color="primary">{{
            formatDate(diveLog?.date)
          }}</v-chip>
          <v-spacer />
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            :to="`/dive-log/${diveLog?.id}/edit`"
            class="mr-2"
          >
            編輯
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            :loading="deleteLoading"
            prepend-icon="mdi-delete"
            @click="handleDelete"
          >
            刪除
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <!-- 左側資訊區 -->
        <v-col cols="12" md="8">
          <!-- 基本資訊卡片 -->
          <v-card class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-information" class="mr-2" />
              基本資訊
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="(info, index) in basicInfo"
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div
                    class="text-subtitle-2 text-medium-emphasis d-flex align-center mb-2"
                  >
                    <v-icon :icon="info.icon" size="small" class="mr-2" />
                    {{ info.label }}
                  </div>
                  <div class="font-weight-medium text-body-1">
                    {{ info.value }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 環境資訊卡片 -->
          <v-card class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-weather-partly-cloudy" class="mr-2" />
              環境資訊
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="(info, index) in environmentInfo"
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div
                    class="text-subtitle-2 text-medium-emphasis d-flex align-center mb-2"
                  >
                    <v-icon :icon="info.icon" size="small" class="mr-2" />
                    {{ info.label }}
                  </div>
                  <div class="font-weight-medium text-body-1">
                    {{ info.value }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 裝備資訊卡片 -->
          <v-card class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-diving-scuba-tank" class="mr-2" />
              裝備資訊
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="(info, index) in equipmentInfo"
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div
                    class="text-subtitle-2 text-medium-emphasis d-flex align-center mb-2"
                  >
                    <v-icon :icon="info.icon" size="small" class="mr-2" />
                    {{ info.label }}
                  </div>
                  <div class="font-weight-medium text-body-1">
                    {{ info.value }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 備註卡片 -->
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-note-text" class="mr-2" />
              備註
            </v-card-title>
            <v-card-text class="pa-6">
              <p class="text-body-1">{{ diveLog?.notes || "無備註" }}</p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 右側照片區 -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-image-multiple" class="mr-2" />
              照片
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row dense>
                <v-col
                  v-for="(image, index) in diveLog?.images"
                  :key="index"
                  cols="12"
                >
                  <v-img
                    :src="image"
                    aspect-ratio="16/9"
                    cover
                    class="rounded-lg mb-4"
                    @click="openImageDialog(image)"
                  />
                </v-col>
              </v-row>
              <div
                v-if="!diveLog?.images?.length"
                class="text-center text-medium-emphasis pa-6"
              >
                <v-icon icon="mdi-image-off" size="48" color="grey" />
                <div class="mt-4">無照片</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- 確認刪除對話框 -->
    <v-dialog v-model="showDeleteDialog" width="auto">
      <v-card>
        <v-card-title class="text-center">
          <v-icon icon="mdi-alert" color="error" class="mr-2" />
          確認刪除
        </v-card-title>
        <v-card-text class="pt-4 text-center">
          確定要刪除這筆潛水日誌嗎？此操作無法復原。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelDelete">
            取消
          </v-btn>
          <v-btn color="error" @click="confirmDelete">確定刪除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 照片預覽對話框 -->
    <v-dialog v-model="showImageDialog" width="auto">
      <v-card>
        <v-img :src="selectedImage" max-height="90vh" contain />
        <v-card-actions class="justify-end">
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showImageDialog = false"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter, type RouteParams } from "vue-router";
import { useDiveLogService, type DiveLog } from "@/services/diveLogService";

interface DiveLogParams extends RouteParams {
  id: string;
}

const route = useRoute();
const router = useRouter();
const { getDiveLog, deleteDiveLog, loading, error } = useDiveLogService();

const diveLog = ref<DiveLog | null>(null);
const deleteLoading = ref(false);
const showDeleteDialog = ref(false);

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-TW");
};

// 載入潛水日誌詳情
const loadDiveLog = async () => {
  const id = (route.params as DiveLogParams).id as string;
  if (!id) {
    router.push("/dive-log");
    return;
  }

  try {
    diveLog.value = await getDiveLog(id);
    console.log(diveLog.value);
  } catch (err) {
    console.error(err);
  }
};

// 處理刪除
const handleDelete = () => {
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
};

const confirmDelete = async () => {
  if (!diveLog.value?.id) return;

  deleteLoading.value = true;
  try {
    await deleteDiveLog(diveLog.value.id);
    router.push("/dive-log");
  } catch (err) {
    console.error(err);
  } finally {
    deleteLoading.value = false;
    showDeleteDialog.value = false;
  }
};

// 照片預覽
const showImageDialog = ref(false);
const selectedImage = ref("");

const openImageDialog = (image: string) => {
  selectedImage.value = image;
  showImageDialog.value = true;
};

// 資訊分組
const basicInfo = computed(() => {
  if (!diveLog.value) return [];
  return [
    {
      label: "日期",
      value: formatDate(diveLog.value.date),
      icon: "mdi-calendar",
    },
    { label: "時間", value: diveLog.value.time, icon: "mdi-clock" },
    { label: "地點", value: diveLog.value.location, icon: "mdi-map-marker" },
    {
      label: "潛水時間",
      value: `${diveLog.value.duration} 分鐘`,
      icon: "mdi-timer",
    },
    {
      label: "最大深度",
      value: `${diveLog.value.maxDepth} 公尺`,
      icon: "mdi-arrow-collapse-down",
    },
  ];
});

const environmentInfo = computed(() => {
  if (!diveLog.value) return [];
  return [
    {
      label: "氣溫",
      value: `${diveLog.value.airTemp}°C`,
      icon: "mdi-thermometer",
    },
    {
      label: "水溫",
      value: `${diveLog.value.waterTemp}°C`,
      icon: "mdi-thermometer-water",
    },
    { label: "天氣", value: diveLog.value.weather, icon: "mdi-weather-sunny" },
    { label: "水域類型", value: diveLog.value.waterType, icon: "mdi-waves" },
    { label: "潮流", value: diveLog.value.current, icon: "mdi-current-ac" },
    { label: "浪況", value: diveLog.value.waveCondition, icon: "mdi-wave" },
    {
      label: "能見度",
      value: `${diveLog.value.visibility} 公尺`,
      icon: "mdi-eye",
    },
  ];
});

const equipmentInfo = computed(() => {
  if (!diveLog.value) return [];
  return [
    {
      label: "配重",
      value: `${diveLog.value.weight} 公斤`,
      icon: "mdi-weight",
    },
    {
      label: "氣瓶類型",
      value: diveLog.value.tankType,
      icon: "mdi-diving-scuba-tank",
    },
    {
      label: "開始氣量",
      value: `${diveLog.value.startPressure} bar`,
      icon: "mdi-gauge",
    },
    {
      label: "結束氣量",
      value: `${diveLog.value.endPressure} bar`,
      icon: "mdi-gauge-empty",
    },
    {
      label: "潛伴",
      value: diveLog.value.buddies?.join(", ") || "無",
      icon: "mdi-account-group",
    },
    { label: "潛店", value: diveLog.value.diveShop || "無", icon: "mdi-store" },
  ];
});

// 初始載入
onMounted(() => {
  loadDiveLog();
});
</script>

<style scoped>
.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
