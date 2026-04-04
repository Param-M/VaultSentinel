import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadReport } from "../api/endpoints";
import { getAlerts, markAlertRead } from "../api/endpoints";
import { Alert } from "../types/api.types";
import { FileCheck, Download, Loader2, Shield, CheckCircle, AlertTriangle, Bell, Check } from "lucide-react";

const RBI_CONTROLS = [
  { id: "RBI-IT-1.1", name: "API Inventory Management", desc: "Complete inventory of all API endpoints" },
  { id: "RBI-IT-2.3", name: "Access Control", desc: "Strong authentication for all financial APIs" },
  { id: "RBI-IT-3.1", name: "Vulnerability Management", desc: "Regular CVE scanning" },
  { id: "RBI-IT-4.2", name: "Incident Response", desc: "Auto-quarantine within 5 minutes" },
  { id: "RBI-IT-5.1", name: "Audit Logging", desc: "Complete API access audit trail" },
  { id: "RBI-IT-6.3", name: "Data Protection", desc: "Encryption in transit and at rest" },
];

const PCI_CONTROLS = [
  { id: "PCI-DSS 6.3", name: "Vulnerability Identification", desc: "Identify vulnerabilities in bespoke software" },
  { id: "PCI-DSS 6.4", name: "Public-Facing Apps", desc: "Protect web-facing applications" },
  { id: "PCI-DSS 8.2", name: "User Identification", desc: "Unique authentication for all users" },
  { id: "PCI-DSS 10.2", name: "Audit Logs", desc: "Implement audit logs for event reconstruction" },
  { id: "PCI-DSS 11.3", name: "Penetration Testing", desc: "Implement pen testing methodology" },
  { id: "PCI-DSS 12.3", name: "Risk Assessment", desc: "Annual risk assessment of cardholder data" },
];

export function CompliancePage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(type: "rbi" | "pci") {
    setDownloading(type);
    try {
      await downloadReport(type);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { type: "rbi" as const, title: "RBI IT Framework 2021", controls: RBI_CONTROLS, color: "border-blue-500/30" },
          { type: "pci" as const, title: "PCI-DSS v4.0", controls: PCI_CONTROLS, color: "border-purple-500/30" },
        ].map(({ type, title, controls, color }) => (
          <div key={type} className={`bg-[#080e1d] border ${color} rounded-xl overflow-hidden`}>
            <div className="px-5 py-4 border-b border-[#0d2040] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#00d4ff]" />
                <p className="text-[#94a3b8] text-sm font-semibold">{title}</p>
              </div>
              <button
                onClick={() => handleDownload(type)}
                disabled={!!downloading}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0066cc]/10 border border-[#0066cc]/30 text-[#00d4ff] rounded-lg text-xs font-semibold hover:bg-[#0066cc]/20 disabled:opacity-50 transition-all"
              >
                {downloading === type ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export PDF
              </button>
            </div>
            <div className="divide-y divide-[#0d2040]/50">
              {controls.map((ctrl) => (
                <div key={ctrl.id} className="px-5 py-3 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#475569] text-[10px] font-mono">{ctrl.id}</span>
                      <span className="text-[#94a3b8] text-xs">{ctrl.name}</span>
                    </div>
                    <p className="text-[#475569] text-[10px] mt-0.5">{ctrl.desc}</p>
                  </div>
                  <span className="text-[9px] bg-green-500/10 border border-green-500/30 text-green-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                    COMPLIANT
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts Page ─────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/30",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  LOW: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export function AlertsPage() {
  const qc = useQueryClient();
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["all-alerts"],
    queryFn: () => getAlerts(false),
    refetchInterval: 15000,
  });

  const readMut = useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-alerts"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00d4ff]" />
          <p className="text-[#94a3b8] text-sm font-semibold">{alerts.length} Alerts</p>
        </div>
        <span className="text-[#475569] text-xs">{alerts.filter((a) => !a.is_read).length} unread</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#0066cc] animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl flex flex-col items-center py-16 gap-3">
          <Bell className="w-10 h-10 text-[#1e3a5f]" />
          <p className="text-[#475569] text-sm">No alerts yet. Run a scan to detect zombie APIs.</p>
        </div>
      ) : (
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden divide-y divide-[#0d2040]/50">
          {alerts.map((alert) => (
            <div key={alert.id} className={`px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors ${!alert.is_read ? "border-l-2 border-[#0066cc]" : ""}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                alert.severity === "CRITICAL" ? "text-red-400" :
                alert.severity === "HIGH" ? "text-orange-400" :
                alert.severity === "MEDIUM" ? "text-yellow-400" : "text-blue-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-[#94a3b8] text-sm leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${SEVERITY_STYLE[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[#475569] text-[10px] font-mono">{alert.alert_type}</span>
                  <span className="text-[#1e3a5f] text-[10px]">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              </div>
              {!alert.is_read && (
                <button
                  onClick={() => readMut.mutate(alert.id)}
                  className="p-1.5 rounded hover:bg-green-400/10 text-[#475569] hover:text-green-400 transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
