<template>
  <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Scooter } from '../stores/scooters';

const props = defineProps<{
  scooters: Scooter[];
}>();

let map: L.Map | null = null;
const markers = ref<Map<number, L.Marker>>(new Map());

// Иконка маркера с динамическим цветом в зависимости от статуса
const getMarkerIcon = (status: string, battery: number) => {
  let color = '#2e7d32'; // available
  if (status === 'in_use') color = '#0288d1';
  if (status === 'maintenance') color = '#ed6c02';
  if (status === 'offline') color = '#757575';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-map-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const updateMarkers = () => {
  if (!map) return;

  props.scooters.forEach((scooter) => {
    const existingMarker = markers.value.get(scooter.id);
    const popupContent = `
      <b>${scooter.code}</b> (${scooter.model})<br/>
      Статус: <b>${scooter.status}</b><br/>
      Заряд: <b>${scooter.batteryLevel}%</b>
    `;

    if (existingMarker) {
      existingMarker.setLatLng([scooter.latitude, scooter.longitude]);
      existingMarker.setIcon(getMarkerIcon(scooter.status, scooter.batteryLevel));
      existingMarker.getPopup()?.setContent(popupContent);
    } else {
      const marker = L.marker([scooter.latitude, scooter.longitude], {
        icon: getMarkerIcon(scooter.status, scooter.batteryLevel)
      })
      .bindPopup(popupContent)
      .addTo(map);

      markers.value.set(scooter.id, marker);
    }
  });
};

onMounted(() => {
  // Центрируем карту (например, Москва/Санкт-Петербург или центр вашей локации)
  map = L.map('map').setView([55.751244, 37.618423], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  updateMarkers();
});

watch(() => props.scooters, () => {
  updateMarkers();
}, { deep: true });
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>