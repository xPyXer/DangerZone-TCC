import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env";

// Fallback para URL local se API_URL não estiver definida
const API_BASE = API_URL;

// Garantir que a baseURL não tenha /api duplicado
const baseURL = API_BASE.endsWith('')
  ? API_BASE 
  : API_BASE;

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token automaticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@floodzone:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// Inteceptor para log de erros detalhados
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config) {
      console.error('Erro na requisição:', {
        method: error.config.method?.toUpperCase(),
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullURL: `${error.config.baseURL}${error.config.url}`,
        status: error.response?.status,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;