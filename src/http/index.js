// src/http/index.js
import axios from "axios";

const BASE_URL = "https://localhost:7143/api";

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials не нужен для JWT в заголовке, но можно оставить, если используете куки
  // withCredentials: true,
});

// Добавляем JWT из localStorage в каждый запрос
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Простая обработка ответов, пробрасываем ошибки дальше
api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default api;
