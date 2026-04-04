"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThreatDashboard() {
  const [inventoryFilter, setInventoryFilter] = useState('ALL');
  const [stats, setStats] = useState({ zombies: 247, critical: 38, patched: 1204 });

  const inventory = [
    { id: 1, endpoint: '/api/v0/auth/refresh', service: 'Auth Service', status: 'ZOMBIE', risk: 96, time: '847d ago' },
    { id: 2, endpoint: '/api/v1/admin/users', service: 'User Mgmt', status: 'ZOMBIE', risk: 91, time: '234d ago' },
    { id: 3, endpoint: '/api/v3/products', service: 'Product Svc', status: 'ACTIVE', risk: 18, time: '2 min' },
    { id: 4, endpoint: '/api/v2/payments', service: 'Payments', status: 'WARNING', risk: 67, time: '132d ago' },
    { id: 5, endpoint: '/api/v4/search', service: 'Search API', status: 'ACTIVE', risk: 22, time: '8 min' },
    { id: 6, endpoint: '/api/v1/debug', service: 'Debug API', status: 'ZOMBIE', risk: 99, time: '1284d ago' },
    { id: 7, endpoint: '/api/v2/reports', service: 'Analytics', status: 'WARNING', risk: 55, time: '67d ago' },
  ];

  const [alerts, setAlerts] = useState([
    { id: 101, severity: "CRITICAL", endpoint: "/api/v4/search", detail: "Blocked Ext", time: "now" },
    { id: 102, severity: "WARNING", endpoint: "/api/v0/auth/r", detail: "Detected act", time: "2s" },
    { id: 103, severity: "INFO", endpoint: "/api/v4/search", detail: "Detected act", time: "3s" },
  ]);

  // Simulation loop
  useEffect(() => {
    const int = setInterval(() => {
      setStats(prev => ({
        zombies: prev.zombies + Math.floor(Math.random() * 3) - 1,
        critical: prev.critical + (Math.random() > 0.7 ? 1 : 0),
        patched: prev.patched + Math.floor(Math.random() * 5),
      }));
    }, 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <section id="dashboard" className="w-full pt-16 pb-32 flex flex-col items-center overflow-hidden">
       {/* Dashboard Title */}
       <div className="text-center w-full mb-12">
         <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">Threat Dashboard</h2>
       </div>

       {/* Desktop Horizontal Grid Layout matching Screenshot */}
       <div className="max-w-[1200px] w-full px-4 lg:px-8 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 text-sm">
         
         {/* PANEL 1: THREAT RADAR */}
         <div className="group bg-[#0B0E14] border border-white/5 rounded-xl p-6 flex flex-col hover:-translate-y-2 hover:border-accent-blue hover:shadow-[0_20px_50px_rgba(62,129,255,0.15)] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-[1px] bg-accent-blue/30 blur-[0.5px]"></div>
               <h3 className="text-[10px] tracking-[4px] text-accent-blue font-bold uppercase">Threat Radar</h3>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-start relative min-h-[220px]">
               {/* Radar Circles - BOUNDED SWEEP */}
               <div className="absolute w-[200px] h-[200px] rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
                 <div 
                   className="absolute inset-0 rounded-full animate-spin" 
                   style={{ 
                     background: "conic-gradient(from 0deg, rgba(62, 129, 255, 0) 70%, rgba(62, 129, 255, 0.1) 95%, rgba(62, 129, 255, 0.4) 100%)",
                     animationDuration: "4s"
                   }}
                 ></div>
                 <div className="w-[140px] h-[140px] rounded-full border border-white/5 border-dashed flex items-center justify-center relative z-10">
                   <div className="w-[80px] h-[80px] rounded-full border border-white/5 relative flex items-center justify-center">
                     <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping opacity-50 absolute"></span>
                   </div>
                 </div>
               </div>
               
               {/* Radar Dots */}
               {Array.from({ length: 15 }).map((_, i) => {
                 const angle = Math.random() * Math.PI * 2;
                 const radius = Math.random() * 90;
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;
                 const isOrange = Math.random() > 0.6;
                 
                 return (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: [0, 1, 0, 0], scale: [0.5, 1, 0.5, 0] }}
                     transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 4 }}
                     className={`absolute w-1.5 h-1.5 rounded-full z-20 ${isOrange ? 'bg-accent-orange shadow-[0_0_10px_rgba(255,122,0,0.8)]' : 'bg-accent-blue shadow-[0_0_10px_rgba(62,129,255,0.8)]'}`}
                     style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                   />
                 )
               })}
            </div>

            <div className="mt-auto grid grid-cols-3 gap-2 text-center border border-white/5 rounded-lg p-4 bg-black/20">
              <div className="border-r border-white/5">
                <div className="text-2xl font-bold text-accent-cyan mb-1">{stats.zombies}</div>
                <div className="text-[9px] tracking-[2px] text-muted uppercase">Zombies</div>
              </div>
              <div className="border-r border-white/5">
                <div className="text-2xl font-bold text-white mb-1">{stats.critical}</div>
                <div className="text-[9px] tracking-[2px] text-muted uppercase">Critical</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#8f9cae] mb-1">{stats.patched}</div>
                <div className="text-[9px] tracking-[2px] text-muted uppercase">Patched</div>
              </div>
            </div>
         </div>

         {/* PANEL 2: API INVENTORY */}
         <div className="group bg-[#0B0E14] border border-white/5 rounded-xl p-6 flex flex-col hover:-translate-y-2 hover:border-accent-blue hover:shadow-[0_20px_50px_rgba(62,129,255,0.15)] transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-[11px] tracking-[3px] text-white font-bold uppercase">API Inventory</h3>
               <div className="flex gap-2">
                 {['ALL', 'ZOMBIE', 'ACTIVE', 'WARN'].map(f => (
                   <span 
                     key={f}
                     onClick={() => setInventoryFilter(f)}
                     className={`text-[9px] px-3 py-1 rounded-full cursor-pointer transition-colors border ${
                       inventoryFilter === f 
                         ? 'border-accent-purple bg-[#1a0f35] text-white' 
                         : 'border-white/10 text-muted hover:text-white'
                     }`}
                   >
                     {f}
                   </span>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-12 gap-4 text-[9px] tracking-[2px] text-muted uppercase border-b border-white/5 pb-2 mb-4">
               <div className="col-span-4 lg:col-span-5">Endpoint</div>
               <div className="col-span-3 lg:col-span-3 text-center">Status</div>
               <div className="col-span-2 lg:col-span-2 text-center">Risk</div>
               <div className="col-span-3 lg:col-span-2 text-right">Last Seen</div>
            </div>

            <div className="flex-1 flex flex-col text-xs overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
               {inventory.filter(item => inventoryFilter === 'ALL' || item.status.includes(inventoryFilter) || (inventoryFilter === 'WARN' && item.status === 'WARNING')).map((item) => (
                 <div key={item.id} className="grid grid-cols-12 gap-4 items-center group/row border-b border-white/5 last:border-0 py-3">
                   <div className="col-span-4 lg:col-span-5 flex flex-col overflow-hidden">
                     <span className="text-white font-mono text-[11px] truncate">{item.endpoint}</span>
                     <span className="text-muted text-[10px] truncate">{item.service}</span>
                   </div>
                   
                   <div className="col-span-3 lg:col-span-3 flex items-center justify-center gap-2">
                     <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-accent-green' : item.status === 'ZOMBIE' ? 'bg-accent-orange' : 'bg-yellow-500'}`}></span>
                     <span className={`text-[10px] font-bold ${item.status === 'ACTIVE' ? 'text-accent-green' : item.status === 'ZOMBIE' ? 'text-accent-orange' : 'text-yellow-500'}`}>{item.status}</span>
                   </div>

                   <div className="col-span-2 text-center flex items-center gap-2 lg:col-span-2">
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.risk > 80 ? 'bg-accent-orange' : item.risk > 50 ? 'bg-yellow-500' : 'bg-accent-green'}`} style={{ width: `${item.risk}%` }}></div>
                      </div>
                   </div>

                   <div className="col-span-3 lg:col-span-2 text-right font-mono text-[10px]">
                     <span className={item.risk > 80 ? 'text-accent-orange' : 'text-white'}>{item.risk}</span>
                     <span className="text-muted ml-0.5">{item.time}</span>
                   </div>
                 </div>
               ))}
            </div>
         </div>

         {/* PANEL 3: LIVE ALERTS */}
         <div className="group bg-[#0B0E14] border border-white/5 rounded-xl p-6 flex flex-col hover:-translate-y-2 hover:border-accent-blue hover:shadow-[0_20px_50px_rgba(62,129,255,0.15)] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[11px] tracking-[3px] text-white font-bold uppercase">Live Alerts</h3>
               <div className="flex items-center gap-2 text-[9px] text-accent-green font-bold tracking-[2px]">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_rgba(0,224,115,0.8)]"></span>
                 LIVE
               </div>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] gap-4 text-[9px] tracking-[2px] text-muted uppercase border-b border-white/5 pb-2 mb-4">
               <div>Sev</div>
               <div>Endpoint</div>
               <div className="text-right">Detail Time</div>
            </div>

            <div className="flex-1 flex flex-col gap-3 relative overflow-hidden">
               <AnimatePresence>
                 {alerts.map((alert) => (
                   <motion.div 
                     key={alert.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="grid grid-cols-[auto_1fr_auto] gap-4 items-center border border-white/5 bg-black/20 rounded-md p-2 hover:bg-black/40 transition-colors"
                   >
                     <div className={`text-[8px] px-2 py-0.5 rounded font-bold border ${alert.severity === 'CRITICAL' ? 'border-accent-orange/50 text-accent-orange bg-accent-orange/10' : alert.severity === 'WARNING' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 'border-accent-blue/50 text-accent-blue bg-accent-blue/10'}`}>
                       {alert.severity}
                     </div>
                     <div className="text-white font-mono text-[10px] truncate max-w-[120px]">{alert.endpoint}</div>
                     <div className="text-[9px] text-right">
                       <div className="text-muted truncate max-w-[80px]">{alert.detail}</div>
                       <div className="text-white/40">{alert.time}</div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
         </div>
       </div>
    </section>
  );
}
