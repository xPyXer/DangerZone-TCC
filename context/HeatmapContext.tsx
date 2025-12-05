import React, { createContext, useContext, useState, useCallback } from "react";
import { reportService } from "../service/reportService";

// Interface para manipulação de dados do heatmap
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight?: number;
}

// Interface para o contexto do heatmap
interface HeatmapContextType {
  heatmapData: HeatmapPoint[];
  loading: boolean;
  error: string | null;
  fetchData: (latitude?: number, longitude?: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Contexto do heatmap
const HeatmapContext = createContext<HeatmapContextType | undefined>(undefined);

// Provider para o contexto do heatmap
export const HeatmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (latitude?: number, longitude?: number) => {
    // Carregar dados
    setLoading(true);
    // Limpar erro
    setError(null);
    // Buscar dados do heatmap
    try {
      console.log('Buscando heatmap para:', { latitude, longitude });
      const data = await reportService.getHeatmap(latitude ?? 0, longitude ?? 0);
      console.log('Dados do heatmap recebidos:', data);
      // Validar dados
      const validatedData = (Array.isArray(data) ? data : [])
      .filter(
        (p) =>
          p &&
          typeof (p.latitude ?? p.lat) === "number" &&
          typeof (p.longitude ?? p.lng) === "number" &&
          !isNaN(p.latitude ?? p.lat) &&
          !isNaN(p.longitude ?? p.lng)
      )
      .map((p) => ({
        latitude: Number(p.latitude ?? p.lat),
        longitude: Number(p.longitude ?? p.lng),
        weight: p.weight ?? p.count ?? 1,
      }));
      console.log('Dados validados do heatmap:', validatedData.length, 'pontos');
      setHeatmapData(validatedData);
    } catch (err: any) {
      console.error('Erro ao buscar heatmap:', err.response?.data || err.message);
      setError("Erro ao carregar dados do mapa de calor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar dados do heatmap
  const refreshData = useCallback(() => fetchData(), [fetchData]);

  // Retornar contexto do heatmap
  return (
    <HeatmapContext.Provider value={{ heatmapData, loading, error, fetchData, refreshData }}>
      {children}
    </HeatmapContext.Provider>
  );
};

// Hook para usar o contexto do heatmap
export const useHeatmap = () => {
  const context = useContext(HeatmapContext);
  // Verificar se o contexto está definido
  if (!context) throw new Error("useHeatmap deve ser usado dentro do HeatmapProvider");
  // Retornar contexto do heatmap
  return context;
};
