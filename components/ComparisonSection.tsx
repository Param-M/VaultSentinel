"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const comparisonData = [
  {
    competitorName: "Salt Security",
    focus: "Cost and Compliance",
    vaultFeatures: [
      { title: "SaaS Accessibility", desc: "Tiered pricing specifically modeled for Indian mid-sized financial institutions." },
      { title: "RBI-Native", desc: "Out-of-the-box alignment with the RBI IT Framework 2021." },
      { title: "Executive Clarity", desc: "Plain-English AI summaries designed for non-technical leadership." }
    ],
    competitorFeatures: [
      { title: "High CAPEX", desc: "Multi-crore annual licensing fees targeting the top 1%." },
      { title: "Generic Compliance", desc: "Lacks native mapping for specific Indian regional mandates." },
      { title: "Technical Complexity", desc: "Dense dashboards built exclusively for specialized SOC analysts." }
    ]
  },
  {
    competitorName: "Wiz",
    focus: "Depth and Automation",
    vaultFeatures: [
      { title: "API-Centric", desc: "Deep inspection of transactional data and \"Zombie\" endpoint risks." },
      { title: "Logic-Aware", desc: "Real-time detection of broken object-level authorization (BOLA) in banking flows." },
      { title: "Automated Action", desc: "One-click \"Quarantine to Honeypot\" for immediate threat neutralization." }
    ],
    competitorFeatures: [
      { title: "Cloud-First Focus", desc: "Primarily monitors surface-level cloud misconfigurations and vulnerabilities." },
      { title: "Logic Gap", desc: "Lacks deep, real-time analysis of internal API business logic." },
      { title: "Generic Frameworks", desc: "Relies on global benchmarks without specific RBI mapping." }
    ]
  },
  {
    competitorName: "Checkmarx",
    focus: "Runtime Security and Speed",
    vaultFeatures: [
      { title: "Runtime Protection", desc: "Monitors live traffic to stop attacks in real-time without delaying development." },
      { title: "Dynamic Intelligence", desc: "Detects \"Zombie APIs\" and logic flaws that only appear when the system is actually running." },
      { title: "Executive Insights", desc: "Automatically filters noise to provide a high-level \"Security Score\" for banking leadership." }
    ],
    competitorFeatures: [
      { title: "Dev-Centric Bottleneck", desc: "Requires scanning source code during development, often slowing down the release cycle." },
      { title: "Static Analysis", desc: "Primarily identifies theoretical vulnerabilities in code rather than active, real-time attacks." },
      { title: "High Total Cost", desc: "Requires significant investment in security experts to triage thousands of \"False Positive\" alerts." }
    ]
  }
];

export default function ComparisonSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % comparisonData.length);
    }, 8000); // changes every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const data = comparisonData[activeIndex];

  return (
    <section className="w-full py-24 px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center">
      <div className="max-w-[1200px] w-full flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-playfair text-white [.light_&]:text-gray-900">
            The Security Gap
          </h2>
          <div className="h-8 relative overflow-hidden flex justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="text-lg text-muted [.light_&]:text-gray-600 font-medium italic absolute"
              >
                Vault Sentinel vs. {data.competitorName} • Focus: {data.focus}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Card - Vault Sentinel */}
          <div className="bg-[#050B14]/80 backdrop-blur-xl border-2 border-accent-blue/50 rounded-3xl p-8 lg:p-10 shadow-[0_0_40px_rgba(62,129,255,0.15)] flex flex-col relative overflow-hidden [.light_&]:bg-blue-50/50 [.light_&]:border-blue-200 [.light_&]:shadow-xl transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-blue/20 blur-[80px] rounded-full pointer-events-none [.light_&]:bg-blue-300/30" />

            <h3 className="text-xl md:text-2xl font-bold text-white mb-8 relative z-10 [.light_&]:text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center border border-accent-blue/50 [.light_&]:bg-blue-100 [.light_&]:border-blue-300 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse [.light_&]:bg-blue-600" />
              </div>
              Vault Sentinel (The Standard)
            </h3>

            <ul className="flex flex-col gap-6 relative z-10 flex-1 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.4, staggerChildren: 0.1 }}
                  className="flex flex-col gap-6 w-full"
                >
                  {data.vaultFeatures.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 md:gap-4"
                    >
                      <CheckCircle2 className="w-6 h-6 text-accent-green shrink-0 mt-0.5 [.light_&]:text-emerald-500" />
                      <div>
                        <span className="font-bold text-white text-[1rem] md:text-[1.05rem] mr-2 [.light_&]:text-gray-900">{feat.title}:</span>
                        <span className="text-muted leading-relaxed text-sm md:text-base [.light_&]:text-gray-600">{feat.desc}</span>
                      </div>
                    </motion.li>
                  ))}
                </motion.div>
              </AnimatePresence>
            </ul>
          </div>

          {/* Right Card - Competitor */}
          <div className="bg-[#140505]/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 lg:p-10 flex flex-col relative overflow-hidden [.light_&]:bg-red-50/30 [.light_&]:border-red-100 transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none [.light_&]:bg-red-200/30" />

            <h3 className="text-xl md:text-2xl font-bold text-white mb-8 relative z-10 [.light_&]:text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 [.light_&]:bg-gray-200/50 [.light_&]:border-gray-300 shrink-0">
                <XCircle className="w-4 h-4 text-red-500/80 [.light_&]:text-red-600" />
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {data.competitorName} (Enterprise Legacy)
                </motion.span>
              </AnimatePresence>
            </h3>

            <ul className="flex flex-col gap-6 relative z-10 flex-1 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, staggerChildren: 0.1 }}
                  className="flex flex-col gap-6 w-full"
                >
                  {data.competitorFeatures.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 md:gap-4"
                    >
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-1 opacity-70 [.light_&]:text-red-500" />
                      <div>
                        <span className="font-bold text-white text-[1rem] md:text-[1.05rem] mr-2 [.light_&]:text-gray-900">{feat.title}:</span>
                        <span className="text-muted leading-relaxed text-sm md:text-base [.light_&]:text-gray-600">{feat.desc}</span>
                      </div>
                    </motion.li>
                  ))}
                </motion.div>
              </AnimatePresence>
            </ul>
          </div>

        </div>

        {/* Pagination Dots */}
        <div className="flex gap-3 mt-12">
          {comparisonData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === idx
                  ? "bg-accent-blue w-8 [.light_&]:bg-blue-600"
                  : "bg-white/20 hover:bg-white/40 [.light_&]:bg-gray-300 [.light_&]:hover:bg-gray-400"
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
