"use client";

import { Link, Grid, Shield } from "lucide-react";
import { motion } from "framer-motion";

const CARDS_DATA = [
  {
    icon: <Grid className="text-accent-blue" size={28} />,
    title: "Continuous Discovery",
    desc: "Automatically maps your entire API landscape, finding undocumented, dormant, and zombie APIs that traditional gateways miss.",
  },
  {
    icon: <CpuIcon className="text-accent-blue" size={28} />,
    title: "AI & Static Scoring",
    desc: "Evaluates each endpoint using a hybrid approach of static rules and dynamic AI behavioral analysis to assign a real-time risk score.",
  },
  {
    icon: <Shield className="text-accent-blue" size={28} />,
    title: "Threat Neutralization",
    desc: "Instantly quarantines suspicious endpoints and redirects attackers to honeypots, keeping your core banking systems safe.",
  }
];

// Fallback icon for CPU
function CpuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full pt-32 pb-16 flex flex-col items-center">
       <div className="text-center max-w-3xl mb-16 px-4 z-10 relative">
         <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">How Vault Sentinel works</h2>
         <p className="text-muted text-[0.95rem] leading-[1.6]">
           Experience the orchestration of our multi-layered defense system through the Vault Sentinel dashboard.
         </p>
       </div>

       {/* Widescreen Video Embed */}
       <div id="how-it-works-video" className="w-full max-w-[900px] aspect-video mx-auto mb-20 bg-alt border border-borderLight rounded-xl relative overflow-hidden flex flex-col items-center justify-center z-10 shadow-[0_0_50px_rgba(124,58,237,0.1)] scroll-mt-24">
         <iframe 
           width="100%" 
           height="100%" 
           src="https://www.youtube.com/embed/MghM6_X34Zw" 
           title="YouTube video player" 
           frameBorder="0" 
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
           referrerPolicy="strict-origin-when-cross-origin" 
           allowFullScreen>
         </iframe>
       </div>

       {/* 3 Step Cards */}
       <div className="w-full max-w-[1100px] px-4 mx-auto relative z-10">
         {/* Connecting Line */}
         <div className="hidden md:block absolute top-[20px] left-[10%] right-[10%] h-px bg-borderLight z-0"></div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {CARDS_DATA.map((card, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: i * 0.15 }}
                 className="flex flex-col group cursor-pointer"
               >
                  {/* Step Number Circle */}
                  <div className="mx-auto w-10 h-10 rounded-full bg-[#0a0d14] border border-borderLight flex items-center justify-center font-bold text-sm text-foreground mb-6 shadow-sm [.light_&]:bg-white group-hover:scale-110 transition-transform duration-300 z-10 relative">
                     0{i + 1}
                  </div>
                  
                  {/* Card Main */}
                  <div className="flex-1 bg-[#0a0d14] border border-borderLight rounded-3xl p-8 md:p-10 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:bg-[#0f1420] transition-all duration-300 [.light_&]:bg-white [.light_&]:hover:bg-blue-50/30 [.light_&]:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner [.light_&]:bg-gray-50 border border-white/5 [.light_&]:border-gray-100">
                       {card.icon}
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">{card.title}</h3>
                     <p className="text-[0.95rem] md:text-[1rem] text-muted leading-[1.6]">
                       {card.desc}
                     </p>
                  </div>
               </motion.div>
            ))}
         </div>
       </div>
    </section>
  );
}
