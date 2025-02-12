<template>
  <v-container class="fill-height pa-0" fluid>
    <div id="map" style="height: 100%; width: 100%" />
    <v-card
      class="map-overlay"
      style="position: absolute; bottom: 16px; left: 16px; z-index: 1000"
      width="300"
    >
      <v-card-title class="text-h6">潛點地圖</v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="selectedSpot"
          v-model:search="search"
          :items="filteredDiveSpots"
          :loading="isLoading"
          label="搜尋潛點"
          density="comfortable"
          variant="outlined"
          item-title="name"
          item-value="name"
          hide-no-data
          hide-details
          prepend-inner-icon="mdi-magnify"
          clearable
          @update:search="handleSearch"
          @update:model-value="handleSelect"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon icon="mdi-map-marker" class="mr-2" />
              </template>
              <!-- <v-list-item-title>{{ item.raw.name }}</v-list-item-title> -->
              <v-list-item-subtitle class="text-white">
                {{ formatCoordinates(item.raw.lat, item.raw.lng) }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface DiveSpot {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  region?: string;
}

const search = ref("");
const selectedSpot = ref(null);
const isLoading = ref(false);
let map: L.Map;
const markers: { [key: string]: L.Marker } = {};

const diveSpots = ref<DiveSpot[]>([]);
const error = ref<string | null>(null);

// 過濾潛點
const filteredDiveSpots = ref<DiveSpot[]>([]);

// 處理搜尋
const handleSearch = (text: string) => {
  if (!text) {
    filteredDiveSpots.value = diveSpots.value;
    return;
  }

  filteredDiveSpots.value = diveSpots.value.filter((spot) =>
    spot.name.toLowerCase().includes(text.toLowerCase())
  );
};

// 處理選擇
const handleSelect = (spotName: string | null) => {
  if (!spotName) return;

  const spot = diveSpots.value.find((s) => s.name === spotName);
  if (spot) {
    map.setView([spot.lat, spot.lng], 15);
    markers[spot.name].openPopup();
  }
};

// 格式化座標
const formatCoordinates = (lat: number, lng: number) => {
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
};

// 載入潛點數據
const loadDiveSpots = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get<DiveSpot[]>(`${API_URL}/api/diveMap`);
    diveSpots.value = response.data;
    filteredDiveSpots.value = response.data;

    // 清除現有標記
    Object.values(markers).forEach((marker) => marker.remove());

    // 添加新標記
    diveSpots.value.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng])
        .bindPopup(
          `
          <div class="popup-content">
            <h3 class="popup-title">${spot.name}</h3>
            ${
              spot.region
                ? `<div class="popup-region">${spot.region}</div>`
                : ""
            }
            ${
              spot.description
                ? `<div class="popup-description">${spot.description}</div>`
                : ""
            }
            <div class="popup-coordinates">
              <i class="popup-icon">📍</i> ${formatCoordinates(
                spot.lat,
                spot.lng
              )}
            </div>
          </div>
        `,
          {
            className: "custom-popup",
            maxWidth: 300,
            minWidth: 200,
          }
        )
        .addTo(map);
      markers[spot.name] = marker;
    });

    console.log(diveSpots.value);
  } catch (err) {
    console.error("Error loading dive spots:", err);
    error.value = "載入潛點資料失敗";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // 初始化地圖
  map = L.map("map").setView([23.5, 121.5], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // 載入潛點數據
  loadDiveSpots();
});
</script>

<style>
.fill-height {
  height: calc(100vh - 64px);
}

/* 自動完成選單樣式 */
.v-autocomplete .v-field__input {
  padding: 8px 0;
}

.v-list-item-subtitle {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

/* 自定義彈出視窗樣式 */
:deep(.custom-popup) {
  .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .leaflet-popup-content {
    margin: 12px;
  }

  .popup-content {
    font-family: system-ui, -apple-system, sans-serif;
  }

  .popup-title {
    font-size: 1.2em;
    font-weight: 600;
    color: #1976d2;
    margin: 0 0 8px 0;
  }

  .popup-region {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 8px;
  }

  .popup-description {
    font-size: 0.95em;
    line-height: 1.4;
    color: #333;
    margin: 8px 0;
  }

  .popup-coordinates {
    font-size: 0.85em;
    color: #666;
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .popup-icon {
    margin-right: 4px;
    font-style: normal;
  }
}
</style>
