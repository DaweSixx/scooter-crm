// frontend/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import 'leaflet/dist/leaflet.css'; // <--- Добавьте сюда
import App from './App.vue';

import Dashboard from './views/Dashboard.vue';
import Scooters from './views/Scooters.vue';
import Rentals from './views/Rentals.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/scooters', component: Scooters },
  { path: '/rentals', component: Rentals },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');