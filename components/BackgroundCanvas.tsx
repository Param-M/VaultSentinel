"use client";

import { motion } from 'framer-motion';

export default function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 min-h-screen w-full -z-50 pointer-events-none overflow-hidden transition-colors duration-700 bg-black [.light_&]:bg-white">
      {/* Animated Gradient at Bottom Half */}
      {/* 0% bottom, transparent at 50% height */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(to top, #1E67C6 0%, transparent 50%)",
            "linear-gradient(to top, #3b82f6 0%, transparent 50%)",
            "linear-gradient(to top, #60a5fa 0%, transparent 50%)",
            "linear-gradient(to top, #2563eb 0%, transparent 50%)",
            "linear-gradient(to top, #1E67C6 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-80 [.light_&]:opacity-80"
      />
    </div>
  );
}
