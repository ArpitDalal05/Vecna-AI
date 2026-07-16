"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  const primaryLinks = [
    { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Employees", href: "/dashboard/employees", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Departments", href: "/dashboard/departments", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Projects", href: "/dashboard/projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { label: "Knowledge", href: "/dashboard/knowledge", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Runtime", href: "/dashboard/runtime", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Settings", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35" }
  ];

  const secondaryLinks = [
    { label: "Workspace", href: "/dashboard", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
    { label: "Notifications", href: "/dashboard", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341C7.67 7.165 7 8.388 7 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { label: "Profile", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }
  ];

  return (
    <aside className="w-64 border-r border-zinc-900 bg-[#050608]/90 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 z-30 relative glow-purple h-screen overflow-y-auto">
      
      {/* Top Section */}
      <div className="space-y-8">
        
        {/* Vecna Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-crimson transition-transform duration-500 group-hover:rotate-180"
          >
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="6" />
            <path d="M50 25C68 20 82 30 82 45C82 58 68 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 25C32 20 18 30 18 45C18 58 32 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M35 15L50 5L65 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-[0.25em] text-white uppercase">VECNA AI</span>
            <span className="text-[7.5px] font-mono tracking-[0.2em] text-zinc-500 uppercase mt-0.5">HIVE MIND OS</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <svg className="w-3.5 h-3.5 text-zinc-500 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search hive..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-950/60 border border-zinc-850 text-[10px] font-sans text-zinc-300 focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-600"
          />
        </div>

        {/* Primary Links */}
        <nav className="space-y-1">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                  isActive 
                    ? "text-white bg-gradient-to-r from-crimson/15 to-violet/10 border-l-2 border-crimson shadow-[0_0_15px_rgba(153,0,17,0.1)]" 
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
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Bottom Section */}
      <div className="pt-6 border-t border-zinc-900/80 space-y-1.5">
        
        {/* Workspace, Notifications, Profile */}
        {secondaryLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                isActive 
                  ? "text-white bg-gradient-to-r from-crimson/15 to-violet/10 border-l-2 border-crimson" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950/40"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isActive ? "text-crimson" : "text-zinc-600 group-hover:text-zinc-400"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
              </svg>
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Mini user profile block */}
        <div className="pt-4 flex items-center gap-3 px-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-crimson to-violet p-[1px]">
            <div className="w-full h-full rounded-full bg-[#050608] flex items-center justify-center text-[9px] font-mono text-zinc-400">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase truncate max-w-[120px]">
            {userName}
          </span>
        </div>

      </div>

    </aside>
  );
}
