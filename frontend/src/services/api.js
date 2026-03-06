import axios from 'axios';
import { getAccessToken } from './authStorage';

const baseURL = 'https://focas-tube.vercel.app/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
