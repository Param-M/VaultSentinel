import { useState, useRef, useEffect } from "react";
import { Zap, Target, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import { SimulationEvent } from "../types/api.types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STAGE_NAMES = ["Reconnaissance", "Auth Bypass", "Data Exfiltration", "Privilege Escalation", "Persistence"];

const EVENT_COLORS: Record<string, string> = {
  SIMULATION_START: "text-[#00d4ff]",
  STAGE_START: "text-[#94a3b8]",
  STAGE_EVENT: "text-yellow-400",
  STAGE_RESULT: "text-white",
  VAULT_SENTINEL_INTERCEPT: "text-green-400",
  SIMULATION_COMPLETE: "text-[#00d4ff]",
  STAGE_ERROR: "text-red-400",
};

export function SimulationPage() {
  const [targetUrl, setTargetUrl] = useState("http://localhost:8001");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [recordsLeaked, setRecordsLeaked] = useState(0);
  const [vaultBlocked, setVaultBlocked] = useState(false);
  const [complete, setComplete] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  function startSimulation() {
    if (esRef.current) esRef.current.close();

    setEvents([]);
    setCurrentStage(0);
    setRecordsLeaked(0);
    setVaultBlocked(false);
    setComplete(false);
    setIsRunning(true);

    const token = localStorage.getItem("vs_session_token");
    const url = `${API_BASE}/simulation/start`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target_url: targetUrl, attack_type: "full" }),
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const event: SimulationEvent = JSON.parse(line.replace("data: ", ""));
            setEvents((prev) => [...prev, event]);

            if (event.stage_id) setCurrentStage(event.stage_id);
            if (event.records_leaked !== undefined) setRecordsLeaked(event.records_leaked);
            if (event.vault_sentinel_blocked) setVaultBlocked(true);
            if (event.type === "SIMULATION_COMPLETE") {
              setComplete(true);
              setIsRunning(false);
              setRecordsLeaked(event.total_records_leaked ?? 0);
              setVaultBlocked(event.vault_sentinel_blocked ?? false);
            }
          } catch {}
        }
      }
      setIsRunning(false);
    }).catch(() => {
      setIsRunning(false);
      setEvents((prev) => [...prev, {
        type: "STAGE_ERROR",
        message: "Could not connect to simulation service. Ensure the backend is running.",
      }]);
    });
  }

  function stopSimulation() {
    esRef.current?.close();
    setIsRunning(false);
  }

  const damagePercent = vaultBlocked ? 0 : Math.min(100, recordsLeaked * 2);

  return (
    <div className="space-y-6">
      {/* Control panel */}
      <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00d4ff]" />
              Attack Simulation Engine
            </h2>
            <p className="text-[#64748b] text-xs">
              Run a 5-stage real attack against the vulnerable sandbox. Vault Sentinel will intercept in real time.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#475569]" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="http://localhost:8001"
                className="bg-[#0a1628] border border-[#0d2040] text-[#94a3b8] rounded-lg px-3 py-2 text-sm font-mono w-56 outline-none focus:border-[#0066cc]"
              />
            </div>
            <button
              onClick={isRunning ? stopSimulation : startSimulation}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isRunning
                  ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : "bg-gradient-to-r from-[#0055aa] to-[#0066cc] text-white hover:from-[#0066cc] hover:to-[#0077ee]"
              }`}
            >
              {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> Stop</> : <><Zap className="w-4 h-4" /> Launch Attack</>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage progress */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5 space-y-3">
          <p className="text-[#94a3b8] text-sm font-semibold">Attack Stages</p>
          {STAGE_NAMES.map((name, i) => {
            const stageNum = i + 1;
            const done = currentStage > stageNum || (complete && currentStage >= stageNum);
            const active = currentStage === stageNum && isRunning;
            return (
              <div key={name} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                active ? "bg-[#0066cc]/10 border border-[#0066cc]/30" :
                done ? "bg-green-500/5" : "bg-[#0a1628]"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  active ? "bg-[#0066cc] text-white animate-pulse" :
                  done ? "bg-green-500/20 text-green-400" :
                  "bg-[#0d2040] text-[#475569]"
                }`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : stageNum}
                </div>
                <span className={`text-xs font-medium ${active ? "text-white" : done ? "text-[#64748b]" : "text-[#475569]"}`}>
                  {name}
                </span>
                {active && <Loader2 className="w-3 h-3 text-[#0066cc] animate-spin ml-auto" />}
              </div>
            );
          })}
        </div>

        {/* Damage meter + result */}
        <div className="space-y-4">
          <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl p-5">
            <p className="text-[#94a3b8] text-sm font-semibold mb-4">Damage Meter</p>
            <div className="relative">
              <div className="w-full h-4 bg-[#0a1628] rounded-full overflow-hidden border border-[#0d2040]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${damagePercent}%`,
                    background: vaultBlocked
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "linear-gradient(90deg, #f59e0b, #ef4444)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#475569] text-xs">PROTECTED</span>
                <span className="text-[#475569] text-xs">BREACHED</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`text-4xl font-bold ${vaultBlocked ? "text-green-400" : recordsLeaked > 0 ? "text-red-400" : "text-white"}`}>
                {vaultBlocked ? "0" : recordsLeaked}
              </p>
              <p className="text-[#64748b] text-xs mt-1">records leaked</p>
            </div>
          </div>

          {complete && (
            <div className={`rounded-xl p-5 border ${
              vaultBlocked
                ? "bg-green-500/5 border-green-500/30"
                : "bg-red-500/5 border-red-500/30"
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {vaultBlocked
                  ? <Shield className="w-6 h-6 text-green-400" />
                  : <AlertTriangle className="w-6 h-6 text-red-400" />
                }
                <p className={`font-bold text-sm ${vaultBlocked ? "text-green-400" : "text-red-400"}`}>
                  {vaultBlocked ? "ATTACK NEUTRALIZED" : "BREACH SUCCEEDED"}
                </p>
              </div>
              <p className="text-[#64748b] text-xs leading-relaxed">
                {vaultBlocked
                  ? "Vault Sentinel detected the zombie API and quarantined it before data exfiltration could complete. 0 records leaked."
                  : `Attack succeeded. ${recordsLeaked} customer records were exfiltrated. Deploy Vault Sentinel to prevent this.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Live event log */}
        <div className="bg-[#080e1d] border border-[#0d2040] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#0d2040] flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-400 animate-pulse" : "bg-[#1e3a5f]"}`} />
            <p className="text-[#94a3b8] text-sm font-semibold">Live Event Stream</p>
          </div>
          <div ref={logRef} className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-xs max-h-80">
            {events.length === 0 ? (
              <p className="text-[#1e3a5f] text-center py-8">Awaiting simulation launch...</p>
            ) : (
              events.map((ev, i) => (
                <div key={i} className={`${EVENT_COLORS[ev.type] || "text-[#475569]"} leading-relaxed`}>
                  <span className="text-[#1e3a5f]">[{String(i).padStart(3, "0")}] </span>
                  {ev.type === "VAULT_SENTINEL_INTERCEPT" ? "🛡️ " : ""}
                  {ev.message || ev.description || ev.type}
                  {ev.endpoints_found !== undefined && ` — ${ev.endpoints_found} endpoints found`}
                  {ev.records_leaked !== undefined && ev.records_leaked > 0 && ` — ${ev.records_leaked} records`}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
