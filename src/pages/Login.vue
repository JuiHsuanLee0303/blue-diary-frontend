<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-8">
          <div class="text-center mb-8">
            <span class="blue-diary-title">
              <span class="blue">BLUE</span>
              <span class="diary">DIARY</span>
            </span>
          </div>

          <h2 class="text-h5 mb-6 text-center">登入帳號</h2>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="電子郵件"
              type="email"
              required
              variant="outlined"
              prepend-inner-icon="mdi-email"
            />

            <v-text-field
              v-model="password"
              label="密碼"
              :type="showPassword ? 'text' : 'password'"
              required
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              class="mt-2"
              :loading="loading"
              :disabled="loading"
            >
              登入
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            <v-btn variant="text" to="/register"> 還沒有帳號？立即註冊 </v-btn>
          </div>

          <v-divider class="my-6" />

          <v-btn
            block
            color="red"
            variant="outlined"
            prepend-icon="mdi-google"
            class="mb-3"
          >
            使用 Google 帳號登入
          </v-btn>
          <v-btn
            block
            color="primary"
            variant="outlined"
            prepend-icon="mdi-facebook"
          >
            使用 Facebook 帳號登入
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- 結果 Dialog -->
    <v-dialog v-model="dialog" width="auto" persistent>
      <v-card min-width="300">
        <v-card-title
          :class="[isSuccess ? 'text-success' : 'text-error', 'text-center']"
        >
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text class="pt-4 text-center">
          {{ dialogMessage }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="handleDialogClose">
            {{ isSuccess ? "前往首頁" : "確定" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthService } from "../services/authService";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const { login, loading, error } = useAuthService();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

// dialog 相關狀態
const dialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const isSuccess = ref(false);

const handleLogin = async () => {
  try {
    const response = await login(email.value, password.value);
    authStore.setAuth(response.user, response.token, response.refreshToken);

    dialogTitle.value = "登入成功";
    dialogMessage.value = "歡迎回來！";
    isSuccess.value = true;
    dialog.value = true;
  } catch (err) {
    dialogTitle.value = "登入失敗";
    dialogMessage.value = error.value || "帳號或密碼錯誤";
    isSuccess.value = false;
    dialog.value = true;
    console.error(err);
  }
};

const handleDialogClose = () => {
  dialog.value = false;
  if (isSuccess.value) {
    router.push("/");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap");

.blue-diary-title {
  font-family: "Montserrat", sans-serif;
  letter-spacing: 2px;
  font-size: 1.5rem;
}

.blue {
  color: #1e88e5;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.diary {
  margin-left: 8px;
  color: #0d47a1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
