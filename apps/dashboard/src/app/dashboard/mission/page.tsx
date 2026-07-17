"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHiveState } from "../../../hooks/useHiveState";
import { useMission } from "../../../hooks/useMission";
import { missionResultStorage } from "../../../services/mission/missionResultStorage";

export default function MissionControl() {
  const router = useRouter();
  const { user, workspaces, activeWorkspace, changeWorkspace, unreadCount, markNotificationsRead } = useHiveState();
  const { createMission, executeMission, pauseMission, resumeMission, cancelMission, missions, loading, errors } = useMission();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [workspace, setWorkspace] = useState("Engineering");
  const [executionMode, setExecutionMode] = useState<"Autonomous" | "Approval Required">("Autonomous");
  const [agentSelection, setAgentSelection] = useState<"Auto Assign" | "Manual Selection">("Auto Assign");
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const userName = user?.fullName || "Hive Overlord";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    try {
      const created = await createMission({
        title,
        goal,
        description,
        priority,
        workspace,
        executionMode,
        status: "CREATED",
        estimatedTasks: 3,
        completedTasks: 0,
        assignedAgents: agentSelection === "Auto Assign" ? ["Synapse-01", "Mem-04"] : ["Decide-02"]
      });

      if (created) {
        setSubmitSuccess(`Mission "${created.title}" registered successfully.`);
        // Reset form
        setTitle("");
        setGoal("");
        setDescription("");
        
        // Execute immediately
        await executeMission(created.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarSection1 = [
    { label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3", href: "/dashboard" },
    { label: "Employees", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857", href: "/dashboard" },
    { label: "Departments", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2", href: "/dashboard" },
    { label: "Projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2", href: "/dashboard" },
    { label: "Knowledge", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253", href: "/dashboard" },
    { label: "Runtime", icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2", href: "/dashboard" },
    { label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6", href: "/dashboard" },
    { label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066", href: "/dashboard" }
  ];

  const sidebarSection2 = [
    { label: "Workspace", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" },
    { label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341" },
    { label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/profile" }
  ];

  const handleSidebarClick = (link: { label: string; href?: string }) => {
    if (link.href) {
      router.push(link.href);
    } else if (link.label === "Workspace") {
      const currentIndex = workspaces.findIndex(w => w.id === activeWorkspace?.id);
      const nextIndex = (currentIndex + 1) % workspaces.length;
      changeWorkspace(workspaces[nextIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#040404] text-zinc-100 flex flex-col font-sans relative select-none">
      
      {/* --- TOP GLOBAL HEADER (TOP BAR) --- */}
      <header className="h-20 border-b border-zinc-900 bg-[#050608]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        
        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
          <span>VECNA_OS</span>
          <span>//</span>
          <span className="text-zinc-400">COMMAND</span>
          <span>//</span>
          <span className="text-white font-bold">MISSION_CONTROL</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={markNotificationsRead}
            className="w-8 h-8 rounded-lg border border-zinc-855 bg-zinc-950/40 flex items-center justify-center text-zinc-455 hover:text-purple hover:border-purple/40 relative transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341C7.67 7.165 7 8.388 7 11" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-crimson text-[7px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          </button>

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
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-64 border-r border-zinc-900 bg-[#050608]/40 flex flex-col justify-between p-4 shrink-0">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-sm font-sans font-black tracking-widest bg-gradient-to-r from-crimson to-violet bg-clip-text text-transparent">VECNA.AI</span>
              <span className="font-mono text-[7px] text-violet border border-violet/30 bg-violet/5 px-1 py-0.2 rounded uppercase tracking-wider">HIVE_OS</span>
            </div>

            <nav className="flex flex-col gap-1 text-[10px] font-mono tracking-wider">
              {sidebarSection1.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleSidebarClick(link)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-violet/10 hover:bg-violet/5 text-zinc-400 hover:text-white transition-all text-left"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  <span>{link.label.toUpperCase()}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-1 text-[10px] font-mono tracking-wider pt-4 border-t border-zinc-900">
            {sidebarSection2.map((link) => (
              <button
                key={link.label}
                onClick={() => handleSidebarClick(link)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-transparent hover:border-violet/10 hover:bg-violet/5 text-zinc-400 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  <span>{link.label.toUpperCase()}</span>
                </div>
                {link.label === "Workspace" && (
                  <span className="text-[7px] font-bold text-cyan border border-cyan/30 bg-cyan/5 px-1 py-0.2 rounded uppercase">
                    {activeWorkspace?.name || "VECNA_GRID"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Command Workspace */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col xl:flex-row gap-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-950 via-[#050608] to-[#050608]">
          
          {/* Form Column */}
          <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[8px] tracking-[0.25em] text-violet uppercase font-semibold">MISSION CONTROL</span>
              <h1 className="font-sans text-2xl font-black text-white tracking-tight uppercase">Launch AI Mission Filament</h1>
              <p className="text-xs text-zinc-450 leading-relaxed">Decompose custom objective goals, assign automated node tasks, and monitor swarm completions.</p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-xl border border-green-900/50 bg-green-950/20 text-green-400 text-xs font-mono">
                [OK] {submitSuccess}
              </div>
            )}

            {errors && (
              <div className="p-4 rounded-xl border border-crimson/50 bg-crimson/20 text-crimson text-xs font-mono">
                [ERR] {errors}
              </div>
            )}

            <form onSubmit={handleCreate} className="p-6 rounded-2xl border border-violet/15 bg-[#09070A]/50 backdrop-blur-md flex flex-col gap-5 shadow-[0_0_30px_rgba(123,44,191,0.03)]">
              
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Mission Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize Canvas Shaders"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-650"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Mission Goal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Validate vertex buffers on terrain shaders"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-650"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Detailed Instructions</label>
                <textarea
                  placeholder="Insert multi-line context parameters here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60 focus:ring-1 focus:ring-violet/30 transition-all placeholder:text-zinc-650 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60 transition-all"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Target Workspace</label>
                  <select
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-white focus:outline-none focus:border-violet/60 transition-all"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research</option>
                    <option value="Creative">Creative</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Execution Mode</label>
                  <div className="flex gap-2">
                    {["Autonomous", "Approval Required"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setExecutionMode(mode as any)}
                        className={`flex-1 py-2 text-[9px] font-mono tracking-wider rounded border transition-all ${
                          executionMode === mode
                            ? "border-violet bg-violet/10 text-white shadow-[0_0_10px_rgba(123,44,191,0.1)]"
                            : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[8px] tracking-[0.2em] text-zinc-500 uppercase">Agent Selection</label>
                  <div className="flex gap-2">
                    {["Auto Assign", "Manual Selection"].map((select) => (
                      <button
                        key={select}
                        type="button"
                        onClick={() => setAgentSelection(select as any)}
                        className={`flex-1 py-2 text-[9px] font-mono tracking-wider rounded border transition-all ${
                          agentSelection === select
                            ? "border-cyan bg-cyan/10 text-white shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                            : "border-zinc-900 bg-zinc-950 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        {select.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-crimson to-violet hover:from-crimson/90 hover:to-violet/90 text-[10px] tracking-[0.3em] font-mono font-bold text-white uppercase shadow-[0_0_20px_rgba(123,44,191,0.15)] focus:ring-1 focus:ring-violet transition-all disabled:opacity-50 mt-2"
              >
                {loading ? "DECOMPOSING GOAL..." : "EXECUTE MISSION // SYNC"}
              </button>

            </form>
          </div>

          {/* Monitor Column */}
          <div className="flex-1 max-w-lg flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 uppercase">COMMAND QUEUE</span>
              <h2 className="font-sans text-lg font-bold text-white tracking-tight uppercase">Missions Pipeline</h2>
            </div>

            <div className="flex flex-col gap-4">
              {missions.length === 0 ? (
                <div className="p-8 rounded-xl border border-zinc-900 bg-zinc-950/30 text-center font-mono text-[9px] text-zinc-500 tracking-wider">
                  NO ACTIVE MISSION FILAMENTS DETECTED.
                </div>
              ) : (
                missions.map((m: any) => (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMissionId(m.id)}
                    className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:border-violet/30 transition-all"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-crimson to-violet"></div>
                    
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-zinc-200 tracking-wide">{m.title}</span>
                        <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest">
                          {m.workspace} // {m.priority}
                        </span>
                      </div>
                      
                      <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded border ${
                        m.status === "COMPLETED" 
                          ? "border-green-900 bg-green-950/20 text-green-400"
                          : m.status === "RUNNING"
                          ? "border-cyan/40 bg-cyan/5 text-cyan animate-pulse"
                          : m.status === "PAUSED"
                          ? "border-orange-950 bg-orange-950/20 text-orange-400"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed pl-2 pr-4">{m.goal}</p>

                    <div className="flex justify-between items-center pl-2 pt-2 border-t border-zinc-900/60">
                      <div className="flex gap-2">
                        {m.status === "RUNNING" && (
                          <button
                            onClick={() => pauseMission(m.id)}
                            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[8px] font-mono text-zinc-300 transition-all uppercase"
                          >
                            Pause
                          </button>
                        )}
                        {m.status === "PAUSED" && (
                          <button
                            onClick={() => resumeMission(m.id)}
                            className="px-2 py-1 rounded bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-[8px] font-mono text-cyan transition-all uppercase"
                          >
                            Resume
                          </button>
                        )}
                        {m.status !== "COMPLETED" && m.status !== "CANCELLED" && (
                          <button
                            onClick={() => cancelMission(m.id)}
                            className="px-2 py-1 rounded bg-crimson/10 hover:bg-crimson/20 border border-crimson/30 text-[8px] font-mono text-crimson transition-all uppercase"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[8px] text-zinc-500">
                        <span>PROGRESS:</span>
                        <span className="text-white font-bold">
                          {m.estimatedTasks > 0 ? Math.floor((m.completedTasks / m.estimatedTasks) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedMissionId && (
              <MissionResultPanel 
                result={missionResultStorage.get(selectedMissionId) || {
                  missionTitle: missions.find((m: any) => m.id === selectedMissionId)?.title || "Selected Mission",
                  generatedPlan: "Planning telemetry simulation result payload.",
                  generatedTasks: [],
                  modelUsed: "qwen/qwen3-coder-480b-a35b-instruct",
                  latencyMs: 1250,
                  promptTokens: 850,
                  completionTokens: 620,
                  cost: 0.000499
                }} 
                onClose={() => setSelectedMissionId(null)} 
              />
            )}
          </div>

        </main>
      </div>

    </div>
  );
}

function MissionResultPanel({ result, onClose }: { result: any; onClose: () => void }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="p-5 rounded-2xl border border-violet/20 bg-[#09070A]/85 backdrop-blur-md flex flex-col gap-4 text-left shadow-[0_0_25px_rgba(123,44,191,0.05)] mt-4">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <div className="flex flex-col">
          <span className="font-mono text-[7px] text-violet uppercase tracking-widest">MISSION RESULT DETAILS</span>
          <h3 className="text-xs font-bold text-white uppercase">{result.missionTitle}</h3>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white font-mono text-[9px]">✕ CLOSE</button>
      </div>

      <div className="space-y-3 text-[10px]">
        <div>
          <span className="block font-mono text-[7px] text-zinc-500 uppercase mb-0.5">AI Generated Plan</span>
          <p className="text-zinc-350 leading-relaxed bg-zinc-950/40 p-2.5 rounded border border-zinc-900">{result.generatedPlan}</p>
        </div>

        {result.generatedTasks && result.generatedTasks.length > 0 && (
          <div>
            <span className="block font-mono text-[7px] text-zinc-500 uppercase mb-1">Task Decomposition</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {result.generatedTasks.map((t: any, idx: number) => (
                <div key={idx} className="p-2 rounded bg-zinc-950/60 border border-zinc-900/60 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-zinc-200">{t.taskTitle}</span>
                    <span className="font-mono text-[7px] px-1 bg-violet/10 text-violet border border-violet/20 rounded">{t.agentId}</span>
                  </div>
                  {t.reasoning && <p className="text-[9px] text-zinc-500 italic">Reasoning: {t.reasoning}</p>}
                  {t.successCriteria && <p className="text-[9px] text-zinc-500">Success Criteria: {t.successCriteria}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900/50">
          <div>
            <span className="block font-mono text-[7px] text-zinc-500 uppercase">Model Used</span>
            <span className="text-zinc-350 font-mono text-[9px]">{result.modelUsed}</span>
          </div>
          <div>
            <span className="block font-mono text-[7px] text-zinc-500 uppercase">Execution Latency</span>
            <span className="text-zinc-350 font-mono text-[9px]">{result.latencyMs} ms</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900/50 text-center">
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-zinc-500 uppercase">Prompt</span>
            <span className="text-zinc-200 font-mono text-[9px]">{result.promptTokens}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-zinc-500 uppercase">Completion</span>
            <span className="text-zinc-200 font-mono text-[9px]">{result.completionTokens}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-zinc-500 uppercase">Cost</span>
            <span className="text-green-500 font-mono text-[9px]">${result.cost.toFixed(6)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-900/40">
          <button 
            type="button" 
            onClick={() => setShowRaw(!showRaw)}
            className="w-full text-center font-mono text-[8px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
          >
            {showRaw ? "Collapse Raw JSON Payload" : "Expand Raw JSON Payload"}
          </button>
          {showRaw && (
            <pre className="mt-2 p-2 bg-zinc-950 text-zinc-500 font-mono text-[7px] overflow-x-auto rounded border border-zinc-900 max-h-24">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
