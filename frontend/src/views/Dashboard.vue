<template>
  <div class="dashboard">
    <h1>Дашборд CRM</h1>
    
    <div v-if="store.analytics" class="stats-grid">
      <div class="card">
        <h3>Активные аренды</h3>
        <p class="value">{{ store.analytics.activeRentals }}</p>
      </div>
      <div class="card">
        <h3>Средний заряд</h3>
        <p class="value">{{ store.analytics.avgBattery }}%</p>
      </div>
      <div class="card">
        <h3>Всего самокатов</h3>
        <p class="value">{{ store.analytics.statuses.total }}</p>
      </div>
      <div class="card">
        <h3>Доступно</h3>
        <p class="value green">{{ store.analytics.statuses.available }}</p>
      </div>
    </div>

    <h2>Самокаты на карте</h2>
    <ScooterMap :scooters="store.scooters" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useScooterStore } from '../stores/scooters';
import ScooterMap from '../components/ScooterMap.vue';

const store = useScooterStore();

onMounted(() => {
  store.fetchScooters();
  store.fetchAnalytics();
  store.setupWebSocket();
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.card {
  padding: 16px;
  border-radius: 8px;
  background: #f4f5f7;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.value {
  font-size: 2em;
  font-weight: bold;
  margin: 8px 0 0;
}
.green { color: #2e7d32; }
</style>