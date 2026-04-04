"use client";

import { useEffect, useRef } from "react";

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bgCanvas = canvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animationFrameId: number;
    let hexes: any[] = [];

    const hexRadius = 26;
    const hexHeight = hexRadius * Math.sqrt(3);
    const cw = hexRadius * 1.5;
    const rh = hexHeight;
    const dotSpacing = 36;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initHexes();
    };

    const initHexes = () => {
      hexes = [];
      const cols = Math.ceil(width / cw) + 2;
      const rows = Math.ceil(height / rh) + 2;
      for (let c = -2; c < cols; c++) {
        for (let r = -2; r < rows; r++) {
          let x = c * cw;
          let y = r * rh + (c % 2 !== 0 ? rh / 2 : 0);
          hexes.push({ c, r, x, y });
        }
      }
    };

    const drawHexPath = (context: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
    };

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#060812";
      ctx.fillRect(0, 0, width, height);

      let centerX = width / 2;
      let centerY = height / 2;
      let maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      // Layer 1 & 2
      hexes.forEach((h) => {
        let diagIdx = h.c + h.r;
        let wavePhase = diagIdx * 0.38 - time * 2.2;
        let diagonalWave = (Math.sin(wavePhase) + 1) / 2;

        let dx = h.x - centerX;
        let dy = h.y - centerY;
        let distFromCenter = Math.sqrt(dx * dx + dy * dy);

        let ripplePhase = (distFromCenter / maxDist) * 5 - time * 1.4;
        let ripple = ((Math.sin(ripplePhase) + 1) / 2) * 0.35;
        let finalGlow = diagonalWave * 0.7 + ripple * 0.3;

        let sr = 18 + (45 - 18) * finalGlow;
        let sg = 25 + (100 - 25) * finalGlow;
        let sb = 50 + (230 - 50) * finalGlow;
        let strokeAlpha = 0.04 + finalGlow * 0.26;

        drawHexPath(ctx, h.x, h.y, hexRadius);
        ctx.strokeStyle = `rgba(${Math.round(sr)},${Math.round(sg)},${Math.round(sb)},${strokeAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (finalGlow > 0.45) {
          let fillAlpha = 0.28 * (finalGlow - 0.45);
          ctx.fillStyle = `rgba(30,75,180,${fillAlpha.toFixed(3)})`;
          ctx.fill();
        }

        if (finalGlow > 0.78) {
          ctx.beginPath();
          ctx.arc(h.x, h.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100,160,255,1)`;
          ctx.fill();
        }
      });

      // Layer 3: Dot Matrix
      const dotCols = Math.ceil(width / dotSpacing) + 1;
      const dotRows = Math.ceil(height / dotSpacing) + 1;

      for (let c = 0; c < dotCols; c++) {
        for (let r = 0; r < dotRows; r++) {
          let x = c * dotSpacing;
          let y = r * dotSpacing;

          let appCol = x / cw;
          let appRow = y / rh;
          let diagIdx = appCol + appRow;

          let wavePhase = diagIdx * 0.38 - time * 2.2;
          let diagonalWave = (Math.sin(wavePhase) + 1) / 2;

          let dx = x - centerX;
          let dy = y - centerY;
          let distFromCenter = Math.sqrt(dx * dx + dy * dy);

          let ripplePhase = (distFromCenter / maxDist) * 5 - time * 1.4;
          let ripple = ((Math.sin(ripplePhase) + 1) / 2) * 0.35;
          let finalGlow = diagonalWave * 0.7 + ripple * 0.3;

          let dotAlpha = 0.04 + finalGlow * 0.24;

          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(60,110,210,${dotAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // Layer 4: Vignette
      let vigGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        maxDist * 0.12,
        centerX,
        centerY,
        maxDist * 0.88
      );
      vigGrad.addColorStop(0, "rgba(2,4,12,0)");
      vigGrad.addColorStop(1, "rgba(2,4,12,0.68)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      time += 0.018;
      animationFrameId = requestAnimationFrame(renderCanvas);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    renderCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 bg-[#060812]"
      style={{ pointerEvents: "none" }}
    />
  );
}
