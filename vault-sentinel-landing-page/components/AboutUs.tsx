"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Code, Play, Box, Mail, X } from "lucide-react";

export default function AboutUs() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showTeam, setShowTeam] = useState(false);
  const [showEmails, setShowEmails] = useState(false);

  return (
    <footer id="about-us" className="w-full pt-20 pb-8 flex flex-col items-center bg-[#030508] border-t border-borderLight relative z-10 [.light_&]:bg-gray-50">

      {/* Dynamic Heading */}
      <div className="text-center w-full mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white [.light_&]:text-black">
          About Us
        </h2>
      </div>
      {/* Grid Layout */}
      <div className="max-w-[1200px] w-full px-8 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">

        {/* Column 1: Brand */}
        <div className="flex flex-col">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight [.light_&]:text-black">Vault<br />Sentinel</h3>
        </div>

        {/* Column 2: Platform */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold mb-2">Platform</h4>

          {/* Pricing (Click) */}
          <div
            className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max [.light_&]:text-gray-600 [.light_&]:hover:text-black"
            onClick={() => setActiveModal('pricing')}
          >
            Pricing
          </div>

          {/* Pitch (Link) */}
          <a
            href="#how-it-works-video"
            className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max inline-block [.light_&]:text-gray-600 [.light_&]:hover:text-black"
          >
            My pitch to you
          </a>

          {/* Team (Click / Expand) */}
          <div className="flex flex-col gap-2">
            <div
              className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max [.light_&]:text-gray-600 [.light_&]:hover:text-black"
              onClick={() => setShowTeam(!showTeam)}
            >
              Team
            </div>
            <AnimatePresence>
              {showTeam && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-1 -mt-1 ml-4 overflow-hidden"
                >
                  {["Param", "Ishant", "Riddhi", "Siddhi"].map((name) => (
                    <span key={name} className="text-lg text-accent-blue border-l border-accent-blue/30 pl-3 [.light_&]:text-blue-700 font-medium">
                      {name}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Socials */}
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold mb-2">Socials</h4>

          <a href="#" className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max">
            Twitter (X)
          </a>

          <a href="#" className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max">
            LinkedIn
          </a>

          <a href="#" className="text-muted text-sm hover:text-white transition-colors cursor-pointer w-max">
            GitHub
          </a>

          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-3 text-muted text-sm hover:text-white transition-colors cursor-pointer w-max [.light_&]:text-gray-600 [.light_&]:hover:text-black"
              onClick={() => setShowEmails(!showEmails)}
            >
              Email
            </div>
            <AnimatePresence>
              {showEmails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-1 -mt-1 ml-6 overflow-hidden"
                >
                  {[
                    "riddhi5mehrotra@gmail.com",
                    "siddhi5mehrotra@gmail.com",
                    "ishant28sharma@gmail.com",
                    "mehindruparam2412@gmail.com"
                  ].map((email) => (
                    <a key={email} href={`mailto:${email}`} className="text-sm text-accent-cyan hover:underline py-1 [.light_&]:text-blue-700">
                      {email}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <div className="w-full max-w-[1200px] h-[1px] bg-borderLight mb-6 mx-8"></div>

      <div className="w-full max-w-[1200px] px-8 mx-auto flex flex-col md:flex-row justify-between items-center text-[11px] text-muted">
        <span>© 2026 Vault Sentinel. All rights reserved.</span>
        <span className="text-accent-blue font-bold mt-4 md:mt-0 tracking-wide">Building 21st century open-source infrastructure</span>
      </div>

      {/* OVERLAY MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none`}
          >
            {/* Pricing Modal */}
            {activeModal === 'pricing' && (
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-[700px] bg-[#0A0D14] border border-accent-blue/40 rounded-2xl shadow-[0_0_50px_rgba(62,129,255,0.2)] p-10 pointer-events-auto relative [.light_&]:bg-white [.light_&]:border-gray-200"
              >
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 text-muted hover:text-white [.light_&]:text-gray-400 [.light_&]:hover:text-black"
                >
                  <X size={24} />
                </button>



                <ul className="flex flex-col gap-5 text-base text-gray-300 [.light_&]:text-gray-700 leading-relaxed font-medium">
                  <li className="flex items-start gap-4">
                    <span className="w-4 h-4 rounded bg-blue-600 shrink-0 mt-1" />
                    <div><span className="text-white font-bold [.light_&]:text-black">Starter</span> — ₹2L/month • Monthly recurring • Fintechs & small NBFCs (≤500 APIs)</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-4 h-4 rounded bg-blue-600 shrink-0 mt-1" />
                    <div><span className="text-white font-bold [.light_&]:text-black">Growth</span> — ₹6L/month • Monthly recurring • Mid-size banks (≤2,000 APIs)</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-4 h-4 rounded bg-blue-600 shrink-0 mt-1" />
                    <div><span className="text-white font-bold [.light_&]:text-black">Enterprise</span> — ₹15L+/month • Annual contract • Large banks, custom pricing</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-4 h-4 rounded bg-orange-600 shrink-0 mt-1" />
                    <div><span className="text-white font-bold [.light_&]:text-black">Security Audit</span> — ₹5L-₹25L • One-time, project-based • Full API estate audit</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-4 h-4 rounded bg-orange-600 shrink-0 mt-1" />
                    <div><span className="text-white font-bold [.light_&]:text-black">Compliance Pack</span> — ₹50,000/report • Pay-per-report • RBI & PCI-DSS documentation</div>
                  </li>
                </ul>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </footer>
  )
}
