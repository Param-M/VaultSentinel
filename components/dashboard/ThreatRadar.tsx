"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import * as d3 from "d3";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { subject: "SQLi", A: 120, fullMark: 150 },
  { subject: "DDoS", A: 98, fullMark: 150 },
  { subject: "Auth Brute", A: 86, fullMark: 150 },
  { subject: "XSS", A: 99, fullMark: 150 },
  { subject: "Zombie API", A: 130, fullMark: 150 },
];

export default function ThreatRadar() {
  const d3ContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt to connect socket
    const socket = io("http://localhost:3001", { reconnectionAttempts: 1 });
    // This serves as the Next.js mock integration requested by user
    socket.on("threat_update", () => {
       // Mock dynamically updating the Recharts data
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!d3ContainerRef.current) return;
    
    // D3 scanning line logic
    const width = 300;
    const height = 300;
    
    // Clear previous
    d3.select(d3ContainerRef.current).selectAll("*").remove();

    const svg = d3.select(d3ContainerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "none");

    const root = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw d3 radar scanner
    const sweep = root.append("path")
      .attr("d", d3.arc()({
        innerRadius: 0,
        outerRadius: 130,
        startAngle: 0,
        endAngle: Math.PI / 4
      }) as string)
      .attr("fill", "url(#sweep-gradient)")
      .attr("opacity", 0.6);

    // Gradient definitions
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "sweep-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
      
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(62,129,255,0.8)");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(62,129,255,0)");

    let angle = 0;
    const scanInterval = setInterval(() => {
      angle += 2;
      sweep.attr("transform", `rotate(${angle})`);
    }, 20);

    return () => clearInterval(scanInterval);
  }, []);

  return (
    <div className="w-full bg-alt border border-card-border rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
      <h3 className="text-xl font-bold mb-6 text-foreground w-full text-left">Vector Radar</h3>
      
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        {/* Recharts Base */}
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Threat Volume"
              dataKey="A"
              stroke="var(--accent-blue)"
              fill="var(--accent-blue)"
              fillOpacity={0.4}
            />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-alt)', borderColor: 'var(--border-color)' }} />
          </RadarChart>
        </ResponsiveContainer>

        {/* D3 Scanner Overlay */}
        <div ref={d3ContainerRef} className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none"></div>
      </div>
    </div>
  );
}
