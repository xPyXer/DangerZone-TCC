import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api from "../api/api";
import { userService } from "../service/userServices";
import { IUser } from "../types/User";

// Interface para o contexto de autenticação
interface AuthContextType {
  user: IUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newEmail?: string, newFullName?: string) => Promise<void>;
  loading: boolean;
}

// Contexto de autenticação
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Hook para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provider para o contexto de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar token e usuário ao iniciar aplicativo
  useEffect(() => {
  const loadData = async () => {
    try {
      // Apenas removendo token e usuário ao iniciar
      await AsyncStorage.removeItem("@floodzone:token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } catch (err) {
      console.error("Erro ao limpar autenticação inicial:", err);
    } finally {
      setLoading(false);  
    }
  };

  loadData();
  }, []);

  // Fazer login
  const login = async (email: string, password: string) => {
    const { token } = await userService.login({ email, password });

    // Adicionar token ao headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Salvar token no AsyncStorage
    await AsyncStorage.setItem("@floodzone:token", token);

    const userData = await userService.getCurrentUser();
    setUser(userData);
  };

  // Registrar um novo usuário
  const register = async (email: string, fullName: string, password: string) => {
    const { token } = await userService.register({ email, fullName, password });

    // Adicionar token ao headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Salvar token no AsyncStorage
    await AsyncStorage.setItem("@floodzone:token", token);
    // Buscar usuário atual

    const userData = await userService.getCurrentUser();
    setUser(userData);
  };

  // Fazer logout
  const logout = async () => {
    try {
      // Remover token do AsyncStorage
      await AsyncStorage.removeItem("@floodzone:token");
      // Remover token dos headers
      delete api.defaults.headers.common["Authorization"];
      // Limpar usuário
      setUser(null);
      // Redirecionar para a tela de login
      router.replace("/login");
    } catch (err) {
      // Log de erro detalhado
      console.error("Erro ao deslogar:", err);
    }
  };

  // Atualizar dados do usuário
  const updateUser = async (newEmail?: string, newFullName?: string) => {
    const updatedUser = await userService.updateUser({ newEmail, newFullName });
    // Atualizar usuário
    setUser(updatedUser);
    // Salvar dados do usuário no AsyncStorage
    await AsyncStorage.setItem("@floodzone:user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
