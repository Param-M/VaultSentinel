import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuarantined, unquarantineEndpoint, quarantineEndpoint } from "../api/endpoints";
import { getAPIs } from "../api/endpoints";
import { QuarantinedEndpoint, ZombieAPI } from "../types/api.types";
import { Lock, Unlock, Shield, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

export function QuarantinePage() {
  const qc = useQueryClient();
  const [manualEndpoint, setManualEndpoint] = useState("");

  const { data: quarantined = [], isLoading } = useQuery<QuarantinedEndpoint[]>({
    queryKey: ["quarantined"],
    queryFn: getQuarantined,
    refetchInterval: 5000,
  });

  const { data: apis = [] } = useQuery<ZombieAPI[]>({ queryKey: ["apis"], queryFn: () => getAPIs() });
  const highRisk = apis.filter((a) => !a.is_quarantined && a.risk_score >= 61);

  const unblockMut = useMutation({
    mutationFn: unquarantineEndpoint,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quarantined"] }),
  });

  const blockMut = useMutation({
    mutationFn: (ep: string) => quarantineEndpoint(ep, "Manual quarantine"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quarantined"] });
      qc.invalidateQueries({ queryKey: ["apis"] });
      setManualEndpoint("");
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Quarantined Endpoints", value: quarantined.length, color: "text-red-400" },
          { label: "Avg Block Time", value: "0.3s", color: "text-[#00d4ff]" },
          { label: "High Risk Awaiting", value: highRisk.length, color: "text-orange-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5">
            <p className="text-[#64748b] text-xs font-mono uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active quarantine list */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040] flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            <p className="text-[#94a3b8] text-sm font-semibold">Active Quarantine — Redis Blocklist</p>
          </div>

          {/* Manual quarantine input */}
          <div className="px-5 py-3 border-b border-[#0d2040] flex gap-2">
            <input
              type="text"
              value={manualEndpoint}
              onChange={(e) => setManualEndpoint(e.target.value)}
              placeholder="/api/v0/endpoint"
              className="flex-1 bg-[#0a1628] border border-[#0d2040] text-[#94a3b8] rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#0066cc]"
            />
            <button
              onClick={() => manualEndpoint && blockMut.mutate(manualEndpoint)}
              disabled={blockMut.isPending || !manualEndpoint}
              className="flex items-center gap-1 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-all"
            >
              {blockMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Block
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#0d2040]/50">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#0066cc] animate-spin" />
              </div>
            ) : quarantined.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Shield className="w-8 h-8 text-[#1e3a5f]" />
                <p className="text-[#475569] text-sm">No endpoints quarantined</p>
              </div>
            ) : (
              quarantined.map((q) => (
                <div key={q.endpoint} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-red-400 text-xs font-mono truncate">{q.endpoint}</p>
                    <p className="text-[#475569] text-[10px] mt-0.5 truncate">{q.reason}</p>
                    {q.blocked_at && (
                      <p className="text-[#1e3a5f] text-[10px]">
                        Blocked {new Date(q.blocked_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => unblockMut.mutate(q.endpoint)}
                    disabled={unblockMut.isPending}
                    className="p-1.5 rounded-lg hover:bg-green-400/10 text-[#475569] hover:text-green-400 transition-colors shrink-0"
                    title="Unquarantine"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High risk awaiting quarantine */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040] flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <p className="text-[#94a3b8] text-sm font-semibold">High Risk — Requires Action</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[#0d2040]/50">
            {highRisk.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <p className="text-[#475569] text-sm">All high-risk endpoints are quarantined ✓</p>
              </div>
            ) : (
              highRisk.map((api) => (
                <div key={api.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#94a3b8] text-xs font-mono truncate">{api.endpoint}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-1 bg-[#0d2040] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${api.risk_score}%`,
                            background: api.risk_score >= 86 ? "#ef4444" : "#f97316",
                          }}
                        />
                      </div>
                      <span className="text-white text-[10px] font-bold">{api.risk_score.toFixed(0)}/100</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        api.risk_class === "GHOST" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                      }`}>{api.risk_class}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => blockMut.mutate(api.endpoint)}
                    disabled={blockMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-all shrink-0"
                  >
                    <Lock className="w-3 h-3" />
                    Block
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
