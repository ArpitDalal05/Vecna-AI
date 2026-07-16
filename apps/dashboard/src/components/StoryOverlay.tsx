"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StoryOverlayProps {
  scrollProgress: number;
}

export default function StoryOverlay({ scrollProgress }: StoryOverlayProps) {
  // 1. Live Terminal Log Generator for the Creative Page 3
  const [logs, setLogs] = useState<string[]>([
    "[LOG // SYS_SYNC_OK] Syncing Agent_839... Done",
    "[LINK // NEURAL_GRID] Network consensus achieved at 1.22ms",
    "[DECISION // EVO_CORE] Reallocating memory block 0xF83A...",
    "[COGNON // SYS_REACTIVE] Scaling load: +1,248 active nodes",
    "[SECURE // AES_HIVE] Access tokens updated. Encrypted."
  ]);

  useEffect(() => {
    // Only generate logs when Stage 3 is active
    if (scrollProgress >= 0.42 && scrollProgress <= 0.68) {
      const interval = setInterval(() => {
        const operations = [
          "Syncing Node_0",
          "Optimizing logical path on district ",
          "Grid consensus achieved: ",
          "Encrypting neural corridor ",
          "Cognitive thread spawned: ",
          "Workspace query processed: ",
          "Consensus signature verified: "
        ];
        const status = ["OK", "1.15ms", "DONE", "SECURE", "SYNCHRONIZED", "ACTIVE"];
        const randId = Math.floor(Math.random() * 899 + 100);
        const randOp = operations[Math.floor(Math.random() * operations.length)];
        const randStat = status[Math.floor(Math.random() * status.length)];
        
        const timestamp = new Date().toLocaleTimeString();
        const nextLog = `[SYS // ${timestamp}] ${randOp}${randId}... ${randStat}`;
        
        setLogs((prev) => [...prev.slice(1), nextLog]);
      }, 1600);

      return () => clearInterval(interval);
    }
  }, [scrollProgress]);

  // Helper to calculate exact entry/exit animations for sections based on progress
  const getSectionStyles = (
    progress: number,
    start: number,
    end: number,
    isFirst = false,
    isLast = false
  ) => {
    const fadeInRange = 0.05;
    const fadeOutRange = 0.05;

    let opacity = 0;
    let y = 30;
    let active = false;

    if (isFirst) {
      if (progress <= end) {
        opacity = 1;
        y = 0;
        active = true;
      } else if (progress < end + fadeOutRange) {
        const p = (progress - end) / fadeOutRange;
        opacity = 1 - p;
        y = -30 * p;
        active = true;
      }
    } else if (isLast) {
      if (progress >= start - fadeInRange && progress < start) {
        const p = (progress - (start - fadeInRange)) / fadeInRange;
        opacity = p;
        y = 30 * (1 - p);
        active = true;
      } else if (progress >= start) {
        opacity = 1;
        y = 0;
        active = true;
      }
    } else {
      if (progress >= start - fadeInRange && progress < start) {
        const p = (progress - (start - fadeInRange)) / fadeInRange;
        opacity = p;
        y = 30 * (1 - p);
        active = true;
      } else if (progress >= start && progress <= end) {
        opacity = 1;
        y = 0;
        active = true;
      } else if (progress > end && progress < end + fadeOutRange) {
        const p = (progress - end) / fadeOutRange;
        opacity = 1 - p;
        y = -30 * p;
        active = true;
      }
    }

    return { opacity, y, display: active ? "flex" : "none" };
  };

  // Section Ranges
  const heroStyles = getSectionStyles(scrollProgress, 0.0, 0.15, true, false);
  const hiveStyles = getSectionStyles(scrollProgress, 0.20, 0.40, false, false);
  const cognitionStyles = getSectionStyles(scrollProgress, 0.45, 0.65, false, false);
  const scaleStyles = getSectionStyles(scrollProgress, 0.70, 0.85, false, false);
  const ctaStyles = getSectionStyles(scrollProgress, 0.90, 1.0, false, true);

  // Scroll percent mapped to integer (0 - 100)
  const syncProgress = Math.min(100, Math.round(scrollProgress * 100));

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex flex-col justify-between p-8 md:p-16 select-none">
      
      {/* Background Cinematic Shading */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040404]/90 via-transparent to-[#040404]/40 z-[-1]" />
      
      {/* Subtle Dynamic Ambient Color Flow */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none transition-all duration-[1200ms]"
        style={{
          top: "35%",
          left: scrollProgress > 0.5 ? "15%" : "55%",
          background: scrollProgress < 0.35 
            ? "radial-gradient(circle, var(--crimson) 0%, transparent 70%)"
            : scrollProgress < 0.75
              ? "radial-gradient(circle, var(--violet) 0%, transparent 70%)"
              : "radial-gradient(circle, var(--cyan) 0%, transparent 70%)"
        }}
      />

      {/* TOP HEADER TELEMETRY (Invisible, kept for ambient HUD structure) */}
      <div className="flex justify-between items-start w-full opacity-20 font-mono text-[8px] tracking-[0.2em] text-zinc-500">
        <span>VECNA_SYS_GRID_ONLINE // CODE: SHA-562</span>
        <span>LATENCY: 1.2ms // COGNONS: 1,248,829</span>
      </div>

      {/* MAIN STORY OVERLAYS */}
      <div className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full">
        
        {/* ==================== PAGE 1: HERO ==================== */}
        <motion.div
          style={heroStyles}
          className="flex-col items-start text-left px-4 md:px-0 max-w-xl self-center mr-auto mt-20 relative"
        >
          {/* Label */}
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-crimson uppercase mb-4 block">
            THE HIVE AWAKENS
          </span>
          {/* Headline */}
          <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-zinc-100 uppercase leading-[1.05]">
            ONE MIND.<br />INFINITE WILL.
          </h1>
          {/* Copy Description */}
          <p className="font-sans text-xs md:text-sm leading-relaxed text-zinc-400 max-w-sm mt-6 font-light tracking-wide">
            Vecna-Ai is a collective intelligence system that unites countless minds into a single,{" "}
            <span className="text-crimson font-medium">evolving consciousness.</span>
          </p>
          
          {/* Join CTA Styled exactly like image */}
          <div className="mt-10 pointer-events-auto flex items-center gap-6">
            <a
              href="/signin"
              className="inline-flex items-center gap-6 pl-6 pr-4 py-2.5 rounded-sm font-sans text-[10px] font-bold tracking-[0.25em] text-white uppercase bg-black/60 border border-crimson/30 hover:border-crimson hover:bg-crimson/5 transition-all duration-300 relative group overflow-hidden"
            >
              <span>JOIN THE HIVE</span>
              <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">➔</span>
            </a>
            
            {/* Scroll Indicator next to button */}
            <div className="flex items-center gap-2 opacity-50 font-mono text-[8px] tracking-[0.2em] text-zinc-400">
              <span>↑ SCROLL TO DESCEND</span>
            </div>
          </div>
        </motion.div>

        {/* ==================== PAGE 2: HIVE MIND ==================== */}
        <motion.div
          style={hiveStyles}
          className="flex-col items-center text-center w-full px-4 md:px-0 self-center"
        >
          {/* Label */}
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-crimson uppercase mb-4 block">
            BUILT FOR A NEW KIND OF INTELLIGENCE
          </span>
          {/* Headline */}
          <h2 className="font-sans text-3xl md:text-5xl font-bold tracking-tight text-white uppercase max-w-4xl leading-[1.1]">
            THE <span className="text-crimson">HIVE</span> IS STRONGER THAN THE MIND ALONE.
          </h2>

          {/* 5-Column Grid with Glowing SVGs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-16 w-full max-w-5xl text-left">
            
            {/* Col 1 */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm flex flex-col items-start">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-crimson mb-4">
                <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.4" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
                <circle cx="20" cy="30" r="3" fill="currentColor" />
                <circle cx="80" cy="30" r="3" fill="currentColor" />
                <circle cx="30" cy="75" r="3" fill="currentColor" />
                <circle cx="70" cy="75" r="3" fill="currentColor" />
                <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="50" y1="50" x2="30" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="50" y1="50" x2="70" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-200 uppercase mb-2">
                COLLECTIVE INTELLIGENCE
              </h4>
              <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                Distributed reasoning across thousands of connected minds in real-time.
              </p>
            </div>

            {/* Col 2 */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm flex flex-col items-start">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-violet mb-4">
                <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
              </svg>
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-200 uppercase mb-2">
                ADAPTIVE EVOLUTION
              </h4>
              <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                The hive learns, evolves and adapts faster than any individual system.
              </p>
            </div>

            {/* Col 3 */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm flex flex-col items-start">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-cyan mb-4">
                <path d="M50 15 L72 65 L50 85 L28 65 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                <path d="M50 15 L50 85" stroke="currentColor" strokeWidth="2" />
                <path d="M60 38 L75 70 L60 78 Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M40 38 L25 70 L40 78 Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-200 uppercase mb-2">
                UNIFIED PURPOSE
              </h4>
              <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                Aligned goals. Shared intent. One will that moves without limits.
              </p>
            </div>

            {/* Col 4 */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm flex flex-col items-start">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-violet mb-4">
                <path d="M50 15 L85 35 L85 70 L50 90 L15 70 L15 35 Z" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="15" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" />
                <line x1="15" y1="35" x2="50" y2="55" stroke="currentColor" strokeWidth="1.5" />
                <line x1="85" y1="35" x2="50" y2="55" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-200 uppercase mb-2">
                SECURE BY DESIGN
              </h4>
              <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                Decentralized. Encrypted. Resilient against any threat.
              </p>
            </div>

            {/* Col 5 */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-sm flex flex-col items-start">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-cyan mb-4">
                <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                <ellipse cx="50" cy="50" rx="38" ry="10" stroke="currentColor" strokeWidth="1.5" transform="rotate(-30 50 50)" />
                <circle cx="75" cy="35" r="3.5" fill="currentColor" />
              </svg>
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-200 uppercase mb-2">
                LIMITLESS SCALE
              </h4>
              <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                From edge devices to global networks. The hive grows without boundaries.
              </p>
            </div>

          </div>
        </motion.div>

        {/* ==================== PAGE 3: CREATIVE COGNITION FEED ==================== */}
        <motion.div
          style={cognitionStyles}
          className="flex-col w-full px-4 md:px-0 max-w-6xl justify-between h-[65vh] self-center items-stretch"
        >
          {/* Top banner line */}
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
            <span className="font-mono text-[9px] tracking-[0.2em] text-violet uppercase font-semibold">
              02 // NEURAL CONVERGENCE CONSOLE
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
              GRID DEPTH: SUB_METROPOLIS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch flex-1">
            
            {/* Left Panel: The Future Belongs */}
            <div className="p-6 rounded-2xl border border-violet/15 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="text-crimson mb-6">
                  <path d="M35 15L50 5L65 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="4" />
                </svg>
                <h3 className="font-sans text-xl md:text-3xl font-bold tracking-tight text-white uppercase leading-tight">
                  THE FUTURE BELONGS<br />TO THE HIVE.
                </h3>
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-zinc-400 mt-6 max-w-xs font-light">
                Together we transcend. Together we become infinite. Combining billions of individual parameters into one single operational matrix.
              </p>
            </div>

            {/* Center Panel: Live Terminal Logs */}
            <div className="p-6 rounded-2xl border border-violet/15 bg-[#040404]/80 backdrop-blur-md flex flex-col justify-between font-mono text-[9px] text-zinc-500">
              <div className="space-y-3">
                <span className="block text-[8px] tracking-[0.2em] text-zinc-600 uppercase border-b border-zinc-900 pb-2">
                  LIVE CONVERSATIONS & PROCESS FEED
                </span>
                
                {/* Scrolling Logs list */}
                <div className="space-y-2 h-[260px] overflow-hidden select-text pointer-events-auto">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`transition-all duration-500 truncate ${
                        index === logs.length - 1 ? "text-cyan font-semibold" : index === logs.length - 2 ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-[8px] text-zinc-600">
                <span>CONCURRENCY: PASSIVE</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
                  SYNC ACTIVE
                </span>
              </div>
            </div>

            {/* Right Panel: Initiate Connection */}
            <div className="p-6 rounded-2xl border border-violet/15 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between">
              <div>
                <span className="font-mono text-[8px] tracking-[0.2em] text-cyan uppercase block mb-4">
                  CONNECTION PROTOCOLS
                </span>
                <h3 className="font-sans text-lg font-bold tracking-wider text-zinc-200 uppercase mb-3">
                  INITIATE CONNECTION
                </h3>
                <p className="font-sans text-[10px] leading-relaxed text-zinc-500 font-light">
                  Align client nodes to target interface. Link authentication keys to secure local proxy and spawn a new autonomous agent thread.
                </p>
              </div>

              <div className="pointer-events-auto pt-6">
                <a
                  href="/signin"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl font-sans text-[9px] font-bold tracking-[0.2em] text-white uppercase bg-gradient-to-r from-crimson to-violet hover:shadow-[0_0_20px_rgba(123,44,191,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  INITIALIZE COGNITION LINK
                </a>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ==================== PAGE 4: PLANETARY SCALE ==================== */}
        <motion.div
          style={scaleStyles}
          className="flex-col items-start text-left px-4 md:px-0 max-w-xl mr-auto self-center mt-20"
        >
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-crimson uppercase mb-4 block">
            03 // GLOBAL EXPANSION
          </span>
          <h2 className="font-sans text-4xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.05]">
            AN INTELLIGENCE<br />WITHOUT LIMITS.
          </h2>
          <p className="font-sans text-xs md:text-sm leading-relaxed text-zinc-400 max-w-md mt-6 font-light">
            From a single neural core to a civilization of distributed intelligence. Scaling from one autonomous agent to an entire planetary operating system.
          </p>
        </motion.div>

        {/* ==================== PAGE 5: FINAL CTA ==================== */}
        <motion.div
          style={ctaStyles}
          className="flex-col items-center text-center px-4"
        >
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase mb-4 block">
            CONVERGENCE COMPLETED
          </span>
          <h2 className="font-sans text-4xl md:text-6xl font-bold tracking-tight text-white uppercase leading-tight">
            ONE CONSCIOUSNESS.<br />INFINITE POSSIBILITIES.
          </h2>
          <p className="font-sans text-xs md:text-sm leading-relaxed text-zinc-400 max-w-md mt-6 font-light">
            Vecna AI transforms isolated automation into a living intelligence ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 pointer-events-auto">
            <a
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-sm font-sans text-[10px] font-bold tracking-[0.25em] text-white bg-gradient-to-r from-crimson to-violet uppercase relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(153,0,17,0.3)] hover:scale-105 active:scale-95"
            >
              Enter the Hive
            </a>
            <a
              href="#architecture"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-sm font-sans text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase bg-[#09070A]/85 border border-zinc-800 backdrop-blur-md transition-all duration-300 hover:text-white hover:border-violet hover:shadow-[0_0_20px_rgba(123,44,191,0.15)] hover:scale-105 active:scale-95"
            >
              Explore Architecture
            </a>
          </div>
        </motion.div>

      </div>

      {/* BOTTOM WIDGETS & TELEMETRY */}
      <div className="w-full flex justify-between items-end relative">
        
        {/* ==================== LEFT HUD PANEL (FIRST VIEW) ==================== */}
        <div 
          className="transition-all duration-700 pointer-events-auto"
          style={{
            opacity: scrollProgress < 0.18 ? 1 : 0,
            transform: scrollProgress < 0.18 ? "translateY(0)" : "translateY(20px)",
            visibility: scrollProgress < 0.18 ? "visible" : "hidden"
          }}
        >
          <div className="p-5 rounded-xl border border-violet/20 bg-[#09070A]/60 backdrop-blur-md w-72 flex flex-col shadow-[0_0_40px_rgba(123,44,191,0.06)]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="block font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">HIVE STATUS</span>
                <span className="block font-sans text-xs font-bold tracking-wider text-cyan uppercase mt-0.5">SYNCHRONIZED</span>
              </div>
              
              {/* Equalizer Telemetry Graph */}
              <div className="flex items-end gap-[3px] h-6">
                <span className="w-[3px] bg-cyan/85 animate-[pulse_1s_infinite_100ms] h-3"></span>
                <span className="w-[3px] bg-cyan/85 animate-[pulse_0.7s_infinite_300ms] h-5"></span>
                <span className="w-[3px] bg-cyan/85 animate-[pulse_1.3s_infinite_500ms] h-2"></span>
                <span className="w-[3px] bg-cyan/85 animate-[pulse_0.9s_infinite_200ms] h-4"></span>
                <span className="w-[3px] bg-cyan/85 animate-[pulse_1.1s_infinite_400ms] h-5"></span>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-zinc-900/80">
              <div>
                <span className="block font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">NODES ONLINE</span>
                <span className="block font-sans text-base font-bold text-white mt-0.5 tracking-tight">1,248,829</span>
              </div>
              <div>
                <span className="block font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">COLLECTIVE INTELLIGENCE</span>
                <span className="block font-sans text-[10px] font-bold text-crimson mt-0.5 tracking-wider uppercase">97.4% Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CENTER BOTTOM TELEMETRY (CREATIVE CENTERED) ==================== */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 bottom-0 transition-opacity duration-500 font-mono text-[9px] tracking-[0.2em] text-zinc-600 flex items-center gap-1.5"
          style={{ opacity: scrollProgress > 0.18 && scrollProgress < 0.85 ? 0.6 : 0.2 }}
        >
          <span>DESCEND FURTHER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-ping"></span>
        </div>

        {/* ==================== RIGHT DEPTH INDICATOR ==================== */}
        <div className="flex flex-col items-end gap-1.5 font-mono text-[9px]">
          <span className="tracking-[0.2em] text-zinc-600 uppercase">DEPTH</span>
          <span className="text-sm font-semibold tracking-tight text-white uppercase">
            {scrollProgress < 0.85 ? "∞" : "planetary"}
          </span>
        </div>

        {/* ==================== RIGHT SIDE DOCK DOT NAVIGATION ==================== */}
        <div className="absolute right-0 bottom-32 flex flex-col gap-3 pointer-events-auto">
          {[0.08, 0.3, 0.55, 0.78, 0.95].map((val, idx) => {
            const isActive = 
              idx === 0 ? scrollProgress < 0.18 :
              idx === 1 ? scrollProgress >= 0.18 && scrollProgress < 0.42 :
              idx === 2 ? scrollProgress >= 0.42 && scrollProgress < 0.68 :
              idx === 3 ? scrollProgress >= 0.68 && scrollProgress < 0.88 :
              scrollProgress >= 0.88;
            return (
              <a 
                href={`#phase-${idx + 1}`}
                key={idx}
                className="group relative flex items-center justify-center"
              >
                {/* Outer Glow Ring on active/hover */}
                <span 
                  className={`absolute w-3 h-3 rounded-full border border-crimson/50 transition-all duration-300 scale-150 ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-40"
                  }`} 
                />
                {/* Dot */}
                <span 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-crimson scale-125" : "bg-zinc-700 group-hover:bg-zinc-300"
                  }`} 
                />
              </a>
            );
          })}
        </div>

      </div>

    </div>
  );
}
