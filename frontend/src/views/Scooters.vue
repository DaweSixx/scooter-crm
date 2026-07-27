<template>
  <div class="scooters-page">
    <div class="header">
      <h1>Управление самокатами</h1>
      <button class="btn primary" @click="openModal()">+ Добавить самокат</button>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters">
      <input 
        v-model="search" 
        placeholder="Поиск по номеру или модели..." 
        class="input-search"
      />
      <select v-model="statusFilter" class="select-filter">
        <option value="">Все статусы</option>
        <option value="available">Available</option>
        <option value="in_use">In Use</option>
        <option value="maintenance">Maintenance</option>
        <option value="offline">Offline</option>
      </select>
    </div>

    <!-- Таблица самокатов -->
    <table class="data-table">
      <thead>
        <tr>
          <th>ID / Номер</th>
          <th>Модель</th>
          <th>Статус</th>
          <th>Заряд</th>
          <th>Координаты</th>
          <th>Обновлено</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="scooter in filteredScooters" :key="scooter.id">
          <td><b>{{ scooter.code }}</b></td>
          <td>{{ scooter.model }}</td>
          <td>
            <span :class="['badge', scooter.status]">{{ scooter.status }}</span>
          </td>
          <td>
            <div class="battery-bar">
              <div class="battery-fill" :style="{ width: scooter.batteryLevel + '%' }"></div>
              <span>{{ scooter.batteryLevel }}%</span>
            </div>
          </td>
          <td>{{ scooter.latitude.toFixed(4) }}, {{ scooter.longitude.toFixed(4) }}</td>
          <td>{{ new Date(scooter.updatedAt).toLocaleString() }}</td>
          <td>
            <button class="btn-sm" @click="openModal(scooter)">Ред.</button>
            <button class="btn-sm danger" @click="deleteScooter(scooter.id)">Уд.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingId ? 'Редактировать самокат' : 'Новый самокат' }}</h3>
        <form @submit.prevent="saveScooter">
          <label>Код / Номер</label>
          <input v-model="form.code" required />

          <label>Модель</label>
          <input v-model="form.model" required />

          <label>Статус</label>
          <select v-model="form.status">
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          <label>Уровень заряда (%)</label>
          <input type="number" min="0" max="100" v-model.number="form.batteryLevel" required />

          <label>Широта (Latitude)</label>
          <input type="number" step="any" v-model.number="form.latitude" required />

          <label>Долгота (Longitude)</label>
          <input type="number" step="any" v-model.number="form.longitude" required />

          <div class="modal-actions">
            <button type="button" class="btn" @click="isModalOpen = false">Отмена</button>
            <button type="submit" class="btn primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useScooterStore, Scooter } from '../stores/scooters';

const store = useScooterStore();
const search = ref('');
const statusFilter = ref('');
const isModalOpen = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  code: '',
  model: '',
  status: 'available' as Scooter['status'],
  batteryLevel: 100,
  latitude: 55.7512,
  longitude: 37.6184,
});

onMounted(() => {
  store.fetchScooters();
});

const filteredScooters = computed(() => {
  return store.scooters.filter(scooter => {
    const matchesSearch = scooter.code.toLowerCase().includes(search.value.toLowerCase()) ||
                          scooter.model.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = statusFilter.value ? scooter.status === statusFilter.value : true;
    return matchesSearch && matchesStatus;
  });
});

const openModal = (scooter?: Scooter) => {
  if (scooter) {
    editingId.value = scooter.id;
    form.value = { ...scooter };
  } else {
    editingId.value = null;
    form.value = { code: '', model: '', status: 'available', batteryLevel: 100, latitude: 55.7512, longitude: 37.6184 };
  }
  isModalOpen.value = true;
};

const saveScooter = async () => {
  if (editingId.value) {
    await axios.put(`http://localhost:5000/api/scooters/${editingId.value}`, form.value);
  } else {
    await axios.post('http://localhost:5000/api/scooters', form.value);
  }
  isModalOpen.value = false;
  store.fetchScooters();
};

const deleteScooter = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить этот самокат?')) {
    await axios.delete(`http://localhost:5000/api/scooters/${id}`);
    store.fetchScooters();
  }
};
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.filters { display: flex; gap: 12px; margin-bottom: 16px; }
.input-search { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.select-filter { padding: 8px; border-radius: 4px; border: 1px solid #ccc; }

.data-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
.badge.available { background: #e8f5e9; color: #2e7d32; }
.badge.in_use { background: #e1f5fe; color: #0288d1; }
.badge.maintenance { background: #fff3e0; color: #ed6c02; }
.badge.offline { background: #f5f5f5; color: #616161; }

.battery-bar { background: #eee; border-radius: 4px; position: relative; height: 18px; overflow: hidden; width: 80px; }
.battery-fill { background: #4caf50; height: 100%; }
.battery-bar span { position: absolute; top: 0; left: 0; right: 0; text-align: center; font-size: 0.75em; line-height: 18px; color: #000; }

.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
.btn.primary { background: #1976d2; color: #fff; }
.btn-sm { padding: 4px 8px; margin-right: 4px; cursor: pointer; }
.btn-sm.danger { background: #d32f2f; color: #fff; border: none; border-radius: 2px; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: #fff; padding: 24px; border-radius: 8px; width: 400px; }
.modal form { display: flex; flex-direction: column; gap: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>