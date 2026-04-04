"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ from, to, duration, format }: { from: number, to: number, duration: number, format?: (v: number) => string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration: duration,
      onUpdate(value) {
        if(format) node.textContent = format(value);
        else node.textContent = Math.floor(value).toString();
      },
      onComplete() {
        // Live fluctuation simulation after count
        if(!format) { // Assuming threats
          setInterval(() => {
            const v = Math.floor(Math.random() * 50 - 25);
            node.textContent = (to + v).toString();
          }, 1000);
        } else {
          setInterval(() => {
            const v = (Math.random() * 0.8 - 0.4);
            node.textContent = format(to + v);
          }, 800);
        }
      }
    });

    return () => controls.stop();
  }, [from, to, duration, format]);

  return <span ref={nodeRef}>{from}</span>;
}

export default function LiveStatistics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-[1400px] mx-auto mt-24 px-8 z-10"
    >
      <div className="flex flex-col mb-8">
        <span className="text-[10px] uppercase tracking-[3px] text-accent-blue font-bold opacity-80 mb-2">Live Network Monitoring</span>
        <h2 className="text-3xl font-bold tracking-tight">API Statistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            content: (
              <>
                 <div className="text-[3.5rem] font-bold text-accent-blue tracking-tighter leading-none mb-3 filter drop-shadow-[0_0_15px_rgba(62,129,255,0.4)]">
                    <Counter from={0} to={12.4} duration={1.5} format={(v) => v.toFixed(1) + 'k'} />
                 </div>
                 <p className="text-[9px] uppercase tracking-[2px] text-muted font-bold">ACTIVE CONNECTIONS</p>
              </>
            ),
            delay: 0
          },
          {
            content: (
              <>
                 <div className="text-[3.5rem] font-bold text-accent-blue tracking-tighter leading-none mb-3 flex items-start filter drop-shadow-[0_0_15px_rgba(62,129,255,0.4)]">
                    <span>99.99</span><span className="text-[2rem] mt-1 ml-1">%</span>
                 </div>
                 <p className="text-[9px] uppercase tracking-[2px] text-muted font-bold mb-3">SYSTEM UPTIME</p>
                 <div className="flex items-center text-[10px] font-bold text-accent-green tracking-widest bg-accent-green/10 px-3 py-1 rounded-full border border-accent-green/20">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent-green opacity-80 animate-pulse mr-2"></span>
                   OPERATIONAL
                 </div>
              </>
            ),
            delay: 0.5
          },
          {
            content: (
              <>
                 <div className="text-[3.5rem] font-bold text-accent-blue tracking-tighter leading-none mb-3 filter drop-shadow-[0_0_15px_rgba(62,129,255,0.4)]">
                    <Counter from={0} to={482} duration={2} />
                 </div>
                 <p className="text-[9px] uppercase tracking-[2px] text-muted font-bold">THREATS MITIGATED / HR</p>
              </>
            ),
            delay: 1.0
          }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: stat.delay, ease: "easeInOut" }}
            className="bg-alt border border-card-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-accent-blue/50 hover:shadow-[0_10px_30px_rgba(62,129,255,0.15)] transition-all duration-300 [.light_&]:bg-white [.light_&]:border-gray-200 [.light_&]:shadow-sm"
          >
            {stat.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
