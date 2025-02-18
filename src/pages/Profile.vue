<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-center align-center mb-6">
          <v-avatar color="primary" size="48" class="mr-4">
            {{ userInitials }}
          </v-avatar>
          <div>
            <h1 class="text-h4 mb-1">個人資料</h1>
            <div class="text-subtitle-1 text-medium-emphasis">
              {{ authStore.user?.email }}
            </div>
          </div>
        </div>

        <!-- 潛水統計 -->
        <v-card class="mb-6 mx-auto" max-width="600" variant="elevated">
          <v-card-text class="text-center">
            <v-icon
              icon="mdi-diving-scuba"
              color="primary"
              size="48"
              class="mb-2"
            />
            <div class="text-h3 mb-2">{{ authStore.user?.diveCount || 0 }}</div>
            <div class="text-subtitle-1 text-medium-emphasis">總潛水次數</div>
          </v-card-text>
        </v-card>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-card class="pa-6 mx-auto" max-width="600" variant="elevated">
          <v-form ref="form">
            <v-text-field
              v-model="formData.name"
              label="姓名"
              variant="outlined"
              :rules="[requiredRule]"
              class="mb-4"
            />

            <v-text-field
              v-model="formData.email"
              label="電子郵件"
              type="email"
              variant="outlined"
              :rules="[requiredRule, emailRule]"
              readonly
              class="mb-4"
            />

            <!-- 潛水證照列表 -->
            <div class="mb-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-certificate" class="mr-2" />
                  <h3 class="text-h6">潛水證照</h3>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  :disabled="formData.certificates.length >= 5"
                  @click="addCertificate"
                  prepend-icon="mdi-plus"
                >
                  新增證照
                </v-btn>
              </div>

              <v-expand-transition group>
                <div
                  v-for="(cert, index) in formData.certificates"
                  :key="index"
                  class="mb-4 pa-4 bg-grey-darken-4 rounded-lg elevation-1"
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-1">證照 {{ index + 1 }}</span>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      density="comfortable"
                      color="error"
                      @click="removeCertificate(index)"
                    />
                  </div>

                  <v-select
                    v-model="cert.system"
                    label="證照系統"
                    :items="certSystems"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                    hide-details
                  />

                  <v-select
                    v-model="cert.level"
                    label="等級"
                    :items="getCertLevels(cert.system)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                    :disabled="!cert.system"
                    hide-details
                  />

                  <v-text-field
                    v-model="cert.url"
                    label="證照圖片連結"
                    variant="outlined"
                    density="comfortable"
                    :rules="[urlRule]"
                    hide-details
                  />
                </div>
              </v-expand-transition>

              <v-alert
                v-if="formData.certificates.length === 0"
                type="info"
                variant="tonal"
                icon="mdi-information"
                class="mt-2"
              >
                尚未新增任何證照
              </v-alert>
            </div>

            <v-divider class="mb-6" />
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-lock" class="mr-2" />
              <h3 class="text-h6">修改密碼</h3>
            </div>

            <v-text-field
              v-model="formData.currentPassword"
              label="目前密碼"
              type="password"
              variant="outlined"
              class="mb-4"
            />

            <v-text-field
              v-model="formData.newPassword"
              label="新密碼"
              type="password"
              variant="outlined"
              :rules="passwordRules"
              class="mb-4"
            />

            <v-text-field
              v-model="formData.confirmPassword"
              label="確認新密碼"
              type="password"
              variant="outlined"
              :rules="[passwordMatchRule]"
              class="mb-6"
            />

            <div class="d-flex gap-4">
              <v-btn
                color="primary"
                size="large"
                :loading="isSubmitting"
                @click="handleSubmit"
                prepend-icon="mdi-check"
              >
                更新資料
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- 提示 Modal -->
    <v-dialog v-model="showAlert" width="auto">
      <v-card>
        <v-card-text class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon
              :color="alertType === 'success' ? 'success' : 'error'"
              size="24"
              class="mr-2"
            >
              {{
                alertType === "success"
                  ? "mdi-check-circle"
                  : "mdi-alert-circle"
              }}
            </v-icon>
            <span class="text-h6">{{ alertTitle }}</span>
          </div>
          <p class="mb-0">{{ alertMessage }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="showAlert = false">
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import type { VForm } from "vuetify/components";
import { useAuthService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth";
import type { Certificate } from "@/services/authService";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const authService = useAuthService();
const router = useRouter();
const form = ref<VForm | null>(null);
const error = ref<string | null>(null);
const isSubmitting = ref(false);

// 證照系統選項
const certSystems = ["PADI", "SSI", "NAUI", "TDI", "其他"];

// 使用 computed 來監聽表單是否有變更
computed(() => {
  if (!authStore.user) return false;
  return (
    formData.value.name !== authStore.user.name ||
    formData.value.currentPassword ||
    formData.value.newPassword ||
    JSON.stringify(formData.value.certificates) !==
      JSON.stringify(authStore.user.certificates || [])
  );
});

const formData = ref({
  name: "",
  email: "",
  certificates: [] as Certificate[],
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 重置表單
const resetForm = () => {
  if (authStore.user) {
    formData.value = {
      name: authStore.user.name,
      email: authStore.user.email,
      certificates: [...(authStore.user.certificates || [])],
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  }
};

// 表單驗證規則
const requiredRule = (v: string) => !!v || "此欄位為必填";
const emailRule = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "請輸入有效的電子郵件";
const urlRule = (v: string) => {
  if (!v) return true;
  return /^https?:\/\/.+/.test(v) || "請輸入有效的URL連結";
};
const passwordRules = [
  (v: string) => !v || v.length >= 6 || "密碼長度至少需要6個字元",
];
const passwordMatchRule = (v: string) =>
  !formData.value.newPassword ||
  v === formData.value.newPassword ||
  "密碼不一致";

// 證照相關方法
const addCertificate = () => {
  formData.value.certificates.push({
    system: "",
    level: "",
    url: "",
  });
};

const removeCertificate = (index: number) => {
  formData.value.certificates.splice(index, 1);
};

const getCertLevels = (system: string) => {
  switch (system) {
    case "PADI":
      return [
        "Open Water Diver",
        "Advanced Open Water Diver",
        "Rescue Diver",
        "Divemaster",
        "Instructor",
      ];
    case "SSI":
      return [
        "Open Water Diver",
        "Advanced Adventurer",
        "Rescue Diver",
        "Divemaster",
        "Instructor",
      ];
    case "NAUI":
      return [
        "Scuba Diver",
        "Advanced Scuba Diver",
        "Rescue Diver",
        "Divemaster",
        "Instructor",
      ];
    case "TDI":
      return [
        "Open Water Diver",
        "Advanced Nitrox Diver",
        "Decompression Procedures",
        "Extended Range",
        "Instructor",
      ];
    default:
      return [];
  }
};

// 載入用戶資料
onMounted(() => {
  authStore.refreshUserData();
  resetForm();
});

// 監聽用戶資料變更
watch(
  () => authStore.user,
  (newUser) => {
    if (!newUser) {
      router.push("/login");
    } else {
      resetForm();
    }
  }
);

// Alert 相關狀態
const showAlert = ref(false);
const alertType = ref<"success" | "error">("success");
const alertTitle = ref("");
const alertMessage = ref("");

// 顯示提示
const showNotification = (type: "success" | "error", message: string) => {
  alertType.value = type;
  alertTitle.value = type === "success" ? "更新成功" : "更新失敗";
  alertMessage.value = message;
  showAlert.value = true;
};

// 提交表單
const handleSubmit = async () => {
  const isValid = await form.value?.validate();
  if (!isValid?.valid) return;

  isSubmitting.value = true;
  error.value = null;

  try {
    await authService.updateProfile({
      name: formData.value.name,
      email: formData.value.email,
      certificates: formData.value.certificates,
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword,
    });

    // 重新載入用戶資料
    await authStore.refreshUserData();
    resetForm();
    showNotification("success", "個人資料更新成功！");
  } catch (err) {
    showNotification("error", err as string);
  } finally {
    isSubmitting.value = false;
  }
};

// 用戶名稱縮寫
const userInitials = computed(() => {
  if (!authStore.user?.name) return "";
  return authStore.user.name.charAt(0).toUpperCase();
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-expand-transition-group-enter-active,
.v-expand-transition-group-leave-active {
  transition: all 0.3s ease-in-out;
}

.v-expand-transition-group-enter-from,
.v-expand-transition-group-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 證照卡片動畫 */
.bg-grey-darken-4 {
  transition: all 0.3s ease;
}

.bg-grey-darken-4:hover {
  background-color: rgba(66, 66, 66, 0.8) !important;
}
</style>
