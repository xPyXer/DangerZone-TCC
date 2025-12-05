// Interface para manipulação de dados de reportes para api
export interface IReport {
  idr: number;
  idusuario?: number;
  pais?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  cep?: string;
  data?: string;
  horario?: string;
  latitude: number;
  longitude: number;
  crimeType: string;
  anonymous?: boolean;
  descricao?: string;
}

// Interface para tipos de incidentes
export interface IncidentType {
  id: string;
  label: string;
  value: string;
}

// Tipos de incidentes
export const INCIDENT_TYPES: IncidentType[] = [
  { id: '1', label: 'Latrocinio', value: 'Latrocinio' },
  { id: '2', label: 'Homicídio', value: 'Homicídio' },
  { id: '3', label: 'Assalto', value: 'Assalto' },
  { id: '4', label: 'Furto', value: 'Furto' },
  { id: '5', label: 'Vandalismo', value: 'vandalismo' },
];
