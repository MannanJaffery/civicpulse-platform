import axios from 'axios';

// The client relies on runtime reverse-proxying via /api to maintain build-once-deploy-many
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
