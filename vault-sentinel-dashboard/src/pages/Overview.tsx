import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStats, getAPIs, getAlerts, quarantineEndpoint, deployHoneypot, explainEndpoint, triggerScan } from "../api/endpoints";
import { ZombieAPI, DashboardStats, Alert } from "../types/api.types";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  Shield, Activity, AlertTriangle, Skull, Eye, Lock,
  Clock, Zap, TrendingUp, RefreshCw, ChevronRight,
  Sparkles, X, Info, CheckCircle, Radio
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e", DORMANT: "#f59e0b", ZOMBIE: "#f97316", GHOST: "#ef4444",
};
const RISK_BG: Record<string, string> = {
  ACTIVE:  "bg-green-500/10 text-green-400 border-green-500/30",
  DORMANT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ZOMBIE:  "bg-orange-500/10 text-orange-400 border-orange-500/30",
  GHOST:   "bg-red-500/10 text-red-400 border-red-500/30",
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "blue", delta }: any) {
  const colorMap: Record<string, string> = {
    blue:   "border-[#0066cc]/30 bg-[#0066cc]/5",
    red:    "border-red-500/30   bg-red-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    green:  "border-green-500/30 bg-green-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
  };
  const iconColor: Record<string, string> = {
    blue: "text-[#00d4ff]", red: "text-red-400", orange: "text-orange-400",
    green: "text-green-400", yellow: "text-yellow-400",
  };
  return (
    <div className={`bg-[#080e1d] border rounded-xl p-5 flex flex-col gap-2 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[#64748b] text-xs font-mono uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${iconColor[color]}`} />
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold ${iconColor[color]}`}>{value ?? "--"}</p>
        {delta !== undefined && (
          <span className={`text-xs mb-1 ${delta > 0 ? "text-red-400" : "text-green-400"}`}>
            {delta > 0 ? `+${delta}` : delta} vs last
          </span>
        )}
      </div>
      {sub && <p className="text-[#475569] text-[11px]">{sub}</p>}
    </div>
  );
}

// ── AI Summary drawer ─────────────────────────────────────────────────────────
function AISummaryDrawer({ api, onClose }: { api: ZombieAPI; onClose: () => void }) {
  const [summary, setSummary] = useState(api.gemini_summary || "");
  const [loading, setLoading] = useState(!api.gemini_summary);
  const qc = useQueryClient();

  useState(() => {
    if (!api.gemini_summary) {
      explainEndpoint(api.id).then((r) => {
        setSummary(r.summary);
        setLoading(false);
        qc.invalidateQueries({ queryKey: ["apis"] });
      }).catch(() => setLoading(false));
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#080e1d] border border-[#0d2040] rounded-2xl w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00d4ff]" />
            <p className="text-white font-semibold text-sm">Gemini AI Risk Summary</p>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#0a1628] rounded-lg border border-[#0d2040]">
          <p className="text-[#475569] text-[10px] font-mono mb-1">ENDPOINT</p>
          <p className="text-[#94a3b8] text-xs font-mono truncate">{api.endpoint}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${RISK_BG[api.risk_class]}`}>
              {api.risk_class}
            </span>
            <span className="text-white text-xs font-bold">{api.risk_score.toFixed(0)}/100</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-6 justify-center">
            <Sparkles className="w-5 h-5 text-[#0066cc] animate-pulse" />
            <p className="text-[#64748b] text-sm">Generating AI analysis...</p>
          </div>
        ) : (
          <p className="text-[#94a3b8] text-sm leading-relaxed">{summary}</p>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function OverviewPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedAPI, setSelectedAPI] = useState<ZombieAPI | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  // Auto-refresh every 15 seconds — picks up scheduler scans automatically
  const { data: stats, dataUpdatedAt } = useQuery<DashboardStats>({
    queryKey: ["stats"], queryFn: getStats, refetchInterval: 15000,
  });
  const { data: apis = [], isFetching } = useQuery<ZombieAPI[]>({
    queryKey: ["apis"], queryFn: () => getAPIs(),
    refetchInterval: 15000,
  });
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["alerts"], queryFn: () => getAlerts(true), refetchInterval: 15000,
  });

  const manualScanMut = useMutation({
    mutationFn: () => triggerScan("full"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apis"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
  const quarantineMut = useMutation({
    mutationFn: (ep: string) => quarantineEndpoint(ep, "Manual quarantine"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apis"] }),
  });

  const filtered = filter === "ALL" ? apis : apis.filter((a) => a.risk_class === filter);
  const sorted = [...filtered].sort((a, b) => b.risk_score - a.risk_score).slice(0, 15);

  const pieData = stats ? [
    { name: "Active",  value: stats.active_count,  color: "#22c55e" },
    { name: "Dormant", value: stats.dormant_count,  color: "#f59e0b" },
    { name: "Zombie",  value: stats.zombie_count,   color: "#f97316" },
    { name: "Ghost",   value: stats.ghost_count,    color: "#ef4444" },
  ].filter(d => d.value > 0) : [];

  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "--";

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{user?.bank_name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isFetching ? "bg-[#0066cc] animate-pulse" : "bg-green-400"}`} />
            <p className="text-[#475569] text-xs">
              {isFetching ? "Syncing..." : `Live — refreshed ${lastRefresh}`}
            </p>
            {stats?.last_scan && (
              <>
                <span className="text-[#1e3a5f]">·</span>
                <Clock className="w-3 h-3 text-[#475569]" />
                <p className="text-[#475569] text-xs">
                  Last scan: {new Date(stats.last_scan).toLocaleTimeString()}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066cc]/5 border border-[#0066cc]/20 rounded-lg">
            <Radio className="w-3 h-3 text-[#0066cc] animate-pulse" />
            <span className="text-[#64748b] text-xs">Auto-scan every 5 min</span>
          </div>
          <button
            onClick={() => manualScanMut.mutate()}
            disabled={manualScanMut.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066cc]/10 hover:bg-[#0066cc]/20 border border-[#0066cc]/30 text-[#00d4ff] rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${manualScanMut.isPending ? "animate-spin" : ""}`} />
            {manualScanMut.isPending ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Activity}      label="Total APIs"         value={stats?.total_apis}       color="blue"   sub="Discovered & tracked" />
        <StatCard icon={CheckCircle}   label="Active"             value={stats?.active_count}     color="green"  sub="Safe endpoints" />
        <StatCard icon={AlertTriangle} label="Zombies"            value={stats?.zombie_count}     color="orange" sub="Need review" />
        <StatCard icon={Skull}         label="Ghost (Auto-blocked)" value={stats?.ghost_count}    color="red"    sub="Quarantined" />
        <StatCard icon={Shield}        label="Honeypot Hits Today" value={stats?.honeypot_hits_today} color="yellow" sub="Attackers caught" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5">
          <p className="text-[#94a3b8] text-sm font-semibold mb-3">Risk Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" strokeWidth={0}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#080e1d", border: "1px solid #0d2040", borderRadius: 8 }} itemStyle={{ color: "#e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[#475569] text-[10px]">{d.name}: <b className="text-white">{d.value}</b></span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance score */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5 flex flex-col justify-between">
          <p className="text-[#94a3b8] text-sm font-semibold">Compliance Score</p>
          <div className="flex items-center justify-center flex-1 py-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#0d2040" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={
                    (stats?.compliance_score ?? 100) >= 80 ? "#22c55e" :
                    (stats?.compliance_score ?? 100) >= 60 ? "#f59e0b" : "#ef4444"
                  }
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats?.compliance_score ?? 100) / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`text-2xl font-bold ${
                  (stats?.compliance_score ?? 100) >= 80 ? "text-green-400" :
                  (stats?.compliance_score ?? 100) >= 60 ? "text-yellow-400" : "text-red-400"
                }`}>{stats?.compliance_score ?? "--"}%</p>
                <p className="text-[#475569] text-[9px] font-mono">SCORE</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Avg Risk Score",  value: `${stats?.avg_risk_score ?? "--"}/100` },
              { label: "Quarantined",     value: stats?.quarantined_count ?? "--" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[#475569] text-[11px]">{label}</span>
                <span className="text-white text-[11px] font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live alerts feed */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#0d2040] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              <p className="text-[#94a3b8] text-sm font-semibold">Live Alerts</p>
            </div>
            <span className="text-[#475569] text-[10px]">{alerts.length} unread</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-52 divide-y divide-[#0d2040]/50">
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-[#1e3a5f] text-xs">No new alerts</p>
              </div>
            ) : (
              alerts.slice(0, 6).map((a: Alert) => (
                <div key={a.id} className="px-4 py-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${
                      a.severity === "CRITICAL" ? "text-red-400" :
                      a.severity === "HIGH"     ? "text-orange-400" : "text-yellow-400"
                    }`} />
                    <div>
                      <p className="text-[#94a3b8] text-[10px] leading-snug line-clamp-2">{a.message}</p>
                      <p className="text-[#1e3a5f] text-[9px] mt-0.5">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* API inventory table */}
      <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#0d2040] flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[#94a3b8] text-sm font-semibold">API Inventory</p>
          {/* Filter pills */}
          <div className="flex items-center gap-1.5">
            {["ALL", "GHOST", "ZOMBIE", "DORMANT", "ACTIVE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  filter === f
                    ? f === "ALL"    ? "bg-[#0066cc]/20 border-[#0066cc]/50 text-[#00d4ff]"
                    : f === "GHOST"  ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : f === "ZOMBIE" ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                    : f === "DORMANT"? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-transparent border-[#0d2040] text-[#475569] hover:border-[#1e3a5f]"
                }`}
              >
                {f}
                {f !== "ALL" && stats && (
                  <span className="ml-1 opacity-70">
                    {f === "GHOST"   ? stats.ghost_count :
                     f === "ZOMBIE"  ? stats.zombie_count :
                     f === "DORMANT" ? stats.dormant_count :
                     stats.active_count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <span className="text-[#475569] text-xs ml-auto">{filtered.length} endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#0d2040]">
                {["Endpoint", "Method", "Risk Score", "Class", "Auth", "Inactive", "CVEs", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[#475569] text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d2040]/40">
              {sorted.map((api) => (
                <tr key={api.id} className="hover:bg-white/[0.015] transition-colors group">
                  <td className="px-4 py-2.5 max-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      {!api.is_documented && <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" title="Undocumented" />}
                      {api.resurrection_detected && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0 animate-pulse" title="Resurrection detected" />}
                      <span className="text-[#94a3b8] font-mono text-[11px] truncate">{api.endpoint}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[#475569] text-[10px] font-mono">{api.method}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1 bg-[#0d2040] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${api.risk_score}%`, background: RISK_COLORS[api.risk_class] }} />
                      </div>
                      <span className="text-white text-[11px] font-bold w-6">{api.risk_score.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${RISK_BG[api.risk_class]}`}>
                      {api.risk_class}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-mono ${api.auth_type === "none" ? "text-red-400 font-bold" : "text-[#64748b]"}`}>
                      {api.auth_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] ${api.inactive_days > 90 ? "text-orange-400" : "text-[#64748b]"}`}>
                      {api.inactive_days}d
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] ${api.cve_count > 0 ? "text-red-400 font-bold" : "text-[#1e3a5f]"}`}>
                      {api.cve_count || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      {/* Gemini explain */}
                      <button
                        onClick={() => setSelectedAPI(api)}
                        className="p-1 rounded hover:bg-[#0066cc]/10 text-[#1e3a5f] hover:text-[#00d4ff] transition-colors"
                        title="AI Summary"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                      {/* Quarantine */}
                      {!api.is_quarantined ? (
                        <button
                          onClick={() => quarantineMut.mutate(api.endpoint)}
                          className="p-1 rounded hover:bg-red-400/10 text-[#1e3a5f] hover:text-red-400 transition-colors"
                          title="Quarantine"
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[9px] text-red-400 font-mono px-1">BLOCKED</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Activity className="w-8 h-8 text-[#1e3a5f] mx-auto mb-3" />
              <p className="text-[#475569] text-sm">
                {apis.length === 0
                  ? "No APIs scanned yet — auto-scan runs every 5 minutes, or click Scan Now."
                  : `No ${filter} endpoints found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI drawer */}
      {selectedAPI && <AISummaryDrawer api={selectedAPI} onClose={() => setSelectedAPI(null)} />}
    </div>
  );
}
