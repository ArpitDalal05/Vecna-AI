"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopbarProps {
  userName: string;
  userRole: string;
}

export default function Topbar({ userName, userRole }: TopbarProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [time, setTime] = useState("");

  useEffect(() => {
    // Generate breadcrumbs from active path
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = ["VECNA", ...parts.map((p) => p.toUpperCase())];
    setBreadcrumbs(crumbs);
  }, [pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 border-b border-zinc-900 bg-[#050608]/80 backdrop-blur-md flex items-center justify-between px-8 z-20 sticky top-0">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <span className="text-zinc-800">//</span>}
            <span className={idx === breadcrumbs.length - 1 ? "text-cyan font-bold" : ""}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions (Search, Theme Toggle, Notifications, User Avatar) */}
      <div className="flex items-center gap-5">
        
        {/* Telemetry Clock */}
        <span className="hidden md:inline font-mono text-[9px] tracking-widest text-zinc-600 mr-2 uppercase">
          {time || "SYNC_TIME"}
        </span>

        {/* Global Search Button */}
        <button className="w-8.5 h-8.5 rounded-lg border border-zinc-850 bg-zinc-950/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet/40 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Theme Toggle (Holographic energy core selector) */}
        <button className="w-8.5 h-8.5 rounded-lg border border-zinc-850 bg-zinc-950/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet/40 transition-colors relative group">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#5EF9FF] animate-pulse"></span>
          {/* Tooltip hover */}
          <span className="absolute top-12 scale-0 group-hover:scale-100 transition-all font-mono text-[7px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 uppercase tracking-wider z-50">
            Holo Theme
          </span>
        </button>

        {/* Notifications Button with dynamic bubble */}
        <button className="w-8.5 h-8.5 rounded-lg border border-zinc-850 bg-zinc-950/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-violet/40 relative transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341C7.67 7.165 7 8.388 7 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-crimson border border-[#050608] text-[7px] font-bold text-white flex items-center justify-center">
            8
          </span>
        </button>

        {/* Separator line */}
        <span className="w-[1px] h-6 bg-zinc-900"></span>

        {/* User Profile Avatar Link (Clicking routes directly to /profile) */}
        <Link 
          href="/profile" 
          className="flex items-center gap-3.5 pl-2 pr-3 py-1 rounded-lg border border-zinc-850 bg-zinc-950/20 hover:border-violet/40 hover:bg-zinc-950/60 transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-crimson to-violet p-[1.5px] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full bg-[#050608] flex items-center justify-center text-[10px] font-mono text-zinc-300">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-wide text-zinc-200 uppercase truncate max-w-[80px]" title={userName}>
              {userName}
            </span>
            <span className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase truncate max-w-[80px]" title={userRole}>
              {userRole}
            </span>
          </div>
        </Link>

      </div>

    </header>
  );
}
