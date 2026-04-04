import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, markAlertRead } from "../../api/endpoints";
import { Bell, AlertTriangle, Wifi, WifiOff, Loader2, ChevronRight } from "lucide-react";
import { Alert } from "../../types/api.types";
import { useNavigate } from "react-router-dom";
import { useWS } from "../../context/WebSocketContext";

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/30",
  HIGH:     "text-orange-400 bg-orange-400/10 border-orange-400/30",
  MEDIUM:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  LOW:      "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

function WSIndicator() {
  const { wsStatus, lastEvent } = useWS();

  const config = {
    connected:    { icon: Wifi,    color: "text-green-400",  bg: "bg-green-400/5  border-green-400/20",  label: "Live" },
    connecting:   { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-400/5 border-yellow-400/20", label: "Connecting..." },
    disconnected: { icon: WifiOff, color: "text-[#475569]",  bg: "bg-white/5      border-[#0d2040]",     label: "Disconnected" },
    error:        { icon: WifiOff, color: "text-red-400",    bg: "bg-red-400/5    border-red-400/20",    label: "WS Error" },
  }[wsStatus];

  const Icon = config.icon;
  const isScanning = lastEvent?.type === "SCAN_COMPLETE";

  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono transition-all ${config.bg}`}>
      <Icon className={`w-3 h-3 ${config.color} ${wsStatus === "connecting" ? "animate-spin" : ""}`} />
      <span className={config.color}>
        {isScanning ? "SCAN DONE" : config.label}
      </span>
      {wsStatus === "connected" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      )}
    </div>
  );
}

export function TopBar({ title }: { title: string }) {
  const [showAlerts, setShowAlerts] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Fallback polling — WebSocket handles most updates but this catches anything missed
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(true),
    refetchInterval: 30000, // 30s fallback — WS handles realtime
  });

  const unread = (alerts as Alert[]).filter((a) => !a.is_read).length;

  const readMutation = useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <header className="h-14 bg-[#080e1d]/90 backdrop-blur border-b border-[#0d2040] px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-white font-semibold tracking-wide">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Real WebSocket status badge */}
        <WSIndicator />

        {/* Alert bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#475569] hover:text-[#94a3b8] transition-all"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showAlerts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
              <div className="absolute right-0 top-11 bg-[#080e1d] border border-[#0d2040] rounded-xl shadow-2xl z-50 overflow-hidden" style={{ width: 360 }}>
                <div className="px-4 py-3 border-b border-[#0d2040] flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">Alerts</p>
                  <button
                    onClick={() => { setShowAlerts(false); navigate("/dashboard/alerts"); }}
                    className="text-[#0066cc] text-xs hover:text-[#00d4ff] flex items-center gap-0.5"
                  >
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#0d2040]">
                  {(alerts as Alert[]).length === 0 ? (
                    <p className="text-[#64748b] text-xs px-4 py-6 text-center">No unread alerts</p>
                  ) : (
                    (alerts as Alert[]).slice(0, 8).map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => readMutation.mutate(alert.id)}
                        className="px-4 py-3 hover:bg-white/[0.02] cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            alert.severity === "CRITICAL" ? "text-red-400" :
                            alert.severity === "HIGH"     ? "text-orange-400" : "text-yellow-400"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#94a3b8] text-xs leading-snug line-clamp-2">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] px-1 py-0.5 rounded border font-bold ${SEVERITY_COLOR[alert.severity]}`}>
                                {alert.severity}
                              </span>
                              <span className="text-[#475569] text-[10px]">
                                {new Date(alert.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
