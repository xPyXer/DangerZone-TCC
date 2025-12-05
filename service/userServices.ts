import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser } from '../types/User';

// Endpoints para o serviço de usuários
const DIRECTORY = '/auth'

const ENDPOINTS = {
  register: DIRECTORY + '/register', 
  login: DIRECTORY + '/login',       
  users: DIRECTORY + '/profile',
  changeData: DIRECTORY + '/change-data',             
};

// Serviço de usuários
export const userService = {
  // Registrar um novo usuário
  async register(payload: { email: string; fullName: string; password: string}): Promise<{ token: string }> {
    try {
      console.log('Registrando usuário em:', ENDPOINTS.register);
      console.log('Payload:', payload);
      const res = await api.post(ENDPOINTS.register, payload);
      console.log('Resposta do registro:', res.data);
      // Salvar token
      const token = res.data.token;
      // Se a resposta contém token, retorna token
      if (token) {
        await AsyncStorage.setItem('@floodzone:token', token);
      }
      // Retornar token
      return { token };
    } catch (error: any) {
      // Log de erro detalhado
      console.error('Erro detalhado no registro:', {
        endpoint: ENDPOINTS.register,
        payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Fazer login
  async login(payload: { email: string; password: string }): Promise<{ token: string }> {
    try {
      console.log('Tentando fazer login em:', ENDPOINTS.login);
      const res = await api.post(ENDPOINTS.login, payload);
      console.log('Resposta do login:', res.data);
      // Salvar token
      const token = res.data.token;
      if (token) {
        await AsyncStorage.setItem('@floodzone:token', token);
      }
      // Retornar token
      return res.data;
    } catch (error: any) {
      // Log de erro detalhado
      console.error('Erro detalhado no login:', {
        endpoint: ENDPOINTS.login,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Fazer logout
  async logout() {
    try {
      await AsyncStorage.removeItem('@floodzone:token');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      throw error;
    }
  },

  // Buscar usuários
  async getUser(): Promise<IUser> {
    try {
      console.log('Buscando usuários em:', ENDPOINTS.users);
      const res = await api.get(ENDPOINTS.users);
      console.log('Resposta do getUser:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Erro detalhado ao buscar usuários:', {
        endpoint: ENDPOINTS.users,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Buscar usuário atual
  async getCurrentUser(): Promise<IUser> {
    try {
      console.log('Buscando usuário atual');
      // Se o endpoint retornar um array, pega o primeiro
      // Se retornar um objeto direto, usa ele
      const res = await api.get(ENDPOINTS.users);
      console.log('Resposta do getCurrentUser:', res.data);
      return res.data;
    } catch (error: any) {
      // Log de erro detalhado
      console.error('Erro detalhado ao buscar usuário atual:', {
        endpoint: ENDPOINTS.users,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Atualizar usuário
  async updateUser(payload: { newEmail?: string; newFullName?: string }): Promise<IUser> {
    try {
      console.log('Atualizando usuário com payload:', payload);
      // Atualizar usuário
      const res = await api.put(ENDPOINTS.changeData, payload);
      console.log('Resposta da atualização:', res.data);
      // Retornar usuário atualizado
      return res.data;
      // Log de erro detalhado
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar usuário:', {
        endpoint: ENDPOINTS.users,
        payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
