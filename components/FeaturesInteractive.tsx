"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Link2, AlertTriangle, PieChart, Skull, Activity, Lock, TerminalSquare, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const featureData = [
  { id: 'owasp', icon: <Shield size={22} />, title: "OWASP Top 10 Scan", desc: "Automated, continuous scanning against the latest OWASP API Security Top 10 vulnerabilities, ensuring compliance and baseline security." },
  { id: 'quarantine', icon: <Lock size={22} />, title: "Auto Quarantine", desc: "Instantly isolates compromised or anomalous APIs before they can access core banking systems, preventing data exfiltration." },
  { id: 'honeypot', icon: <Activity size={22} />, title: "Honeypot Traps", desc: "Deploys deceptive API endpoints to lure, detect, and analyze attackers without risking real financial data or infrastructure." },
  { id: 'simulation', icon: <Activity size={22} />, title: "Live Attack Simulation", desc: "Experience how Vault Sentinel detects and neutralizes sophisticated attacks in real-time through our interactive simulation engine." },
];

export default function FeaturesInteractive() {
  const [hoveredModal, setHoveredModal] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    setLoadingId(id);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredModal(id);
      setLoadingId(null);
    }, 1000); // 1 second for drawing animation
  };

  const handleMouseLeave = () => {
    setLoadingId(null);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <section id="features" className="w-full pt-20 pb-32 flex flex-col items-center">
      <div className="text-center max-w-3xl mb-16 px-4 z-10 relative">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">Features</h2>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {featureData.map((f, i) => {
            const isHoneypot = f.id === 'honeypot';
            
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-[#0B0E14] border border-white/10 rounded-2xl p-8 cursor-pointer hover:-translate-y-1 hover:border-white/5 hover:shadow-[0_15px_30px_rgba(62,129,255,0.15)] transition-all duration-300 relative group flex flex-col justify-start [.light_&]:bg-white [.light_&]:border-gray-200 [.light_&]:shadow-sm [.light_&]:hover:shadow-md overflow-hidden"
              onMouseEnter={() => handleMouseEnter(f.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Outer Card Animated Drawing Border - Appears on Hover duration 2.0s */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <rect 
                  x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="15" ry="15" 
                  fill="none" stroke="#3b82f6" strokeWidth="3" 
                  strokeDasharray="2500" 
                  strokeDashoffset={loadingId === f.id ? "0" : "2500"} 
                  className="transition-all ease-linear opacity-80"
                  style={{ transitionDuration: loadingId === f.id ? "1s" : "0.3s" }}
                />
              </svg>

              <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl mb-5 bg-white/5 border border-white/10 text-accent-blue shadow-inner group-hover:scale-110 transition-transform duration-300 [.light_&]:bg-blue-50 [.light_&]:border-blue-100 [.light_&]:text-blue-600">
                {/* Icon Inner Animated Drawing Border */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <rect 
                    x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="11" ry="11" 
                    fill="none" stroke="#22d3ee" strokeWidth="2" 
                    strokeDasharray="200" 
                    strokeDashoffset={loadingId === f.id ? "0" : "200"} 
                    className="transition-all ease-linear"
                    style={{ transitionDuration: loadingId === f.id ? "1s" : "0.3s" }}
                  />
                </svg>
                {f.icon}
              </div>
              <h3 className="relative z-10 text-xl font-bold mb-3 text-white [.light_&]:text-gray-900">{f.title}</h3>
              <p className="relative z-10 text-[0.95rem] text-muted leading-[1.6] [.light_&]:text-gray-600">{f.desc}</p>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pop-up Modals Overlay */}
      <AnimatePresence>
        {hoveredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setHoveredModal(null); handleMouseLeave(); }}
            onMouseMove={(e: any) => {
              if (e.target === e.currentTarget) {
                setHoveredModal(null);
                handleMouseLeave();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-[900px] h-auto min-h-[500px] bg-[#0A0D14] border border-borderLight rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden [.light_&]:bg-[#f8fafc] [.light_&]:border-gray-300"
              onMouseLeave={() => { setHoveredModal(null); handleMouseLeave(); }}
            >
              {hoveredModal === 'simulation' && <SimulationModalDetailed />}
              {hoveredModal === 'owasp' && <OwaspModal />}
              {hoveredModal === 'honeypot' && <HoneypotModal />}
              {hoveredModal === 'quarantine' && <QuarantineModal />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ----------------------------------------------------------------------------------
//                             INTERACTIVE ANIMATED MODALS
// ----------------------------------------------------------------------------------

function SimulationModalDetailed() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence the attacker vs sentinel scenario
    const timer1 = setTimeout(() => setStage(1), 1000); // Recon
    const timer2 = setTimeout(() => setStage(2), 2500); // Fingerprint
    const timer3 = setTimeout(() => setStage(3), 4000); // Brute force
    const timer4 = setTimeout(() => setStage(4), 5500); // Exfiltrate attempt
    const timer5 = setTimeout(() => setStage(5), 7000); // VS Blocks (Quarantine)
    
    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
      clearTimeout(timer4); clearTimeout(timer5);
    };
  }, []);

  const stages = [
    { id: 1, name: "Recon" },
    { id: 2, name: "Fingerprint" },
    { id: 3, name: "Brute Force" },
    { id: 4, name: "Exfiltrate" },
    { id: 5, name: "VS Blocks" },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col pointer-events-none bg-[#030712] [.light_&]:bg-white">
      
      {/* Top stage header */}
      <div className="flex w-full overflow-hidden rounded-t-md mb-4 bg-gray-900 border border-gray-800 [.light_&]:bg-gray-100 [.light_&]:border-gray-200">
        {stages.map((s) => (
          <div key={s.id} className={`flex-1 py-2 text-center text-[10px] font-bold tracking-wider transition-colors duration-300 ${stage >= s.id ? (s.id === 5 ? 'bg-accent-green/20 text-accent-green' : s.id === 4 ? 'bg-accent-orange/20 text-accent-orange' : 'bg-accent-cyan/20 text-accent-cyan') : 'text-gray-500'}`}>
            <span className="opacity-70 mr-1">○</span> {s.name}
          </div>
        ))}
      </div>

      <div className="flex-1 flex gap-4 h-[350px]">
        {/* Attacker Panel */}
        <div className="flex-1 rounded-md border border-gray-800 bg-[#0a0a0a] flex flex-col overflow-hidden [.light_&]:bg-gray-50 [.light_&]:border-gray-200 shadow-inner">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 [.light_&]:border-gray-200">
            <div className="w-2 h-2 rounded-full bg-accent-orange"></div>
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <span className="text-accent-orange text-xs font-bold tracking-widest ml-2">ATTACKER</span>
          </div>
          <div className="p-4 flex-1 font-mono text-[11px] md:text-xs overflow-hidden flex flex-col gap-2">
            
            <AnimatePresence>
              {stage >= 1 && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-gray-500">
                  <p>&gt; Starting enumeration script...</p>
                  <p>Target: api.vault-financial.com</p>
                </motion.div>
              )}
              {stage >= 2 && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-gray-400 mt-2">
                  <p>Found 48 routes.</p>
                  <p>Identifying legacy v1 endpoints...</p>
                  <p className="text-accent-orange mt-1">Found open route: /api/v1/legacy/auth</p>
                </motion.div>
              )}
              {stage >= 3 && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-gray-400 mt-2">
                  <p className="text-gray-500">Trying service:service -&gt; 401</p>
                  <p className="text-gray-500">Trying admin:pass123 -&gt; 401</p>
                  <p className="text-accent-pink font-bold mt-1">Trying service:service123 -&gt; 200 BREACH &check;</p>
                </motion.div>
              )}
              {stage >= 4 && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-accent-orange mt-2 font-bold">
                  <p className="bg-accent-orange/20 inline-block px-1 mb-1">[ STAGE 4 ] DATA EXFILTRATION</p>
                  <p className="text-gray-400">GET /api/v0/user-data?limit=999999</p>
                </motion.div>
              )}
              {stage >= 4 && stage < 5 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.5}} className="flex flex-col gap-1 mt-1 text-accent-pink">
                  <span className="animate-pulse">Fetching records...</span>
                  <span>Received 539 records...</span>
                  <span>Received 1,202 records...</span>
                  <span>Received 1,968 records...</span>
                </motion.div>
              )}
              {stage >= 5 && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-red-500 mt-2 font-bold">
                  <p>CONNECTION REFUSED.</p>
                  <p>ERR_CONNECTION_CLOSED.</p>
                  <p className="text-gray-500 mt-1">Payload failure. Route unreachable.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sentinel Panel */}
        <div className="flex-1 rounded-md border border-gray-800 bg-[#060b14] flex flex-col overflow-hidden [.light_&]:bg-blue-50/50 [.light_&]:border-gray-200 shadow-inner">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 [.light_&]:border-gray-200">
            <div className="w-2 h-2 rounded-full bg-accent-green"></div>
            <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
            <span className="text-accent-cyan text-xs font-bold tracking-widest ml-2">VAULT SENTINEL</span>
          </div>
          <div className="p-4 flex-1 font-mono text-[11px] md:text-xs overflow-hidden flex flex-col gap-2">
             <AnimatePresence>
              {stage >= 2 && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="text-gray-400">
                  <p className="text-accent-blue">&gt; Monitoring incoming requests...</p>
                </motion.div>
              )}
              {stage >= 3 && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="mt-2">
                  <p className="text-amber-400 font-bold">&#9888; ANOMALY: Unusual traffic pattern detected</p>
                  <p className="text-accent-pink font-bold mt-1">&#128680; CRITICAL: Brute force succeeded on zombie API!</p>
                </motion.div>
              )}
              {stage >= 5 && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="mt-4 border border-accent-blue/30 bg-accent-blue/10 p-3 rounded">
                  <p className="text-accent-cyan font-bold tracking-widest mb-2 flex items-center justify-center relative">
                    <span className="absolute left-0 w-1/3 h-px bg-accent-cyan/50"></span>
                    VAULT SENTINEL ACTIVATED
                    <span className="absolute right-0 w-1/3 h-px bg-accent-cyan/50"></span>
                  </p>
                  <ul className="text-accent-green space-y-1">
                    <li>&check; API quarantined at gateway layer</li>
                    <li>&check; Attacker IP 192.168.1.45 banned</li>
                    <li>&check; All connections terminated</li>
                    <li>&check; Incident report auto-generated</li>
                  </ul>
                  <p className="text-accent-cyan font-bold mt-3 bg-black/40 px-2 py-1 rounded inline-block">RESULT: 0 records leaked</p>
                </motion.div>
              )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex gap-4 mt-4 h-12">
        <div className="flex-1 flex flex-col justify-end gap-1">
          <span className="text-[9px] font-bold tracking-widest text-accent-orange uppercase">Without Vault Sentinel</span>
          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden relative">
            <motion.div 
               className="h-full bg-accent-pink"
               initial={{ width: "0%" }}
               animate={{ width: stage >= 4 ? (stage >= 5 ? "80%" : "60%") : "0%" }}
               transition={{ duration: stage >= 5 ? 0.3 : 4, ease: "linear" }}
            />
          </div>
          {stage >= 4 && <span className="text-[10px] text-accent-pink">{stage >= 5 ? "Data breach contained!" : "3,520 records leaked..."}</span>}
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1">
          <span className="text-[9px] font-bold tracking-widest text-accent-cyan uppercase">With Vault Sentinel</span>
          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden relative">
             <motion.div 
               className="h-full bg-accent-cyan"
               initial={{ width: "100%" }}
               animate={{ width: "100%" }}
            />
          </div>
          {stage >= 5 && <span className="text-[10px] text-accent-cyan">50,000 records protected</span>}
        </div>
      </div>

    </div>
  )
}

function OwaspModal() {
  return (
    <div className="w-full h-full p-8 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-blue/10 to-[#0A0D14] pointer-events-none [.light_&]:from-blue-50 [.light_&]:to-white">
      <div className="flex items-center gap-4 mb-8">
        <Shield size={36} className="text-accent-blue [.light_&]:text-blue-600" />
        <div>
          <h3 className="font-bold text-2xl text-white [.light_&]:text-gray-900">OWASP Monitoring Array</h3>
          <p className="text-muted text-xs mt-1 [.light_&]:text-gray-500">Real-time Top 10 perimeter validation. Scanning routes.</p>
        </div>
        <div className="ml-auto px-4 py-2 border border-accent-green text-accent-green text-xs font-bold rounded-full animate-pulse shadow-[0_0_15px_rgba(0,224,115,0.4)]">
          100% COMPLIANT
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 z-10">
        {[
          { id: "A01", n: "Broken Access Control", stat: "SECURE" },
          { id: "A02", n: "Cryptographic Failures", stat: "SECURE" },
          { id: "A03", n: "Injection", stat: "BLOCKED" },
          { id: "A04", n: "Insecure Design", stat: "SECURE" },
          { id: "A05", n: "Security Misconfiguration", stat: "PATCHED" },
          { id: "A06", n: "Vulnerable Components", stat: "SECURE" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, type: "spring" }}
            className="bg-black/60 border border-white/5 p-4 rounded-lg flex items-center justify-between overflow-hidden relative [.light_&]:bg-gray-50 [.light_&]:border-gray-200"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-accent-blue/20 to-transparent [.light_&]:via-blue-400/20"
            />
            <div className="flex items-center gap-3 ml-2 relative z-10">
              <span className="text-accent-blue font-bold text-sm tracking-widest [.light_&]:text-blue-700">{item.id}</span>
              <span className="text-white text-sm [.light_&]:text-gray-800">{item.n}</span>
            </div>
            <span className={`text-[9px] tracking-widest px-2 py-1 rounded border relative z-10 ${item.stat === "BLOCKED" ? "text-accent-pink border-accent-pink bg-accent-pink/10" :
              item.stat === "PATCHED" ? "text-accent-cyan border-accent-cyan bg-accent-cyan/10" :
                "text-accent-green border-accent-green bg-accent-green/10"
              }`}>
              {item.stat}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function HoneypotModal() {
  return (
    <div className="w-full h-full p-8 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#110e1a] to-[#0A0D14] pointer-events-none [.light_&]:from-purple-50 [.light_&]:to-white">
      <div className="flex items-center gap-4 mb-8 z-10 relative">
        <div className="w-12 h-12 rounded-xl bg-accent-purple/20 border border-accent-purple/50 flex items-center justify-center [.light_&]:bg-purple-100 [.light_&]:border-purple-200">
          <Activity size={24} className="text-accent-purple [.light_&]:text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-2xl text-white [.light_&]:text-gray-900">Deceptive Honeypot Vectors</h3>
          <p className="text-muted text-xs mt-1 [.light_&]:text-gray-500">Luring malicious attackers into isolated sandbox environments.</p>
        </div>
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        
        {/* Core Centered Honeypot */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          
          {/* Constantly expanding radar rings pulling focus */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-accent-purple/30 aspect-square w-32 h-32 z-0"
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5, ease: "linear" }}
            className="absolute rounded-full border border-accent-purple/30 aspect-square w-32 h-32 z-0"
          />

          {/* Glowing central trap */}
          <motion.div 
            animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.4)", "0 0 60px rgba(168,85,247,0.8)", "0 0 20px rgba(168,85,247,0.4)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-40 h-40 rounded-full border-2 border-accent-purple bg-[#0A0D14] flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(168,85,247,0.5)] [.light_&]:bg-white"
          >
            <Activity className="text-accent-purple mb-2 animate-pulse" size={40} />
            <span className="text-xs font-bold text-accent-purple tracking-widest text-center px-2">SANDBOX<br/>TRAP</span>
          </motion.div>
        </div>

        {/* 8 Malicious Payloads flying into the trap from all directions */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          // Calculate a perfect circle of starting positions radiating from center
          const angle = (i / 8) * Math.PI * 2;
          const distance = 250; // closer so it renders perfectly centralized inside modal boundaries
          const startX = Math.cos(angle) * distance;
          const startY = Math.sin(angle) * distance;
          
          return (
            <motion.div
              key={`payload-${i}`}
              initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
              animate={{
                x: [startX, startX * 0.4, 0], 
                y: [startY, startY * 0.4, 0],
                opacity: [0, 1, 0],
                scale: [1.2, 1, 0], // Shrink as it gets intercepted
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut", 
                delay: i * 0.3 // Staggered entry
              }}
              className="absolute z-10 flex flex-col items-center justify-center top-1/2 left-1/2 -mt-4 -ml-4"
            >
              <div className="bg-red-500/10 border border-red-500 p-2 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.7)] backdrop-blur-md flex flex-col items-center">
                <Skull className="text-red-500" size={16} />
              </div>
            </motion.div>
          );
        })}

      </div>
    </div>
  )
}

function QuarantineModal() {
  return (
    <div className="w-full h-full p-8 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-pink/10 to-[#0A0D14] pointer-events-none [.light_&]:from-pink-50 [.light_&]:to-white">
      <div className="flex items-center gap-4 mb-8 z-10 relative">
        <AlertTriangle size={36} className="text-accent-pink" />
        <div>
          <h3 className="font-bold text-2xl text-white [.light_&]:text-gray-900">Auto-Quarantine Execution</h3>
          <p className="text-muted text-xs mt-1 [.light_&]:text-gray-500">Instant isolation of targeted network segments</p>
        </div>
        <div className="ml-auto px-4 py-2 bg-accent-pink text-white text-xs font-bold rounded-md animate-pulse shadow-[0_0_20px_rgba(255,51,102,0.6)]">
          ISOLATION ENGAGED
        </div>
      </div>

      <div className="flex-1 w-full relative grid grid-cols-3 gap-6">
        <div className="col-span-1 border border-white/5 bg-black/50 rounded-lg p-4 flex flex-col items-center justify-center [.light_&]:bg-gray-50 [.light_&]:border-gray-200">
          <span className="text-muted text-[10px] tracking-widest uppercase mb-4 [.light_&]:text-gray-500">Traffic Stream</span>
          <div className="flex flex-col gap-2 w-full mt-4">
            {[1, 2, 3, 4].map(i => (
              <motion.div key={i} animate={{ y: [-10, 10, -10] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="h-6 w-full bg-accent-blue/10 border border-accent-blue/30 rounded flex items-center px-2 [.light_&]:bg-blue-50 [.light_&]:border-blue-200">
                <span className="text-[8px] text-accent-blue font-mono [.light_&]:text-blue-600">REQ_ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="col-span-2 border border-accent-pink/50 bg-accent-pink/5 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden [.light_&]:border-pink-300 [.light_&]:bg-pink-50">
          <div className="w-24 h-24 rounded-full border border-accent-pink flex items-center justify-center bg-black/80 z-10 shadow-[0_0_30px_rgba(255,51,102,0.5)] [.light_&]:bg-white">
            <AlertTriangle size={32} className="text-accent-pink animate-ping" />
          </div>
          <h4 className="mt-4 text-accent-pink font-bold uppercase tracking-widest z-10 text-sm">Zone Lockdown</h4>

          {/* Suspicious packets being locked */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={`sus-${i}`}
              initial={{ scale: 2, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: [0, 1, 0], rotate: 0 }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.4 }}
              className="absolute top-[30%] left-[20%] text-[8px] border border-accent-orange text-accent-orange px-2 py-1 rounded bg-[#06070a] shadow-[0_0_10px_rgba(255,122,0,0.8)] z-20 [.light_&]:bg-white"
              style={{ marginTop: (i - 2) * 30, marginLeft: (i - 1) * 20 }}
            >
              [SUSPICIOUS_PAYLOAD] DROP_ENFORCED
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
