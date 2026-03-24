import api from "./api";
import { getErrorMessage } from "../utils/errorHandler";

export interface FraudAlertApi {
  id: number;
  userId: number;
  type: string;
  message: string;
  severity: string;
  status: string;
  createdAt: string;
}

export const fraudAlertService = {
  async getAllAlerts(): Promise<FraudAlertApi[]> {
    try {
      const response = await api.get<{ data: FraudAlertApi[] }>("/fraud-alerts");
      return response.data.data ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch fraud alerts"));
    }
  },

  async resolveAlert(id: number): Promise<FraudAlertApi> {
    try {
      const response = await api.post<{ data: FraudAlertApi }>(`/fraud-alerts/${id}/resolve`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to resolve fraud alert"));
    }
  },

  async dismissAlert(id: number): Promise<FraudAlertApi> {
    try {
      const response = await api.post<{ data: FraudAlertApi }>(`/fraud-alerts/${id}/dismiss`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to dismiss fraud alert"));
    }
  },
};
