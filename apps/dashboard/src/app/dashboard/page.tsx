"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useHiveState } from "../../hooks/useHiveState";

const WebGLContainer = dynamic(() => import("../../components/dashboard/WebGLContainer"), {
  ssr: false,
});

// --- CUSTOM HEARTBEAT GRAPH COMPONENT ---
const HeartbeatGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);
    let points: number[] = Array.from({ length: 40 }, () => height / 2);

    const resizeHandler = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", resizeHandler);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = "rgba(123, 44, 191, 0.05)";
      ctx.lineWidth = 1;
      const step = 15;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update Points (simulate cardiogram heartbeat)
      points.shift();
      const lastVal = points[points.length - 1];
      let newVal = height / 2;
      const r = Math.random();
      if (r < 0.05) {
        // High peak
        newVal = height / 4;
      } else if (r < 0.1) {
        // Low peak
        newVal = (3 * height) / 4;
      } else {
        // Stabilization
        newVal = lastVal + (height / 2 - lastVal) * 0.2 + (Math.random() - 0.5) * 4;
      }
      points.push(newVal);

      // Draw Wave Path
      ctx.beginPath();
      ctx.strokeStyle = "#990011"; // Deep Crimson
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#990011";
      ctx.shadowBlur = 8;
      
      const xInc = width / (points.length - 1);
      ctx.moveTo(0, points[0]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(i * xInc, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// --- CUSTOM NEURAL CORE CANVAS COMPONENT ---
const NeuralCore = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    const resizeHandler = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", resizeHandler);

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const mouseLeaveHandler = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseleave", mouseLeaveHandler);

    // Synaptic filament structure definition
    interface Filament {
      angle: number;
      length: number;
      speed: number;
      phase: number;
      width: number;
    }

    const filaments: Filament[] = Array.from({ length: 64 }, (_, i) => ({
      angle: (i * Math.PI * 2) / 64,
      length: 80 + Math.random() * 60,
      speed: 0.02 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
      width: 1 + Math.random() * 1.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw background ambient core glow
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        180
      );
      radialGlow.addColorStop(0, "rgba(153, 0, 17, 0.15)");
      radialGlow.addColorStop(0.3, "rgba(123, 44, 191, 0.08)");
      radialGlow.addColorStop(1, "rgba(4, 4, 4, 0)");
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
      ctx.fill();

      // Render drifting filaments
      filaments.forEach((fil) => {
        fil.phase += fil.speed;
        
        // Dynamically skew filaments towards cursor slightly on hover
        let targetAngle = fil.angle;
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - centerX;
          const dy = mouseRef.current.y - centerY;
          const mAngle = Math.atan2(dy, dx);
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 180) {
            targetAngle += (mAngle - fil.angle) * 0.08;
          }
        }

        const len = fil.length + Math.sin(fil.phase) * 15;
        const endX = centerX + Math.cos(targetAngle) * len;
        const endY = centerY + Math.sin(targetAngle) * len;

        // Draw bezier curves for organic neural filament look
        const cp1X = centerX + Math.cos(targetAngle + 0.1) * (len * 0.4);
        const cp1Y = centerY + Math.sin(targetAngle + 0.1) * (len * 0.4);
        const cp2X = centerX + Math.cos(targetAngle - 0.1) * (len * 0.7);
        const cp2Y = centerY + Math.sin(targetAngle - 0.1) * (len * 0.7);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
        ctx.strokeStyle = fil.angle > Math.PI 
          ? "rgba(153, 0, 17, 0.35)" // Crimson filament
          : "rgba(123, 44, 191, 0.35)"; // Purple filament
        ctx.lineWidth = fil.width;
        ctx.stroke();

        // Glowing synapse tip
        ctx.beginPath();
        ctx.arc(endX, endY, fil.width + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = fil.angle > Math.PI ? "#990011" : "#7B2CBF";
        ctx.shadowColor = fil.angle > Math.PI ? "#990011" : "#7B2CBF";
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw central core nucleus (pulsing brain node)
      const corePulse = 30 + Math.sin(Date.now() * 0.003) * 3;
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        corePulse
      );
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(0.2, "rgba(255, 0, 80, 0.95)");
      coreGradient.addColorStop(0.6, "rgba(153, 0, 17, 0.85)");
      coreGradient.addColorStop(1, "rgba(123, 44, 191, 0.0)");
      
      ctx.fillStyle = coreGradient;
      ctx.shadowColor = "rgba(153, 0, 17, 0.8)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw network orbit rings
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeHandler);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mouseleave", mouseLeaveHandler);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// --- CUSTOM 3D TERRAIN MESH COMPONENT ---
const TerrainMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    const resizeHandler = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", resizeHandler);

    // Render wireframe wavy mesh grid
    const cols = 20;
    const rows = 12;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 0, 80, 0.15)";
      ctx.lineWidth = 1;

      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);

      const time = Date.now() * 0.002;

      // Calculate z projection coordinates
      const points: { x: number; y: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const nx = c / (cols - 1);
          const ny = r / (rows - 1);

          // Dynamic offset heights
          const wave1 = Math.sin(nx * 5 + time) * 12;
          const wave2 = Math.cos(ny * 4 - time) * 8;
          const zOffset = wave1 + wave2;

          // Projection calculation
          const xProj = c * cellW + (ny - 0.5) * 30;
          const yProj = r * cellH + zOffset;

          points[r][c] = { x: xProj, y: yProj };
        }
      }

      // Draw horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(points[r][0].x, points[r][0].y);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      // Draw vertical lines
      ctx.strokeStyle = "rgba(123, 44, 191, 0.1)";
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(points[0][c].x, points[0][c].y);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// --- CORE DASHBOARD COMPONENT ---
export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    onlineAgentCount,
    latency,
    activeThreads,
    assignments,
    decisions,
    loading: stateLoading
  } = useHiveState();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  const userName = user?.fullName || "Hive Overlord";
  const userRole = user?.designation || "Administrator";

  // Validate active auth session
  useEffect(() => {
    if (!stateLoading && !user) {
      router.push("/signin");
    }
  }, [user, stateLoading, router]);

  // Update Telemetry Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false }) +
        " // " +
        now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (stateLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-violet animate-spin"></div>
          <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-semibold">
            SECURE LINK INITIALIZING...
          </span>
        </div>
      </div>
    );
  }

  const sidebarSection1 = [
    { label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" },
    { label: "Employees", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" },
    { label: "Departments", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2" },
    { label: "Projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
    { label: "Knowledge", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253" },
    { label: "Runtime", icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2" },
    { label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6" },
    { label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066" }
  ];

  const sidebarSection2 = [
    { label: "Workspace", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" },
    { label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341" },
    { label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/profile" }
  ];

  const handleSidebarClick = (link: { label: string; href?: string }) => {
    if (link.href) {
      router.push(link.href);
    } else {
      setActiveTab(link.label);
    }
  };

  return (
    <div className="min-h-screen bg-[#040404] text-zinc-100 flex flex-col font-sans relative select-none">
      
      {/* --- TOP GLOBAL HEADER (TOP BAR) --- */}
      <header className="h-20 border-b border-zinc-900 bg-[#050608]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        
        {/* Left Side: Breadcrumbs */}
        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
          <span>VECNA_OS</span>
          <span>//</span>
          <span className="text-zinc-400">CORE</span>
          <span>//</span>
          <span className="text-white font-bold">{activeTab}</span>
        </div>

        {/* Center: Search Box */}
        <div className="hidden md:flex items-center gap-2 relative max-w-xs w-full">
          <svg className="w-3.5 h-3.5 text-zinc-600 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Query Hive Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-850 text-[10px] font-sans text-zinc-300 focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-650"
          />
        </div>

        {/* Right Side: Quick Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button className="w-8 h-8 rounded-lg border border-zinc-850 bg-zinc-950/40 flex items-center justify-center text-zinc-450 hover:text-cyan hover:border-cyan/40 hover:shadow-[0_0_10px_rgba(94,249,255,0.15)] transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </button>

          {/* Notifications button */}
          <button className="w-8 h-8 rounded-lg border border-zinc-850 bg-zinc-950/40 flex items-center justify-center text-zinc-455 hover:text-purple hover:border-purple/40 relative transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341C7.67 7.165 7 8.388 7 11" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-crimson text-[7px] font-bold text-white flex items-center justify-center">
              12
            </span>
          </button>

          {/* User Avatar */}
          <a href="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-zinc-850 bg-zinc-950/30 hover:border-violet/30 hover:shadow-[0_0_15px_rgba(123,63,228,0.1)] transition-all">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-crimson to-violet p-[1.5px]">
              <div className="w-full h-full rounded-full bg-[#09070A] flex items-center justify-center text-[9px] font-mono text-zinc-400">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[9px] font-bold tracking-wide text-zinc-200 uppercase truncate max-w-[65px]">
                {userName}
              </span>
            </div>
          </a>
        </div>

      </header>

      {/* --- SIDEBAR & GRID LAYOUT CONTAINER --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="w-56 border-r border-zinc-900 bg-[#050608] flex flex-col p-4 hidden md:flex shrink-0 overflow-y-auto">
          
          {/* Vecna Logo in Sidebar */}
          <div className="flex items-center gap-3 mb-5 px-1.5">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-crimson">
              <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="6" />
              <path d="M50 25C68 20 82 30 82 45C82 58 68 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <path d="M50 25C32 20 18 30 18 45C18 58 32 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <path d="M35 15L50 5L65 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-[0.25em] text-white uppercase">VECNA AI</span>
              <span className="text-[7.5px] font-mono tracking-[0.2em] text-zinc-500 uppercase mt-0.5">HIVE MIND OS</span>
            </div>
          </div>

          {/* Search box in Sidebar */}
          <div className="relative mb-5 px-1">
            <svg className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-850 text-[10px] font-sans text-zinc-300 focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-650"
            />
          </div>

          <div className="border-t border-zinc-900/80 my-3" />

          {/* Navigation Section 1 */}
          <nav className="space-y-1">
            {sidebarSection1.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <button
                  key={link.label}
                  onClick={() => handleSidebarClick(link)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                    isActive 
                      ? "text-white bg-gradient-to-r from-crimson/15 to-violet/10 border-l-2 border-crimson" 
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950/40"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-crimson shadow-[0_0_10px_rgba(255,0,80,0.8)]"></span>
                  )}
                  
                  <svg className={`w-3.5 h-3.5 ${isActive ? "text-crimson" : "text-zinc-600 group-hover:text-zinc-400"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-zinc-900/80 my-3.5" />

          {/* Navigation Section 2 */}
          <nav className="space-y-1">
            {sidebarSection2.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <button
                  key={link.label}
                  onClick={() => handleSidebarClick(link)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                    isActive 
                      ? "text-white bg-gradient-to-r from-crimson/15 to-violet/10 border-l-2 border-crimson" 
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950/40"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-crimson shadow-[0_0_10px_rgba(255,0,80,0.8)]"></span>
                  )}
                  
                  <svg className={`w-3.5 h-3.5 ${isActive ? "text-crimson" : "text-zinc-600 group-hover:text-zinc-400"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ==================== SCROLLABLE WORKSPACE GRID ==================== */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#040404]">
          
          {/* ROW 1: PRIMARY GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Column 1: Overall Health & Agent Map (1 Column Width) */}
            <div className="xl:col-span-1 flex flex-col gap-8">
              
              {/* Sub-Panel 1: Hive Status Overall Health */}
              <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase">
                    HIVE STATUS // HEALTH
                  </h3>
                  <span className="text-[8px] text-zinc-500">•••</span>
                </div>
                
                {/* Value display */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-sans text-3xl font-extrabold text-white tracking-tight">{(100 - (latency / 12)).toFixed(1)}%</span>
                  <span className="text-[8px] font-mono text-green-500 tracking-wider uppercase border border-green-900/40 bg-green-950/20 px-2 py-0.5 rounded">
                    OPTIMAL
                  </span>
                </div>

                {/* Health Graph Line */}
                <div className="h-16 w-full bg-zinc-950/70 border border-zinc-900 rounded-lg overflow-hidden p-1">
                  <HeartbeatGraph />
                </div>

                {/* System check item list */}
                <div className="space-y-2 mt-4 pt-4 border-t border-zinc-900/60 text-[9px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Consciousness</span>
                    <span className="text-green-500 font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Neural Network</span>
                    <span className="text-zinc-300">98.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Knowledge Base</span>
                    <span className="text-zinc-300">97.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Memory Core</span>
                    <span className="text-green-500 font-semibold">98.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Agent Network</span>
                    <span className="text-zinc-300">99.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Infrastructure</span>
                    <span className="text-zinc-400">97.2%</span>
                  </div>
                </div>
              </div>

              {/* Sub-Panel 2: Agent Synchronization Map */}
              <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase">
                    AGENT SYNCHRONIZATION // MAP
                  </h3>
                  <span className="text-[8px] text-zinc-500">•••</span>
                </div>

                {/* Dotted Agent scatter representation */}
                <div className="h-28 w-full bg-zinc-950/70 border border-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(123,44,191,0.25)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  
                  {/* Glowing scatter points */}
                  <span className="absolute w-2 h-2 rounded-full bg-crimson shadow-[0_0_8px_#990011] top-1/4 left-1/3 animate-ping"></span>
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-crimson top-1/4 left-1/3"></span>
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-violet top-1/2 left-2/3"></span>
                  <span className="absolute w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#00E5FF] top-2/3 left-1/2 animate-pulse"></span>
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan top-2/3 left-1/2"></span>
                  <span className="absolute w-1 h-1 rounded-full bg-zinc-700 top-1/3 left-2/3"></span>
                  <span className="absolute w-1 h-1 rounded-full bg-zinc-700 top-3/4 left-1/4"></span>
                </div>

                {/* Status counts */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-2 text-[8px] font-mono text-center">
                  <div className="flex flex-col py-1 border-r border-zinc-900">
                    <span className="text-green-500 font-bold text-xs">23,847</span>
                    <span className="text-zinc-500 uppercase mt-0.5">SYNCED</span>
                  </div>
                  <div className="flex flex-col py-1 border-r border-zinc-900">
                    <span className="text-orange-500 font-bold text-xs">783</span>
                    <span className="text-zinc-500 uppercase mt-0.5">PROCESS</span>
                  </div>
                  <div className="flex flex-col py-1">
                    <span className="text-crimson font-bold text-xs">245</span>
                    <span className="text-zinc-500 uppercase mt-0.5">ISOLATED</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Column 2 & 3: The Hive Consciousness Neural Visualizer (2 Columns Width) */}
            <div className="xl:col-span-2 p-5 rounded-2xl border border-violet/15 bg-[#09070A]/30 backdrop-blur-sm flex flex-col justify-between min-h-[500px] relative overflow-hidden shadow-[0_0_30px_rgba(123,44,191,0.03)]">
              {/* Glowing decorative border overlay */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet/30 to-transparent"></div>

              {/* Panel Header */}
              <div className="flex justify-between items-center z-10">
                <div className="flex flex-col text-left">
                  <h2 className="font-sans text-base font-bold tracking-widest text-zinc-100 uppercase">
                    THE HIVE CONSCIOUSNESS
                  </h2>
                  <span className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase mt-1">
                    A LIVING DIGITAL ORGANISM
                  </span>
                </div>
                <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900">
                  SECURE // DECN_NODE_0
                </span>
              </div>

              {/* Dynamic Neural Canvas visual */}
              <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center">
                <WebGLContainer />
              </div>

              {/* Filament Node Indicators */}
              <div className="absolute top-[28%] left-[8%] flex flex-col gap-1 items-start z-10">
                <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase">AGENT</span>
                <span className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-widest">CLUSTERS</span>
                <span className="w-16 h-[1.5px] bg-gradient-to-r from-violet/40 to-transparent mt-1"></span>
              </div>
              
              <div className="absolute bottom-[28%] left-[8%] flex flex-col gap-1 items-start z-10">
                <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase">MEMORY</span>
                <span className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-widest">NODES</span>
                <span className="w-16 h-[1.5px] bg-gradient-to-r from-violet/40 to-transparent mt-1"></span>
              </div>

              <div className="absolute top-[28%] right-[8%] flex flex-col gap-1 items-end z-10 text-right">
                <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase">KNOWLEDGE</span>
                <span className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-widest">STREAMS</span>
                <span className="w-16 h-[1.5px] bg-gradient-to-l from-violet/40 to-transparent mt-1"></span>
              </div>

              <div className="absolute bottom-[28%] right-[8%] flex flex-col gap-1 items-end z-10 text-right">
                <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase">THOUGHT</span>
                <span className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-widest">PROCESSES</span>
                <span className="w-16 h-[1.5px] bg-gradient-to-l from-violet/40 to-transparent mt-1"></span>
              </div>

              {/* Dynamic Bottom Sync indicator */}
              <div className="flex justify-between items-end w-full mt-auto z-10">
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase">SYNCHRONIZATION</span>
                  <span className="font-sans text-sm font-bold text-white tracking-tight">98.7%</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase">GLOBAL HARMONY</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#00E5FF] animate-pulse"></span>
                    <span className="font-sans text-[9px] font-bold text-cyan tracking-wider uppercase">OPTIMIZED</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Column 4: Collective Intelligence & Live Activity (1 Column Width) */}
            <div className="xl:col-span-1 flex flex-col gap-8">
              
              {/* Sub-Panel 1: Collective Intelligence Overview */}
              <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase">
                    COLLECTIVE INTELLIGENCE
                  </h3>
                  <span className="text-[8px] text-zinc-500">•••</span>
                </div>

                {/* Dynamic Vector/Grid representation */}
                <div className="h-28 w-full bg-zinc-950/70 border border-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  {/* Concentric rings */}
                  <div className="absolute w-20 h-20 rounded-full border border-violet/10"></div>
                  <div className="absolute w-12 h-12 rounded-full border border-violet/20"></div>
                  <div className="absolute w-6 h-6 rounded-full border border-violet/30 bg-violet/5 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse"></span>
                  </div>
                  {/* Scope lines */}
                  <div className="absolute w-[2px] h-20 bg-violet/5"></div>
                  <div className="absolute w-20 h-[2px] bg-violet/5"></div>
                </div>

                {/* Expansion metrics */}
                <div className="space-y-2 mt-4 pt-3 border-t border-zinc-900/60 text-[9px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Knowledge Expansion</span>
                    <span className="text-cyan font-semibold">+2.45 TB/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Learning Rate</span>
                    <span className="text-zinc-200">1,247 ops/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Swarm Efficiency</span>
                    <span className="text-violet font-semibold">96.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Decision Confidence</span>
                    <span className="text-green-500 font-semibold">99.2%</span>
                  </div>
                </div>
              </div>

              {/* Sub-Panel 2: Distributed Reasoning Live Activity */}
              <div className="p-5 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase">
                    DISTRIBUTED REASONING // LIVE
                  </h3>
                  <span className="text-[8px] text-zinc-500">•••</span>
                </div>

                {/* Oscillating mesh visual */}
                <div className="h-24 w-full bg-zinc-950/70 border border-zinc-900 rounded-lg overflow-hidden p-1">
                  <TerrainMesh />
                </div>

                {/* Activity list */}
                <div className="space-y-2 mt-4 pt-2 text-[9px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet"></span>
                      Problem Solving
                    </span>
                    <span className="text-zinc-200">35.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      Data Analysis
                    </span>
                    <span className="text-zinc-200">28.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-crimson"></span>
                      Hypothesis Testing
                    </span>
                    <span className="text-zinc-200">18.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan"></span>
                      Knowledge Mining
                    </span>
                    <span className="text-zinc-200">17.3%</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ROW 2: MINI 4-PANEL GRIDS + INFRA & SPECIES PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
            
            {/* Panel 1: Neural Activity */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                NEURAL ACTIVITY
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">{((activeThreads * 0.05) + 5.21).toFixed(2)}M</span>
                <span className="text-[9px] text-zinc-500 font-mono">Signals/s</span>
              </div>
              <span className="block text-[8px] font-semibold text-crimson uppercase tracking-widest mt-1">
                ▲ LIVE FEED ACTIVE
              </span>
            </div>

            {/* Panel 2: Knowledge Expansion */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                KNOWLEDGE EXPANSION
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">+12.4 TB</span>
                <span className="text-[9px] text-zinc-500 font-mono">24H growth</span>
              </div>
              <span className="block text-[8px] font-semibold text-violet uppercase tracking-widest mt-1">
                ● SYNCED SUCCESSFULLY
              </span>
            </div>

            {/* Panel 3: Memory Utilization */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                MEMORY UTILIZATION
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">{(85.4 + (activeThreads * 0.015)).toFixed(1)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">total capacity</span>
              </div>
              <span className="block text-[8px] font-semibold text-cyan uppercase tracking-widest mt-1">
                ■ CACHE ALLOCATED
              </span>
            </div>

            {/* Panel 4: Task Evolution */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                TASK EVOLUTION
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">{2840 + assignments.length}</span>
                <span className="text-[9px] text-zinc-500 font-mono">active workflows</span>
              </div>
              <span className="block text-[8px] font-semibold text-green-500 uppercase tracking-widest mt-1">
                ◆ EVOLVING AUTONOMOUSLY
              </span>
            </div>

            {/* Panel 5: Infrastructure Globe */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                INFRASTRUCTURE
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">{Math.floor(onlineAgentCount / 85)}</span>
                <span className="text-[9px] text-zinc-500 font-mono">nodes online</span>
              </div>
              <span className="block text-[8px] font-semibold text-violet uppercase tracking-widest mt-1">
                ▲ GLOBAL COVERAGE
              </span>
            </div>

            {/* Panel 6: Digital Organism */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-[#09070A]/30 flex flex-col justify-between min-h-[110px]">
              <span className="block font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
                DIGITAL ORGANISM
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-white tracking-tight">THRIVING</span>
                <span className="text-[9px] text-zinc-500 font-mono">overall status</span>
              </div>
              <span className="block text-[8px] font-semibold text-green-500 uppercase tracking-widest mt-1">
                ● ALL SYSTEMS OPERATIONAL
              </span>
            </div>

          </div>

          {/* ROW 3: BOTTOM GRID FLOW MAP & AGENTS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Column 1 & 2: Global Hive Activity Map (2 Columns Width) */}
            <div className="xl:col-span-2 p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col justify-between shadow-[0_0_20px_rgba(123,44,191,0.02)] min-h-[320px]">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
                <div className="flex flex-col text-left">
                  <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase">
                    GLOBAL HIVE ACTIVITY
                  </h3>
                  <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase mt-0.5">
                    REAL-TIME INTELLIGENCE FLOW
                  </span>
                </div>
                <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase">
                  GEO_GRID // SYNCHRONIZED
                </span>
              </div>

              {/* Dotted Global map vector with glowing arcs */}
              <div className="flex-1 w-full bg-zinc-950/40 border border-zinc-900/60 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(rgba(123,44,191,0.2)_1.5px,transparent_1.5px)] bg-[size:16px_16px]" />
                
                {/* Visual Dotted World map representation */}
                <svg className="w-full h-full max-h-[160px] text-zinc-800" viewBox="0 0 1000 500" fill="currentColor">
                  {/* North America */}
                  <path d="M150 150h120v60h-60v40h-60z" opacity="0.3"/>
                  {/* South America */}
                  <path d="M220 280h60v120h-30v-40h-30z" opacity="0.3"/>
                  {/* Europe */}
                  <path d="M480 120h120v60h-60v40h-60z" opacity="0.3"/>
                  {/* Africa */}
                  <path d="M490 220h80v100h-40v-40h-40z" opacity="0.3"/>
                  {/* Asia */}
                  <path d="M620 100h200v120h-80v60h-120z" opacity="0.3"/>
                  {/* Australia */}
                  <path d="M800 350h80v60h-40v-20h-40z" opacity="0.3"/>

                  {/* Flow links (arcs) */}
                  <path d="M200 180 Q 380 120, 520 160" stroke="#990011" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  <path d="M520 160 Q 640 100, 750 160" stroke="#7B2CBF" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  <path d="M750 160 Q 600 300, 840 380" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

                  {/* Node locations */}
                  <circle cx="200" cy="180" r="4" fill="#990011" />
                  <circle cx="520" cy="160" r="4" fill="#7B2CBF" />
                  <circle cx="750" cy="160" r="4" fill="#00E5FF" />
                  <circle cx="840" cy="380" r="4" fill="#00E5FF" />
                </svg>

                {/* Sidebar statistics of the map */}
                <div className="absolute right-4 bottom-4 bg-[#09070A]/95 border border-zinc-800/80 px-3 py-2 rounded-lg font-mono text-[8px] text-zinc-500 space-y-1">
                  <div>DATA FLOW: <span className="text-white">2.78 PB/s</span></div>
                  <div>COMMUNICATIONS: <span className="text-white">1.24M msg/s</span></div>
                  <div>ACTIVE CONNECTIONS: <span className="text-white">98.3M</span></div>
                  <div>GLOBAL COVERAGE: <span className="text-cyan font-bold">99.97%</span></div>
                </div>
              </div>
            </div>

            {/* Column 3: Top Agent Clusters (1 Column Width) */}
            <div className="xl:col-span-1 p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-sm flex flex-col justify-between shadow-[0_0_20px_rgba(123,44,191,0.02)] min-h-[320px]">
              <div className="border-b border-zinc-900 pb-3 mb-4">
                <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase">
                  TOP AGENT CLUSTERS
                </h3>
                <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase mt-0.5">
                  BY OPERATIONAL ACTIVITY
                </span>
              </div>

              {/* Clusters list representation */}
              <div className="space-y-3 font-mono text-[9px] text-zinc-400">
                <div className="flex justify-between py-1.5 border-b border-zinc-900/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-crimson"></span>
                    Research & Discovery
                  </span>
                  <span className="text-zinc-200">{Math.floor(onlineAgentCount * 0.326).toLocaleString()} (32.6%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet"></span>
                    Data Intelligence
                  </span>
                  <span className="text-zinc-200">{Math.floor(onlineAgentCount * 0.238).toLocaleString()} (23.8%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan"></span>
                    Creative Synthesis
                  </span>
                  <span className="text-zinc-200">{Math.floor(onlineAgentCount * 0.179).toLocaleString()} (17.9%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet"></span>
                    Strategic Planning
                  </span>
                  <span className="text-zinc-200">{Math.floor(onlineAgentCount * 0.137).toLocaleString()} (13.7%)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                    System Optimization
                  </span>
                  <span className="text-zinc-200">{Math.floor(onlineAgentCount * 0.120).toLocaleString()} (12.0%)</span>
                </div>
              </div>

              {/* Bottom decorative graph block */}
              <div className="h-12 w-full mt-4 bg-zinc-950/70 border border-zinc-900 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                <div className="w-full h-full opacity-20 bg-[radial-gradient(rgba(123,44,191,0.2)_1px,transparent_1px)] bg-[size:6px_6px] absolute"></div>
                <svg className="w-full h-full text-violet" viewBox="0 0 100 30" preserveAspectRatio="none" fill="none">
                  <path d="M0 25 Q15 5, 30 20 T60 10 T90 25 L100 25 L100 30 L0 30 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
                </svg>
              </div>
            </div>

          </div>

        </main>

      </div>

      {/* --- TELEMETRY FOOTER BAR --- */}
      <footer className="h-10 border-t border-zinc-900 bg-[#040404] px-6 flex items-center justify-between text-[8px] font-mono text-zinc-600 tracking-[0.2em] z-10 shrink-0">
        <span>AUTHENTICATION TOKEN: SECURE_JWT_OK</span>
        <span>HIVE CORE PROTOCOL: V1.0.4-α_ACTIVE</span>
      </footer>

    </div>
  );
}
