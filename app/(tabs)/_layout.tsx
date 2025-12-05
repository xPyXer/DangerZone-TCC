import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { HeatmapProvider } from '@/context/HeatmapContext';
// Configuração de Layout das abas
export default function TabsLayout() {
  return (
    <HeatmapProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 80, // 🔹 aumenta área de toque
            paddingBottom: 20, // 🔹 afasta do gesto do sistema
            paddingTop: 10,
            marginHorizontal: 20,
            marginBottom: 20, // 🔹 flutua um pouco acima
            borderRadius: 20,
            elevation: 5, // sombra Android
          },
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        {/* Tela de mapa */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ size }) => (
              <MaterialIcons name="map" size={size} color='#2196F3FF' />
            ),
          }}
        />
        {/* Tela de reportar */}
        <Tabs.Screen
          name="make-report"
          options={{
            title: 'Reportar',
            tabBarIcon: ({ size }) => (
              <MaterialIcons name="add-circle" size={size + 6} color='#2196F3FF' />
            ),
          }}
        />
        {/* Tela de perfil */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ size }) => (
              <MaterialIcons name="person" size={size} color='#2196F3FF' />
            ),
          }}
        />
      </Tabs>
    </HeatmapProvider>
  );
}
