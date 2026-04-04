import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHoneypotHits, getHoneypotStats, deployHoneypot } from "../api/endpoints";
import { getAPIs } from "../api/endpoints";
import { HoneypotHit, ZombieAPI } from "../types/api.types";
import { Shield, Eye, Target, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function HoneyTrapPage() {
  const qc = useQueryClient();
  const [selectedEndpoint, setSelectedEndpoint] = useState("");

  const { data: hits = [] } = useQuery<HoneypotHit[]>({
    queryKey: ["honeypot-hits"],
    queryFn: getHoneypotHits,
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ["honeypot-stats"],
    queryFn: getHoneypotStats,
    refetchInterval: 10000,
  });

  const { data: apis = [] } = useQuery<ZombieAPI[]>({ queryKey: ["apis"], queryFn: () => getAPIs() });
  const deployable = apis.filter((a) => !a.honeypot_deployed && a.risk_class !== "ACTIVE");

  const deployMut = useMutation({
    mutationFn: deployHoneypot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["honeypot-hits"] });
      qc.invalidateQueries({ queryKey: ["apis"] });
      setSelectedEndpoint("");
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Honeypots", value: stats?.total_honeypots ?? "--" },
          { label: "Total Attackers Caught", value: stats?.total_hits ?? "--" },
          { label: "Hits Today", value: stats?.hits_today ?? "--" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5">
            <p className="text-[#64748b] text-xs font-mono uppercase tracking-wider mb-2">{label}</p>
            <p className="text-3xl font-bold text-[#00d4ff]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deploy panel */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040] flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <p className="text-[#94a3b8] text-sm font-semibold">Deploy Honeypot</p>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-[#64748b] text-xs leading-relaxed">
              Replace a zombie endpoint with a decoy that captures attacker IP, headers, and payload.
              Any request to a honeypot = guaranteed malicious. Zero false positives.
            </p>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full bg-[#0a1628] border border-[#0d2040] text-[#94a3b8] rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#0066cc]"
            >
              <option value="">-- Select a zombie endpoint --</option>
              {deployable.map((a) => (
                <option key={a.id} value={a.endpoint}>{a.endpoint} ({a.risk_class})</option>
              ))}
            </select>
            <button
              onClick={() => selectedEndpoint && deployMut.mutate(selectedEndpoint)}
              disabled={!selectedEndpoint || deployMut.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-yellow-500/20 disabled:opacity-50 transition-all"
            >
              {deployMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Deploy Honeypot
            </button>
          </div>
        </div>

        {/* Captured attackers */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00d4ff]" />
            <p className="text-[#94a3b8] text-sm font-semibold">Captured Attackers</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[#0d2040]/50">
            {hits.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Eye className="w-8 h-8 text-[#1e3a5f]" />
                <p className="text-[#475569] text-sm">No honeypot hits yet</p>
                <p className="text-[#1e3a5f] text-xs">Deploy a honeypot to catch attackers</p>
              </div>
            ) : (
              hits.map((hit) => (
                <div key={hit.id} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-400 text-xs font-mono font-bold">{hit.attacker_ip}</span>
                        <span className="text-[#475569] text-[10px] font-mono">{hit.attacker_method}</span>
                      </div>
                      <p className="text-[#64748b] text-xs font-mono truncate">{hit.honeypot_endpoint}</p>
                      <p className="text-[#1e3a5f] text-[10px] mt-0.5">
                        {new Date(hit.captured_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                      CAPTURED
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
