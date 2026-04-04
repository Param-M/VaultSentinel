import apiClient from "./client";
import {
  ZombieAPI, Alert, DashboardStats, HoneypotHit,
  QuarantinedEndpoint, OWASPResult
} from "../types/api.types";

// ─── APIs ────────────────────────────────────────────────────────────────────

export const getAPIs = async (riskClass?: string): Promise<ZombieAPI[]> => {
  const { data } = await apiClient.get("/apis", { params: riskClass ? { risk_class: riskClass } : {} });
  return data;
};

export const getStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get("/apis/stats");
  return data;
};

export const triggerScan = async (scanType = "full") => {
  const { data } = await apiClient.post("/apis/scan", { scan_type: scanType });
  return data;
};

export const patchEndpoint = async (id: number, payload: { owner_team?: string; service_name?: string }) => {
  const { data } = await apiClient.patch(`/apis/${id}`, payload);
  return data;
};

export const explainEndpoint = async (id: number): Promise<{ endpoint: string; summary: string }> => {
  const { data } = await apiClient.get(`/apis/${id}/explain`);
  return data;
};

// ─── Alerts ──────────────────────────────────────────────────────────────────

export const getAlerts = async (unreadOnly = false): Promise<Alert[]> => {
  const { data } = await apiClient.get("/alerts", { params: { unread_only: unreadOnly } });
  return data;
};

export const markAlertRead = async (id: number) => {
  await apiClient.post(`/alerts/${id}/read`);
};

// ─── Quarantine ──────────────────────────────────────────────────────────────

export const getQuarantined = async (): Promise<QuarantinedEndpoint[]> => {
  const { data } = await apiClient.get("/quarantine");
  return data;
};

export const quarantineEndpoint = async (endpoint: string, reason?: string) => {
  const { data } = await apiClient.post("/quarantine", { endpoint, reason });
  return data;
};

export const unquarantineEndpoint = async (endpoint: string) => {
  const clean = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const { data } = await apiClient.delete(`/quarantine/${clean}`);
  return data;
};

// ─── Honeypot ────────────────────────────────────────────────────────────────

export const deployHoneypot = async (targetEndpoint: string) => {
  const { data } = await apiClient.post("/honeypot/deploy", { target_endpoint: targetEndpoint });
  return data;
};

export const getHoneypotHits = async (): Promise<HoneypotHit[]> => {
  const { data } = await apiClient.get("/honeypot/hits");
  return data;
};

export const getHoneypotStats = async () => {
  const { data } = await apiClient.get("/honeypot/stats");
  return data;
};

// ─── OWASP ───────────────────────────────────────────────────────────────────

export const runOWASPScan = async (endpointId: number) => {
  const { data } = await apiClient.post(`/owasp/scan/${endpointId}`);
  return data;
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const downloadReport = async (type: "rbi" | "pci") => {
  const response = await apiClient.get(`/reports/${type}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `VaultSentinel_${type.toUpperCase()}_Report.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};
