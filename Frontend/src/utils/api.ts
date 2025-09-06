// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7295/api", // backend URL
});

// attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
