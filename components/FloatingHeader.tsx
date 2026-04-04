"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Moon, Sun, Shield } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function FloatingHeader({ onOpenCalendar }: { onOpenCalendar?: () => void }) {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Only hide if we aren't at the very top
    if (latest > 50) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }
  });

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    }
  }, [theme]);

  // Deep Skeuomorphic Glassmorphism styles
  const headerClasses = theme === 'dark' 
    ? 'bg-gradient-to-b from-[#1a2333]/40 to-[#0A0D14]/50 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5)] border-white/10' 
    : 'bg-gradient-to-b from-white/40 to-[#f4f6fa]/50 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.05)] border-gray-200/50';

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`w-[95%] max-w-[1200px] ${headerClasses} backdrop-blur-xl border rounded-[2rem] pointer-events-auto`}
      >
        <div className="px-8 py-3.5 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tight logo flex items-center gap-3 drop-shadow-md">
            <Shield className="text-accent-blue drop-shadow-[0_0_8px_rgba(62,129,255,0.5)]" size={24} />
            <div className="[.light_&]:text-gray-900">
              <span className="logo-vault">VAULT</span>{" "}
              <span className="logo-sentinel leading-none">SENTINEL</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-10 text-xs font-bold tracking-widest text-muted [.light_&]:text-gray-500 hover:[&>a]:text-foreground [.light_&]:hover:[&>a]:text-gray-900 transition-colors uppercase drop-shadow-sm">
            <a href="#hero" className="transition-colors">Home</a>
            <a href="#how-it-works" className="transition-colors">How it Works</a>
            <a href="#features" className="transition-colors">Features</a>
            <a href="#about-us" className="transition-colors">About Us</a>
          </nav>
          <div className="flex items-center gap-6">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-muted hover:text-foreground transition-colors [.light_&]:text-gray-500 [.light_&]:hover:text-gray-900">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={onOpenCalendar} 
              className="flex items-center gap-2 bg-gradient-to-b from-white to-gray-200 text-black px-5 py-2.5 rounded-full text-xs font-bold hover:from-gray-100 hover:to-gray-300 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-gray-300 active:scale-95"
            >
              CALL FOR DEMO
            </button>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
