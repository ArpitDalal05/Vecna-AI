"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function Profile() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Editable profile states
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");

  // Telemetry details
  const [nodeId, setNodeId] = useState("");
  const [syncRank, setSyncRank] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/signin");
        } else {
          setUser(user);
          setFullName(user.user_metadata?.full_name || "");
          setDesignation(user.user_metadata?.designation || "Core Cognitive Unit");
          setNodeId(user.user_metadata?.node_id || Math.floor(Math.random() * 899999 + 100000).toString());
          setSyncRank(user.user_metadata?.sync_rank || "Initiate (L1)");
        }
      } catch (err) {
        console.error("Error checking session", err);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          designation: designation,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Identity parameters updated successfully.");
        setUser(data.user);
      }
    } catch (err) {
      setErrorMessage("Could not update profile metadata. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/signin");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet/20 border-t-violet animate-spin"></div>
          <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-semibold">
            Synchronizing Link...
          </span>
        </div>
      </div>
    );
  }

  const createdTime = user?.created_at 
    ? new Date(user.created_at).toLocaleString() 
    : "Initializing...";
  const lastSignIn = user?.last_sign_in_at 
    ? new Date(user.last_sign_in_at).toLocaleString() 
    : new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-[#040404] text-zinc-100 flex flex-col p-6 md:p-12 relative overflow-hidden select-none">
      
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,44,191,0.03)_0%,transparent_70%)] z-0 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{
        backgroundImage: "radial-gradient(var(--violet) 1px, transparent 1px)",
        backgroundSize: "32px 32px"
      }}></div>

      {/* Top Banner Navigation */}
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto border-b border-zinc-900 pb-6 mb-12 z-10">
        <a href="/" className="flex items-center gap-2 group">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-crimson via-violet to-cyan relative flex items-center justify-center">
            <span className="absolute inset-[1.5px] rounded-full bg-black"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-crimson"></span>
          </span>
          <span className="font-sans text-xs font-semibold tracking-[0.2em] text-white uppercase">
            Vecna AI // Terminal
          </span>
        </a>
        <button
          onClick={handleSignOut}
          className="px-4 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider text-zinc-400 uppercase border border-zinc-800 hover:border-crimson hover:text-white transition-all duration-300"
        >
          Disconnect
        </button>
      </header>

      {/* Main Panel */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 items-start">
        
        {/* Profile Card & Settings (Left Column) */}
        <div className="lg:col-span-1 p-6 md:p-8 rounded-2xl bg-[#09070A]/70 border border-violet/15 shadow-[0_0_40px_rgba(123,44,191,0.05)] backdrop-blur-xl space-y-6">
          
          {/* Identity Header */}
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-crimson via-violet to-cyan flex items-center justify-center p-[2px] shadow-[0_0_20px_rgba(123,44,191,0.2)]">
              <div className="w-full h-full rounded-full bg-[#09070A] flex items-center justify-center">
                <span className="font-mono text-lg font-bold text-zinc-300">
                  {fullName ? fullName.charAt(0).toUpperCase() : "N"}
                </span>
              </div>
            </div>
            <div>
              <h2 className="font-sans text-sm font-bold tracking-wider text-white uppercase">
                {fullName || "Cognitive Node"}
              </h2>
              <p className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase mt-1">
                {designation}
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {successMessage && (
            <div className="p-3 rounded-lg border border-violet/30 bg-violet/5 text-cyan text-[10px] font-sans tracking-wider text-center uppercase">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-lg border border-crimson/30 bg-crimson/5 text-crimson text-[10px] font-sans tracking-wider text-center uppercase">
              {errorMessage}
            </div>
          )}

          {/* Parameter Editor */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[9px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                Identity Label (Full Name)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#040404]/80 border border-zinc-800 text-zinc-200 text-xs font-sans focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all duration-300"
                placeholder="Your Name"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-[9px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                Node Designation (Role)
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#040404]/80 border border-zinc-800 text-zinc-200 text-xs font-sans focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all duration-300"
                placeholder="Role Description"
                disabled={updating}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 rounded-xl font-sans text-[10px] font-semibold tracking-[0.2em] text-white bg-gradient-to-r from-crimson to-violet uppercase relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,44,191,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? "Updating Core..." : "Sync Parameters"}
            </button>
          </form>

        </div>

        {/* Telemetry & Connection Analytics (Right 2 Columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Node Metadata Panel */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#09070A]/70 border border-violet/15 shadow-[0_0_40px_rgba(123,44,191,0.05)] backdrop-blur-xl space-y-6">
            <h3 className="font-sans text-[11px] font-bold tracking-[0.25em] text-zinc-400 uppercase border-b border-zinc-900 pb-3">
              Core Identity Telemetry
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-900/50">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Node Designation</span>
                <span className="text-white font-medium">{nodeId ? `NODE-${nodeId}` : "PENDING"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900/50">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Cognitive Rank</span>
                <span className="text-violet font-semibold">{syncRank}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900/50">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Secure Index</span>
                <span className="text-zinc-300 select-all font-light max-w-[160px] truncate" title={user?.id}>
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900/50">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Network Email</span>
                <span className="text-zinc-300 font-light truncate max-w-[160px]" title={user?.email}>
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-900/50">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Node Spawn Time</span>
                <span className="text-zinc-400 font-light text-[10px]">{createdTime}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Last Sync Link</span>
                <span className="text-zinc-400 font-light text-[10px]">{lastSignIn}</span>
              </div>
            </div>
          </div>

          {/* Hive Ecosystem Stats Panel */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#09070A]/70 border border-violet/15 shadow-[0_0_40px_rgba(123,44,191,0.05)] backdrop-blur-xl space-y-6">
            <h3 className="font-sans text-[11px] font-bold tracking-[0.25em] text-zinc-400 uppercase border-b border-zinc-900 pb-3">
              Hive Ecosystem Link
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#040404]/50 border border-zinc-900 flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">Latency</span>
                <span className="text-lg font-bold text-white tracking-tight">1.22 ms</span>
                <span className="text-[8px] text-green-500 font-semibold tracking-widest uppercase">Healthy</span>
              </div>
              <div className="p-4 rounded-xl bg-[#040404]/50 border border-zinc-900 flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">Core Sync</span>
                <span className="text-lg font-bold text-violet tracking-tight">99.98%</span>
                <span className="text-[8px] text-violet font-semibold tracking-widest uppercase">Optimized</span>
              </div>
              <div className="p-4 rounded-xl bg-[#040404]/50 border border-zinc-900 flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">Threads</span>
                <span className="text-lg font-bold text-cyan tracking-tight">156 Threads</span>
                <span className="text-[8px] text-cyan font-semibold tracking-widest uppercase">Connected</span>
              </div>
              <div className="p-4 rounded-xl bg-[#040404]/50 border border-zinc-900 flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">Designation</span>
                <span className="text-lg font-bold text-zinc-400 tracking-tight">V1.0.4-α</span>
                <span className="text-[8px] text-zinc-500 font-semibold tracking-widest uppercase">Stable</span>
              </div>
            </div>

            {/* Simulated Ecosystem Link Alert */}
            <div className="p-3 rounded-lg border border-cyan/15 bg-cyan/5 text-[9px] text-cyan font-mono tracking-widest uppercase leading-normal text-center">
              CONVERGENCE MATRIX: OPERATING WITH MAXIMUM AUTONOMOUS FLOW.
            </div>
          </div>

        </div>

      </main>

      {/* Footer System Telemetry */}
      <footer className="w-full max-w-7xl mx-auto border-t border-zinc-900 pt-6 mt-12 flex justify-between items-center text-[9px] font-mono text-zinc-600 tracking-[0.2em] z-10">
        <span>SECURITY CIPHER: SHA-256_ACTIVE</span>
        <span>SYSTEM TIME: {new Date().toLocaleTimeString()}</span>
      </footer>

    </div>
  );
}
