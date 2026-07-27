<template>
  <div class="rentals-page">
    <div class="header">
      <h1>Управление арендами</h1>
      <button class="btn primary" @click="isModalOpen = true">+ Начать аренду</button>
    </div>

    <!-- Таблица аренд -->
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Самокат</th>
          <th>Арендатор</th>
          <th>Телефон</th>
          <th>Начало</th>
          <th>Окончание</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rental in rentals" :key="rental.id">
          <td>{{ rental.id }}</td>
          <td><b>{{ rental.scooter?.code }}</b> ({{ rental.scooter?.model }})</td>
          <td>{{ rental.userName }}</td>
          <td>{{ rental.userPhone }}</td>
          <td>{{ new Date(rental.startTime).toLocaleString() }}</td>
          <td>{{ rental.endTime ? new Date(rental.endTime).toLocaleString() : '—' }}</td>
          <td>
            <span :class="['badge', rental.status]">{{ rental.status }}</span>
          </td>
          <td>
            <button 
              v-if="rental.status === 'active'" 
              class="btn-sm success" 
              @click="completeRental(rental.id)"
            >
              Завершить
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно запуска аренды -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal">
        <h3>Новая аренда</h3>
        <form @submit.prevent="startRental">
          <label>Выбор самоката (только available)</label>
          <select v-model="form.scooterId" required>
            <option 
              v-for="s in availableScooters" 
              :key="s.id" 
              :value="s.id"
            >
              {{ s.code }} ({{ s.model }}) — {{ s.batteryLevel }}%
            </option>
          </select>

          <label>Имя клиента</label>
          <input v-model="form.userName" required />

          <label>Телефон клиента</label>
          <input v-model="form.userPhone" required placeholder="+79990000000" />

          <div class="modal-actions">
            <button type="button" class="btn" @click="isModalOpen = false">Отмена</button>
            <button type="submit" class="btn primary">Запустить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useScooterStore } from '../stores/scooters';

const store = useScooterStore();
const rentals = ref<any[]>([]);
const isModalOpen = ref(false);

const form = ref({
  scooterId: null as number | null,
  userName: '',
  userPhone: '',
});

const fetchRentals = async () => {
  const res = await axios.get('http://localhost:5000/api/rentals');
  rentals.value = res.data;
};

const availableScooters = computed(() => {
  return store.scooters.filter(s => s.status === 'available');
});

const startRental = async () => {
  try {
    await axios.post('http://localhost:5000/api/rentals', form.value);
    isModalOpen.value = false;
    form.value = { scooterId: null, userName: '', userPhone: '' };
    fetchRentals();
    store.fetchScooters();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка запуска аренды');
  }
};

const completeRental = async (id: number) => {
  await axios.post(`http://localhost:5000/api/rentals/${id}/complete`);
  fetchRentals();
  store.fetchScooters();
};

onMounted(() => {
  fetchRentals();
  store.fetchScooters();
});
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
.badge.active { background: #e1f5fe; color: #0288d1; }
.badge.completed { background: #e8f5e9; color: #2e7d32; }

.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
.btn.primary { background: #1976d2; color: #fff; }
.btn-sm.success { background: #2e7d32; color: #fff; border: none; padding: 4px 8px; border-radius: 2px; cursor: pointer; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: #fff; padding: 24px; border-radius: 8px; width: 400px; }
.modal form { display: flex; flex-direction: column; gap: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>