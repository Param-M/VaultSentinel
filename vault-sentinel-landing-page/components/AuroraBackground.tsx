"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export interface WaveConfig {
  phase: number;
  speed: number;
  yFrac: number;
  ampFrac: number;
  thick: number;
  alpha: number;
  freq: number;
  color: [number, number, number];
}

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fade in canvas using GSAP
    gsap.fromTo(
      canvas,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: "power2.inOut" }
    );

    let width = 0;
    let height = 0;

    const centerY = 0.5;

    const waves: WaveConfig[] = [
      { // Broad soft glow
        phase: 0, speed: 0.00009, yFrac: centerY, ampFrac: 0.35, thick: 120, alpha: 0.30, freq: 0.001, color: [0, 160, 120]
      },
      { // Main bright ribbon
        phase: 1, speed: 0.00014, yFrac: centerY, ampFrac: 0.2, thick: 38, alpha: 1.0, freq: 0.0015, color: [0, 210, 155]
      },
      { // Secondary ribbon
        phase: 2, speed: 0.00010, yFrac: centerY, ampFrac: 0.25, thick: 30, alpha: 0.85, freq: 0.0012, color: [0, 180, 130]
      },
      { // Faint third
        phase: 3, speed: 0.00018, yFrac: centerY, ampFrac: 0.15, thick: 22, alpha: 0.55, freq: 0.002, color: [0, 150, 110]
      },
      { // Shimmer line
        phase: 4, speed: 0.00020, yFrac: centerY, ampFrac: 0.28, thick: 14, alpha: 0.70, freq: 0.0018, color: [80, 240, 185]
      }
    ];

    const resize = () => {
      width = window.innerWidth;
      // Anchor exclusively to bottom 50%
      height = window.innerHeight * 0.5;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      waves.forEach(w => {
        w.phase += w.speed * 16;
        
        const grad = ctx.createLinearGradient(0, height * (w.yFrac - w.ampFrac) - w.thick, 0, height * (w.yFrac + w.ampFrac) + w.thick);
        const [r, g, b] = w.color;
        
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${w.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        
        // Render top boundary of thick wave map
        for (let x = 0; x <= width; x += 5) {
          const sin1 = Math.sin(x * w.freq + w.phase);
          const sin2 = Math.sin(x * (w.freq * 0.7) - w.phase * 0.8);
          const yOffset = (sin1 + sin2) * height * w.ampFrac;
          const y = height * w.yFrac + yOffset - w.thick;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        // Render bottom boundary to close filled polygon path
        for (let x = width; x >= 0; x -= 5) {
          const sin1 = Math.sin(x * w.freq + w.phase);
          const sin2 = Math.sin(x * (w.freq * 0.7) - w.phase * 0.8);
          const yOffset = (sin1 + sin2) * height * w.ampFrac;
          const y = height * w.yFrac + yOffset + w.thick;
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Overlay pure black gradient from top bounding fade out blending
      const fadeGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      fadeGrad.addColorStop(0, "rgba(0,0,0,1)");
      fadeGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, 0, width, height * 0.4);

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[50vh] z-0 pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.015] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
        className="w-full h-full transform-origin-bottom"
        style={{ transformOrigin: "bottom center" }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </motion.div>
    </div>
  );
}
