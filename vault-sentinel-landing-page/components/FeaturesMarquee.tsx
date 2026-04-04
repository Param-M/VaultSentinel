"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const featureData = [
  { icon: "🦾", title: "Live Simulation", desc: "Real-time war gaming of attack vectors against your existing infrastructure without operational risk." },
  { icon: "🛡️", title: "OWASP", desc: "Native compliance monitoring for all top 10 vulnerabilities, ensuring application risk resilience." },
  { icon: "❄️", title: "Honey-pot", desc: "Dynamic deceptive environments designed to lure in and analyze sophisticated adversaries." },
  { icon: "❗", title: "Auto-quarantine", desc: "Instant millisecond isolation of compromised network fragments protecting system integrity." },
];

export default function FeaturesMarquee() {
  const trackWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = trackWrapperRef.current;
    if (!parent) return;

    const track1 = parent.children[0] as HTMLDivElement;
    if (!track1) return;

    // Clone element
    const track2 = track1.cloneNode(true) as HTMLDivElement;
    parent.appendChild(track2);

    const tl = gsap.to([track1, track2], {
      xPercent: -100,
      repeat: -1,
      duration: 30, // 30 seconds for full loop
      ease: "linear",
    });

    const handleEnter = () => tl.pause();
    const handleLeave = () => tl.play();
    
    parent.addEventListener("mouseenter", handleEnter);
    parent.addEventListener("mouseleave", handleLeave);

    return () => {
      parent.removeEventListener("mouseenter", handleEnter);
      parent.removeEventListener("mouseleave", handleLeave);
      if(track2.parentNode) track2.parentNode.removeChild(track2);
      tl.kill();
    };
  }, []);

  return (
    <section id="features" className="w-full pt-20 pb-32 flex flex-col items-center overflow-hidden">
       <div className="text-center max-w-3xl mb-12 px-4 z-10 relative">
         <span className="text-[10px] uppercase tracking-[3px] text-accent-blue font-bold opacity-80 mb-3 block">CORE CAPABILITIES</span>
         <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Features</h2>
       </div>

       <div className="relative w-[110vw] -ml-[5vw] py-8 flex items-center group">
         {/* Fade Edges */}
         <div className="absolute left-0 top-0 w-[15%] h-full bg-gradient-to-r from-background to-transparent z-20 pointer-events-none"></div>
         <div className="absolute right-0 top-0 w-[15%] h-full bg-gradient-to-l from-background to-transparent z-20 pointer-events-none"></div>
         
         <div className="flex w-max" style={{ display: 'flex' }} ref={trackWrapperRef}>
           <div className="flex">
             {featureData.map((f, i) => (
               <div key={i} className="w-[350px] mx-4 bg-alt/80 border border-borderLight rounded-xl p-10 cursor-crosshair hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300">
                 <div className="w-[50px] h-[50px] flex items-center justify-center rounded-xl mb-6 bg-white/5 border border-card-border text-2xl shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                   {f.icon}
                 </div>
                 <h3 className="text-lg font-bold mb-4">{f.title}</h3>
                 <p className="text-[0.9rem] text-muted leading-relaxed">{f.desc}</p>
               </div>
             ))}
           </div>
         </div>
       </div>
    </section>
  );
}
