"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import dynamic from "next/dynamic";

const WebGLContainer = dynamic(() => import("../../components/dashboard/WebGLContainer"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Hive Overlord");
  const [userRole, setUserRole] = useState("Administrator");

  // Validate active auth session on layout mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push("/signin");
        } else {
          setUserName(user.user_metadata?.full_name || "Hive Overlord");
          setUserRole(user.user_metadata?.designation || "Administrator");
          setLoading(false);
        }
      } catch (err) {
        console.error("Session verification failed", err);
        router.push("/signin");
      }
    };
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-violet animate-spin"></div>
          <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-500 uppercase font-semibold">
            ESTABLISHING HIVE LINK...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 flex overflow-hidden font-sans relative">
      
      {/* 1. Cinematic Background Overlays */}
      <div className="scanlines" />
      <div className="noise-overlay" />
      <div className="vignette" />

      {/* 2. WebGL Central Particle Core Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <WebGLContainer />
      </div>

      {/* 3. Persistent Sidebar Navigation */}
      <Sidebar userName={userName} />

      {/* 4. Main Panel Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative bg-transparent">
        
        {/* Persistent Topbar */}
        <Topbar userName={userName} userRole={userRole} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Glass background backing for content */}
          <div className="absolute inset-0 bg-[#050608]/40 backdrop-blur-[4px] pointer-events-none z-[-1]" />
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            {children}
          </div>
        </main>

        {/* Telemetry Footer */}
        <footer className="h-10 border-t border-zinc-900 bg-[#050608]/90 backdrop-blur-md px-8 flex items-center justify-between text-[8px] font-mono text-zinc-600 tracking-[0.2em] z-20 shrink-0">
          <span>AUTHENTICATION JWT: ACTIVE</span>
          <span>PROTOCOL HIVE_V1.0_SECURE</span>
        </footer>

      </div>

    </div>
  );
}
