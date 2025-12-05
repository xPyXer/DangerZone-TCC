import api from '../api/api';
import { IReport } from '../types/reports';

// Endpoints para o serviço de reportes
const ENDPOINTS = {
  report: '/api/reports',       
  heatmap: '/heatmap', 
};

// Serviço de reportes
export const reportService = {
  // Criar um novo reporte
  async create(report: Omit<IReport, 'idr'|'idusuario'|'data'> & { horario?: string }): Promise<IReport> {
    const res = await api.post(ENDPOINTS.report, report);
    return res.data;
  },

  // Buscar heatmap
  async getHeatmap(latitude: number, longitude: number) {
    try {
      console.log('Chamando endpoint de heatmap:', ENDPOINTS.heatmap, { latitude, longitude, radiusDegrees:0.2 });
      const res = await api.get(ENDPOINTS.heatmap, { params: { latitude, longitude, radiusDegrees: 0.2 }});
      console.log('Resposta do heatmap:', res.data);
      // Verificar se os dados estão em res.data.points ou diretamente em res.data
      return res.data.points || res.data || [];
    } catch (error: any) {
      // Log de erro detalhado
      console.error('Erro no serviço de heatmap:', {
        endpoint: ENDPOINTS.heatmap,
        params: { latitude, longitude, radiusDegress: 0.2},
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
