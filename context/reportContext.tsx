import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { reportService } from "../service/reportService";
import { IReport } from "../types/reports";

// Interface para o contexto de reportes
interface ReportContextType {
  reports: IReport[];
  loading: boolean;
  error: string | null;
  addReport: (
    report: Omit<IReport, "idr" | "idusuario" | "data"> & { horario?: string }
  ) => Promise<void>;
}

// Contexto de reportes
const ReportsContext = createContext<ReportContextType>({} as ReportContextType);

// Hook para usar o contexto de reportes
export const useReports = () => useContext(ReportsContext);

// Provider para o contexto de reportes
export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar um novo reporte
  const addReport = useCallback(
    async (
      report: Omit<IReport, "idr" | "idusuario" | "data"> & { horario?: string }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const newReport = await reportService.create(report);
        setReports((prev) => [newReport, ...prev]);
      } catch (err: any) {
        // Log de erro detalhado
        setError(err?.response?.data?.message || "Erro ao criar reporte");
        console.log("Data:", err.response?.data);
        console.log("Status:", err.response?.status);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Retornar contexto de reportes
  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        error,
        addReport
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};
