"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Alert = { id: string, type: string, ip: string, status: string, time: string };

const ipPool = ["192.168.1.100", "10.0.0.52", "172.16.254.1", "45.33.22.11", "185.20.10.9"];

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "1", type: "BRUTE_FORCE", ip: "45.33.22.11", status: "BLOCKED", time: "10:45:01" },
    { id: "2", type: "SQL_INJECTION", ip: "185.20.10.9", status: "QUARANTINED", time: "10:44:58" },
    { id: "3", type: "ANOMALY", ip: "10.0.0.52", status: "FLAGGED", time: "10:44:30" },
  ]);

  useEffect(() => {
    // Mock incoming alerts
    const interval = setInterval(() => {
       const newAlert: Alert = {
         id: Math.random().toString(36).substr(2, 9),
         type: ["BRUTE_FORCE", "SQL_INJECTION", "ZOMBIE_API", "DDoS"][Math.floor(Math.random() * 4)],
         ip: ipPool[Math.floor(Math.random() * ipPool.length)],
         status: ["BLOCKED", "QUARANTINED", "FLAGGED"][Math.floor(Math.random() * 3)],
         time: new Date().toLocaleTimeString('en-US', { hour12: false })
       };
       setAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep last 5
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-alt border border-card-border rounded-xl p-6 flex flex-col h-[350px]">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-foreground">Live Alert Stream</h3>
         <span className="flex items-center text-[10px] text-accent-pink font-bold tracking-widest bg-accent-pink/10 px-2 py-1 rounded">
           <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse mr-2"></span>
           LIVE
         </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col gap-3">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className="w-full border-l-[3px] border-accent-pink bg-background px-4 py-3 rounded-r-md flex flex-col gap-1 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
              >
                <div className="flex justify-between items-center w-full">
                   <strong className="text-accent-pink tracking-tight">{alert.type}</strong>
                   <span className="text-[10px] text-muted">{alert.time}</span>
                </div>
                <div className="flex justify-between items-center w-full text-xs text-muted">
                   <span>IP: {alert.ip}</span>
                   <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                     alert.status === 'BLOCKED' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' : 
                     alert.status === 'QUARANTINED' ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20' :
                     'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                   }`}>{alert.status}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
