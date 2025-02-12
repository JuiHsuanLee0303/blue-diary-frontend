<template>
  <v-container>
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">我的潛水日誌</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/dive-log/new">
          新增紀錄
        </v-btn>
      </v-col>
    </v-row>

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

    <!-- 潛水日誌列表 -->
    <v-row v-else>
      <v-col v-for="log in diveLogs" :key="log.id" cols="12" md="6">
        <v-card>
          <div class="d-flex">
            <v-img
              :src="log.images?.[0] || 'https://picsum.photos/500/300'"
              class="flex-grow-0"
              width="200"
              height="200"
              cover
            />
            <v-card-text class="flex-grow-1">
              <div class="d-flex justify-space-between">
                <h3 class="text-h6">{{ log.name }}</h3>
                <v-chip size="small">{{ formatDate(log.date) }}</v-chip>
              </div>
              <div
                class="mt-2 text-subtitle-2 text-medium-emphasis d-flex align-center"
              >
                <v-icon icon="mdi-map-marker" size="small" class="mr-1" />
                {{ log.location }}
              </div>
              <div class="mt-2">
                <v-chip size="small" class="mr-2">
                  水溫 {{ log.waterTemp }}°C
                </v-chip>
                <v-chip size="small" class="mr-2">
                  深度 {{ log.maxDepth }}m
                </v-chip>
                <v-chip size="small"> 時間 {{ log.duration }}分鐘 </v-chip>
              </div>
              <p
                v-if="log.notes"
                class="mt-4 text-body-2 text-medium-emphasis text-truncate"
              >
                {{ log.notes }}
              </p>
              <div class="mt-2">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  :to="`/dive-log/${log.id}`"
                >
                  查看
                </v-btn>
                <v-btn
                  variant="text"
                  color="error"
                  size="small"
                  :loading="deleteLoading === log.id"
                  @click="handleDelete(log.id)"
                >
                  刪除
                </v-btn>
              </div>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 確認刪除對話框 -->
    <v-dialog v-model="showDeleteDialog" width="auto">
      <v-card>
        <v-card-title class="text-center">確認刪除</v-card-title>
        <v-card-text class="pt-4">
          確定要刪除這筆潛水日誌嗎？此操作無法復原。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelDelete">
            取消
          </v-btn>
          <v-btn color="error" @click="confirmDelete"> 確定刪除 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDiveLogService, type DiveLog } from "@/services/diveLogService";

const { getDiveLogs, deleteDiveLog, loading, error } = useDiveLogService();
const diveLogs = ref<DiveLog[]>([]);
const deleteLoading = ref<number | null>(null);
const showDeleteDialog = ref(false);
const pendingDeleteId = ref<number | null>(null);

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("zh-TW");
};

// 載入潛水日誌
const loadDiveLogs = async () => {
  try {
    diveLogs.value = await getDiveLogs();
  } catch (err) {
    console.error(err);
  }
};

// 處理刪除
const handleDelete = (id: number) => {
  pendingDeleteId.value = id;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
  pendingDeleteId.value = null;
};

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return;

  deleteLoading.value = pendingDeleteId.value;
  try {
    await deleteDiveLog(pendingDeleteId.value);
    await loadDiveLogs(); // 重新載入列表
    showDeleteDialog.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    deleteLoading.value = null;
    pendingDeleteId.value = null;
  }
};

// 初始載入
onMounted(() => {
  loadDiveLogs();
});
</script>
