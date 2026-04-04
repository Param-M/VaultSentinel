"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const scanLines = [
  { prefix: "[SCAN]", pColor: "text-blue-400 [.light_&]:text-blue-500", msg: "Analyzing /api/v1/transfer ...", stat: "SECURE", sColor: "text-[#00e073] [.light_&]:text-emerald-500" },
  { prefix: "[SCAN]", pColor: "text-blue-400 [.light_&]:text-blue-500", msg: "Analyzing /api/v2/auth ...", stat: "SECURE", sColor: "text-[#00e073] [.light_&]:text-emerald-500" },
  { prefix: "[WARN]", pColor: "text-[#ff7a00] [.light_&]:text-yellow-500", msg: "Dormant endpoint detected: /api/v1/legacy-login", stat: "", sColor: "" },
  { prefix: "[SCAN]", pColor: "text-blue-400 [.light_&]:text-blue-500", msg: "Analyzing /api/v1/payments ...", stat: "SECURE", sColor: "text-[#00e073] [.light_&]:text-emerald-500" },
  { prefix: "[ALERT]", pColor: "text-[#ff3366] [.light_&]:text-red-500 font-bold animate-pulse", msg: "Zombie API vulnerability found at /api/v1/admin-bypass!", stat: "", sColor: "" },
  { prefix: "[ACTION]", pColor: "text-[#00FFFF] [.light_&]:text-blue-500", msg: "Auto-quarantine initiated. Redirecting to honeypot...", stat: "", sColor: "" },
  { prefix: "[SUCCESS]", pColor: "text-[#00e073] [.light_&]:text-emerald-500", msg: "Threat neutralized. System secure.", stat: "", sColor: "" },
];

export default function TerminalScan() {
  const [visibleRows, setVisibleRows] = useState<number>(-1);
  const ROW_DURATION = 400; // ms per row

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runLoop = () => {
      setVisibleRows(-1);
      let currentStep = -1;
      
      const step = () => {
        currentStep++;
        if (currentStep <= scanLines.length) {
          setVisibleRows(currentStep);
          timeoutId = setTimeout(step, ROW_DURATION);
        } else {
          // Pause at the end for 1.2s then restart
          timeoutId = setTimeout(runLoop, 1200);
        }
      };
      
      // Start slightly delayed
      timeoutId = setTimeout(step, 200);
    };

    runLoop();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative w-full max-w-[550px] lg:max-w-[600px] h-[360px] rounded-2xl overflow-hidden bg-[#03050A]/80 backdrop-blur-lg border border-[#8E5CBF]/50 shadow-[0_0_50px_rgba(142,92,191,0.15)] [.light_&]:bg-white [.light_&]:border-gray-200 [.light_&]:shadow-xl font-mono text-[11px] sm:text-[13px] flex flex-col mx-auto md:mx-0">
       
       {/* Window Controls macOS Style */}
       <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10 relative z-20 [.light_&]:bg-[#f0f4f8] [.light_&]:border-gray-200">
         <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
         <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
         <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
         <span className="ml-3 text-muted/60 text-xs font-sans tracking-wide [.light_&]:text-gray-600">~ vault-sentinel-scan.sh</span>
       </div>

       {/* Console Body */}
       <div className="relative flex-1 p-5 overflow-hidden flex flex-col gap-4">
         
         {/* Vertical Scanning Line */}
         <motion.div 
           initial={{ top: "-10%" }}
           animate={{ top: "110%" }}
           transition={{ 
             duration: (scanLines.length * ROW_DURATION + 200) / 1000, 
             ease: "linear",
             repeat: Infinity,
             repeatDelay: 1.2,
           }}
           className="absolute left-0 w-full z-10 pointer-events-none [.light_&]:opacity-30"
           style={{ 
             height: "2px", 
             background: "#00FFFF", 
             boxShadow: "0 0 20px 2px rgba(0,255,255,0.7), 0 -30px 40px 0 rgba(0,255,255,0.2)" 
           }}
         />

         {/* Initializing Text */}
         <div className={`flex items-start transition-opacity duration-75 ${visibleRows >= 0 ? "opacity-100" : "opacity-0"}`}>
            <span className="text-[#00FFFF] [.light_&]:text-blue-600 font-bold mr-2">→</span>
            <span className="text-white/80 [.light_&]:text-gray-700">~ initializing AI scanner...</span>
         </div>

         {/* Typed Text Rows */}
         {scanLines.map((line, i) => (
           <div 
             key={i} 
             // We drop it in instantly as the line passes.
             className={`flex items-start sm:items-center justify-between transition-opacity duration-75 ${
               i + 1 <= visibleRows ? "opacity-100" : "opacity-0"
             }`}
           >
             <div className="flex gap-3 items-start sm:items-center w-full pr-2">
               <span className={`${line.pColor} font-bold tracking-widest`}>{line.prefix}</span>
               <span className={`leading-tight ${line.prefix.includes('ALERT') ? 'text-[#ff3366] [.light_&]:text-red-500' : line.prefix.includes('WARN') ? 'text-[#ff7a00] [.light_&]:text-yellow-500' : line.prefix.includes('SUCCESS') ? 'text-[#00e073] [.light_&]:text-emerald-500' : line.prefix.includes('ACTION') ? 'text-[#00FFFF] [.light_&]:text-blue-500' : 'text-white/80 [.light_&]:text-gray-700'}`}>{line.msg}</span>
             </div>
             
             <div className="text-right whitespace-nowrap">
               {i + 1 < visibleRows && line.stat && (
                 <span className={`${line.sColor} tracking-widest font-bold text-[10px] sm:text-xs ml-2`}>
                   {line.stat}
                 </span>
               )}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
}
