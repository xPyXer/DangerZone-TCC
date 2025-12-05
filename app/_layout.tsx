import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/authContext';
import { ReportsProvider } from '../context/reportContext';
import { HeatmapProvider } from '@/context/HeatmapContext';


export default function RootLayout() {
  return (
    /* SafeAreaProvider para garantir que o conteúdo não fique cortado
     AuthProvider para garantir que o usuário esteja autenticado
     ReportsProvider para garantir que os reportes estejam disponíveis
     HeatmapProvider para garantir que o heatmap esteja disponível
     Stack para garantir que as telas estejam organizadas  */
    <SafeAreaProvider>
      <AuthProvider>
        <ReportsProvider>
          <HeatmapProvider>
            <Stack
              screenOptions={{
                headerShown: false, 
                contentStyle: { backgroundColor: '#fff' },
              }}
              >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </HeatmapProvider>
        </ReportsProvider>
       </AuthProvider>
    </SafeAreaProvider>
  );
}
