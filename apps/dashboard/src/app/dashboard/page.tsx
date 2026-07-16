"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function DashboardHome() {
  const supabase = createClient();
  const [userName, setUserName] = useState("Hive Overlord");
  const [syncRank, setSyncRank] = useState("Initiate (L1)");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || "Hive Overlord");
        setSyncRank(user.user_metadata?.sync_rank || "Initiate (L1)");
      }
    };
    fetchUser();
  }, []);

  const healthStats = [
    { label: "Consensus Latency", value: "1.22 ms", status: "Optimal", color: "text-green-500" },
    { label: "Ecosystem Sync", value: "99.98%", status: "Synchronized", color: "text-violet" },
    { label: "Active Threads", value: "156 Threads", status: "Active", color: "text-cyan" },
    { label: "Global Coverage", value: "99.97%", status: "Optimal", color: "text-green-500" }
  ];

  const recentProjects = [
    { name: "Hive Sovereign Core", description: "Biomechanical consciousness system update", progress: "87%", status: "Evolving" },
    { name: "Neural Gateway Proxy", description: "Supabase SSR authentication bridge", progress: "100%", status: "Synced" },
    { name: "Planetary Node Scaler", description: "Autonomous cognitive scaling logic", progress: "42%", status: "Compiling" }
  ];

  const employeeStatus = [
    { node: "NODE-832912", name: "Alpha Unit", role: "Primary Analyst", status: "Active", color: "bg-green-500" },
    { node: "NODE-204193", name: "Beta Unit", role: "Neural Architect", status: "Active", color: "bg-green-500" },
    { node: "NODE-105824", name: "Delta Unit", role: "Data Harvester", status: "Idle", color: "bg-zinc-600" }
  ];

  const upcomingTasks = [
    { task: "Establish WebGL Core Shader Integration", completed: true },
    { task: "Deploy secure Supabase authentication middleware", completed: true },
    { task: "Synchronize local project workspace to GitHub", completed: true },
    { task: "Connect Next.js app monorepo to Vercel provider", completed: false },
    { task: "Tune postprocessing bloom passes on R3F Canvas", completed: false }
  ];

  const recentActivity = [
    { action: "Consensus agreement achieved across 12,042 nodes", time: "2 min ago" },
    { action: "GitHub remote linked: origin/main pushed successfully", time: "12 min ago" },
    { action: "Authentication token verified for Administrator", time: "42 min ago" },
    { action: "Cognitive sync rank upgraded to Initiate (L1)", time: "1 hour ago" }
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Welcome Back Header Card */}
      <div className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md relative overflow-hidden shadow-[0_0_20px_rgba(123,44,191,0.02)]">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-violet/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-xl md:text-3xl font-bold tracking-tight text-white uppercase">
              Welcome Back, {userName}
            </h1>
            <p className="font-sans text-xs text-zinc-400 font-light mt-1 max-w-xl">
              Ecosystem matrix synchronized. Your cognitive link rank is currently{" "}
              <span className="text-violet font-semibold">{syncRank}</span>. All nodes are reporting optimal traffic.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase border border-zinc-800 bg-zinc-950/30 px-3 py-1 rounded">
              NODE // ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Company Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthStats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl border border-zinc-900 bg-[#09070A]/35 flex flex-col justify-between min-h-[110px]">
            <span className="block font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className={`text-[8px] font-semibold uppercase tracking-widest ${stat.color}`}>
                {stat.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Recent Projects */}
        <div className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
          <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase border-b border-zinc-900 pb-3.5 mb-5">
            RECENT PROJECTS
          </h3>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.name} className="flex justify-between items-start py-3 border-b border-zinc-900/60 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <span className="block font-sans text-xs font-bold text-zinc-200 uppercase tracking-wide">
                    {project.name}
                  </span>
                  <span className="block font-sans text-[10px] text-zinc-500 font-light">
                    {project.description}
                  </span>
                </div>
                <div className="text-right font-mono text-[10px]">
                  <span className="block text-violet font-semibold">{project.status}</span>
                  <span className="block text-[8px] text-zinc-500 mt-0.5">COMPLETION: {project.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Employee Status (Cognitive Units) */}
        <div className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
          <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase border-b border-zinc-900 pb-3.5 mb-5">
            EMPLOYEE STATUS
          </h3>
          <div className="space-y-4">
            {employeeStatus.map((unit) => (
              <div key={unit.node} className="flex justify-between items-center py-3 border-b border-zinc-900/60 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-950/80 border border-zinc-900 flex items-center justify-center text-[8px] font-mono text-zinc-400">
                    {unit.name.charAt(0)}
                  </div>
                  <div>
                    <span className="block font-sans text-xs font-bold text-zinc-200 uppercase tracking-wide">
                      {unit.name}
                    </span>
                    <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                      {unit.node} // {unit.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${unit.color}`} />
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wide">{unit.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Secondary Row: Tasks & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Upcoming Tasks (Directives checklist) */}
        <div className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
          <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase border-b border-zinc-900 pb-3.5 mb-5">
            UPCOMING TASKS
          </h3>
          <ul className="space-y-3.5 text-[11px] font-sans text-zinc-400">
            {upcomingTasks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={`w-4 h-4 rounded border flex items-center justify-center font-mono text-[8px] shrink-0 mt-0.5 ${
                  item.completed 
                    ? "border-violet/40 bg-violet/10 text-cyan" 
                    : "border-zinc-800 bg-zinc-950/40 text-transparent"
                }`}>
                  {item.completed && "✓"}
                </span>
                <span className={item.completed ? "line-through text-zinc-600" : ""}>
                  {item.task}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col shadow-[0_0_20px_rgba(123,44,191,0.02)]">
          <h3 className="font-sans text-xs font-bold tracking-widest text-white uppercase border-b border-zinc-900 pb-3.5 mb-5">
            RECENT ACTIVITY
          </h3>
          <div className="space-y-4 font-sans text-xs text-zinc-400">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <div className="flex gap-2">
                  <span className="text-zinc-600 font-mono mt-0.5">//</span>
                  <span className="leading-relaxed font-light">{activity.action}</span>
                </div>
                <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase shrink-0 mt-0.5">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
