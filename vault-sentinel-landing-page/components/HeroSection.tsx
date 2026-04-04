"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import LiveStatistics from "./LiveStatistics";
import GoogleMeetIcon from "./GoogleMeetIcon";
import TerminalScan from "./TerminalScan";
import gsap from "gsap";

export default function HeroSection({ onOpenCalendar }: { onOpenCalendar?: () => void }) {
  const [clicked, setClicked] = useState(false);

  const handleCall = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      onOpenCalendar?.();
    }, 200);
  };

  return (
    <section id="hero" className="w-full flex-col min-h-[90vh] pt-32 pb-12 flex items-center justify-center relative">
      <div className="max-w-[1300px] w-full px-8 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10 relative">
        {/* Left Side: Copy & CTA */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col items-center lg:items-start w-full mb-6 relative"
          >
            {/* Pill Badge */}
            <div className="flex items-center gap-2 bg-[#0c1322] border border-accent-blue/30 text-accent-blue rounded-full px-4 py-1.5 text-[0.7rem] font-bold [.light_&]:bg-[#e0e7ff] [.light_&]:border-blue-300 [.light_&]:text-[#1e3a8a] shadow-[0_0_15px_rgba(62,129,255,0.2)] [.light_&]:shadow-none">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse [.light_&]:bg-[#2563eb]" />
              Next-Gen API Security for Finance
            </div>
          </motion.div>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-[1.05rem] md:text-[1.15rem] text-muted max-w-[500px] mb-10 leading-[1.6]"
          >
            Vault Sentinel combines static analysis with advanced AI scoring to identify, quarantine, and neutralize dormant and vulnerable APIs in the banking sector.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start"
          >
            <button
              onClick={handleCall}
              className={`px-8 py-4 rounded-full text-[15px] font-bold flex items-center justify-center gap-3 transition-colors duration-200 ${
                clicked
                  ? 'bg-accent-green text-white scale-[0.98]'
                  : 'bg-accent-blue text-white hover:bg-accent-cyan shadow-[0_4px_20px_rgba(62,129,255,0.4)]'
              }`}
            >
              Get Access
            </button>
            <a href="#how-it-works-video" className="px-8 py-4 rounded-full text-[15px] font-bold flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 [.light_&]:bg-gray-100 [.light_&]:border-gray-200 [.light_&]:text-black">
              Watch Video
            </a>
          </motion.div>
        </div>

        {/* Right Side: Terminal Scan Animation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex justify-center lg:justify-end w-full"
        >
          <TerminalScan />
        </motion.div>
      </div>

      <LiveStatistics />
    </section>
  );
}

function AnimatedHeadline() {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lettersRef.current,
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.6,
          ease: "circ.out",
          stagger: 0.04,
          delay: 0.3,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const guardianWord = "Guardian";
  const staticWords = "Every door in your bank deserves a".split(" ");

  return (
    <h1
      className="font-playfair text-[3.5rem] md:text-[5rem] font-bold tracking-tight leading-[1] mb-6 text-foreground flex flex-wrap justify-center lg:justify-start gap-x-3 md:gap-x-4"
    >
      {staticWords.map((word, i) => (
        <span key={i} className="inline-block">
          {word}
        </span>
      ))}
      <span className="inline-flex overflow-hidden pb-1" style={{ verticalAlign: 'bottom' }}>
        {guardianWord.split("").map((char, index) => (
          <span
            key={index}
            ref={(el) => {
              if (el) lettersRef.current[index] = el;
            }}
            className="inline-block"
            style={{
              backgroundImage: "linear-gradient(to right, #6366F1, #3B82F6)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(62,129,255,0.4))",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </h1>
  );
}
