<template>
  <div>
    <!-- Hero Section -->
    <v-parallax
      src="https://images.unsplash.com/photo-1682687982501-1e58ab814714"
      class="hero-section"
    >
      <template #placeholder>
        <div class="hero-section d-flex align-center justify-center">
          <v-progress-circular indeterminate color="primary" size="64" />
        </div>
      </template>

      <v-container class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h2 font-weight-bold mb-4">Your Dive, Your Story</h1>
            <p class="text-h5 mb-8">記錄你的潛水體驗，探索全球潛點</p>
            <div class="d-flex justify-center gap-4">
              <v-btn
                color="primary"
                size="x-large"
                prepend-icon="mdi-notebook"
                to="/dive-log"
                class="mr-4"
              >
                開始記錄
              </v-btn>
              <v-btn
                variant="outlined"
                size="x-large"
                prepend-icon="mdi-map-search"
                to="/dive-map"
              >
                探索潛點
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>

    <!-- 特色功能簡介 -->
    <v-container class="py-12">
      <h2 class="text-h4 text-center mb-12">為什麼選擇 Blue Diary？</h2>
      <v-row>
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          md="3"
        >
          <v-card class="pa-4 text-center" variant="flat">
            <v-icon
              :icon="feature.icon"
              size="48"
              color="primary"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">{{ feature.title }}</h3>
            <p class="text-body-1">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 熱門潛水日誌 -->
    <v-container class="py-12 bg-grey-lighten-4">
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h4">熱門潛水日誌</h2>
        <v-btn variant="text" to="/dive-log" class="text-none">
          查看更多
          <v-icon icon="mdi-chevron-right" />
        </v-btn>
      </div>
      <v-row>
        <v-col v-for="log in featuredLogs" :key="log.id" cols="12" md="4">
          <v-card class="h-100" elevation="2" hover>
            <v-img :src="log.image" height="200" cover>
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="grey-lighten-4" />
                </div>
              </template>
              <div class="image-overlay">
                <v-chip
                  color="primary"
                  variant="elevated"
                  class="location-chip"
                  size="small"
                >
                  {{ log.location }}
                </v-chip>
              </div>
            </v-img>

            <v-card-item>
              <template #prepend>
                <v-avatar size="40" class="mr-3">
                  <v-img :src="log.userAvatar" :alt="log.userName">
                    <template #placeholder>
                      <v-progress-circular
                        indeterminate
                        color="grey-lighten-3"
                        size="20"
                      />
                    </template>
                  </v-img>
                </v-avatar>
              </template>
              <v-card-title>{{ log.userName }}</v-card-title>
              <v-card-subtitle class="pt-2">
                {{ new Date(log.date).toLocaleDateString() }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <div class="d-flex gap-2 mb-3">
                <v-chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-diving-scuba"
                  class="mr-2"
                >
                  深度 {{ log.depth }}m
                </v-chip>
                <v-chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-clock-outline"
                  class="mr-2"
                >
                  時間 {{ log.duration }}分鐘
                </v-chip>
              </div>
              <p class="text-body-1">{{ log.description }}</p>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn variant="text" prepend-icon="mdi-heart-outline">
                {{ log.likes || 0 }}
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-comment-outline">
                {{ log.comments || 0 }}
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                color="primary"
                class="text-none"
                :to="`/dive-log/${log.id}`"
              >
                查看詳情
                <v-icon icon="mdi-chevron-right" size="small" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Call to Action -->
    <v-container class="py-16 text-center">
      <h2 class="text-h3 mb-8">開始記錄你的潛水冒險</h2>
      <p class="text-h6 mb-8">加入我們，與全球潛水愛好者分享你的故事</p>
      <v-btn
        color="primary"
        size="x-large"
        to="/register"
        prepend-icon="mdi-account-plus"
      >
        立即註冊
      </v-btn>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const features = [
  {
    icon: "mdi-notebook",
    title: "記錄潛水日誌",
    description: "詳細記錄每次潛水的深度、時間和見聞",
  },
  {
    icon: "mdi-map-marker",
    title: "探索潛點",
    description: "發現全球精彩潛點，查看即時海況資訊",
  },
  {
    icon: "mdi-camera",
    title: "分享照片和影片",
    description: "上傳精彩的水下照片和影片，永久保存回憶",
  },
  {
    icon: "mdi-account-group",
    title: "連結潛水夥伴",
    description: "認識志同道合的潛水夥伴，一起探索海洋",
  },
];

const featuredLogs = ref([
  {
    id: 1,
    location: "綠島石朗",
    userName: "Alex Chen",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    depth: 18,
    duration: 45,
    description: "今天遇到了一群蝠魟，非常震撼！水溫適中，能見度超好。",
    image: "https://picsum.photos/500/300",
    date: "2024-03-15",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    location: "蘭嶼八代灣",
    userName: "Sarah Lin",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    depth: 22,
    duration: 50,
    description: "珊瑚群非常漂亮，還看到了海龜！",
    image: "https://picsum.photos/500/301",
    date: "2024-03-10",
    likes: 18,
    comments: 5,
  },
  {
    id: 3,
    location: "墾丁後壁湖",
    userName: "Mike Wang",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    depth: 15,
    duration: 40,
    description: "適合初學者的潛點，魚群豐富，教練很專業。",
    image: "https://picsum.photos/500/303",
    date: "2024-03-05",
    likes: 12,
    comments: 3,
  },
]);
</script>

<style scoped>
.hero-section {
  height: calc(100vh - 64px);
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

:deep(.v-parallax__content) {
  color: white;
  z-index: 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4) 0%,
    transparent 30%,
    transparent 70%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

.location-chip {
  position: absolute;
  top: 16px;
  left: 16px;
}

.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>
