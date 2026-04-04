import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAPIs, runOWASPScan } from "../api/endpoints";
import { ZombieAPI } from "../types/api.types";
import { Bug, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronDown } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  PASS: "text-green-400 bg-green-400/10 border-green-400/30",
  FAIL: "text-red-400 bg-red-400/10 border-red-400/30",
  WARN: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
};

const STATUS_ICON: Record<string, any> = {
  PASS: CheckCircle,
  FAIL: XCircle,
  WARN: AlertTriangle,
};

export function OWASPPage() {
  const qc = useQueryClient();
  const { data: apis = [] } = useQuery<ZombieAPI[]>({ queryKey: ["apis"], queryFn: () => getAPIs() });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const scanMut = useMutation({
    mutationFn: (id: number) => runOWASPScan(id),
    onSuccess: (data) => setScanResult(data),
  });

  const selected = apis.find((a) => a.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Bug className="w-4 h-4 text-[#00d4ff]" />
          OWASP Top 10 API Security Scanner
        </h2>
        <p className="text-[#64748b] text-xs">Select an endpoint and run all 10 OWASP rules concurrently via asyncio.gather.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint selector */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040]">
            <p className="text-[#94a3b8] text-sm font-semibold">Select Endpoint to Scan</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[#0d2040]/50">
            {apis.map((api) => (
              <div
                key={api.id}
                onClick={() => { setSelectedId(api.id); setScanResult(null); }}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                  selectedId === api.id ? "bg-[#0066cc]/10 border-l-2 border-[#0066cc]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  api.risk_class === "GHOST" ? "bg-red-400" :
                  api.risk_class === "ZOMBIE" ? "bg-orange-400" :
                  api.risk_class === "DORMANT" ? "bg-yellow-400" : "bg-green-400"
                }`} />
                <span className="text-[#94a3b8] text-xs font-mono flex-1 truncate">{api.endpoint}</span>
                <span className="text-[#475569] text-[10px] shrink-0">{api.risk_score.toFixed(0)}/100</span>
              </div>
            ))}
          </div>
          {selectedId && (
            <div className="px-5 py-4 border-t border-[#0d2040]">
              <button
                onClick={() => scanMut.mutate(selectedId)}
                disabled={scanMut.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0055aa] to-[#0066cc] text-white rounded-lg font-semibold text-sm disabled:opacity-50"
              >
                {scanMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Running 10 Rules...</> : "Run OWASP Scan →"}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0d2040] flex items-center justify-between">
            <p className="text-[#94a3b8] text-sm font-semibold">Scan Results</p>
            {scanResult && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-mono">✓{scanResult.pass_count}</span>
                <span className="text-red-400 font-mono">✗{scanResult.fail_count}</span>
                <span className="text-yellow-400 font-mono">⚠{scanResult.warn_count}</span>
              </div>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[#0d2040]/50">
            {!scanResult ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Bug className="w-8 h-8 text-[#1e3a5f]" />
                <p className="text-[#475569] text-sm">Select an endpoint and run scan</p>
              </div>
            ) : (
              scanResult.results.map((r: any) => {
                const Icon = STATUS_ICON[r.status] || AlertTriangle;
                return (
                  <div key={r.rule_id} className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${r.status === "PASS" ? "text-green-400" : r.status === "FAIL" ? "text-red-400" : "text-yellow-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#475569] text-[10px] font-mono">{r.rule_id}</span>
                          <span className="text-[#94a3b8] text-xs font-medium">{r.rule_name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ml-auto shrink-0 ${STATUS_STYLE[r.status]}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[#475569] text-xs leading-relaxed">{r.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
