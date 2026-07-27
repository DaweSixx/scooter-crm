import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

export interface Scooter {
  id: number;
  code: string;
  model: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  batteryLevel: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export const useScooterStore = defineStore('scooters', {
  state: () => ({
    scooters: [] as Scooter[],
    analytics: null as any,
  }),
  actions: {
    async fetchScooters() {
      const res = await axios.get(`${API_URL}/scooters`);
      this.scooters = res.data;
    },
    async fetchAnalytics() {
      const res = await axios.get(`${API_URL}/analytics`);
      this.analytics = res.data;
    },
    setupWebSocket() {
      socket.on('scooter_updated', (updatedScooter: Scooter) => {
        const index = this.scooters.findIndex(s => s.id === updatedScooter.id);
        if (index !== -1) {
          this.scooters[index] = updatedScooter;
        } else {
          this.scooters.push(updatedScooter);
        }
        this.fetchAnalytics();
      });

      socket.on('scooter_deleted', (id: string) => {
        this.scooters = this.scooters.filter(s => s.id !== Number(id));
        this.fetchAnalytics();
      });
    }
  }
});