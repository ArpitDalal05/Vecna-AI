"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            designation: "Core Cognitive Unit",
            sync_rank: "Initiate (L1)",
            node_id: Math.floor(Math.random() * 899999 + 100000).toString(),
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // If Supabase is configured with email confirmation, we display instructions.
        // Otherwise, if the session is immediately active, we can route.
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#040404] px-4 relative overflow-hidden select-none">
      
      {/* Cinematic Glowing Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,44,191,0.06)_0%,transparent_70%)] z-0"></div>
      
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0" style={{
        backgroundImage: "radial-gradient(var(--violet) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}></div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#09070A]/70 border border-violet/20 shadow-[0_0_50px_rgba(123,44,191,0.12)] backdrop-blur-xl relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet/5 via-transparent to-crimson/5 pointer-events-none z-[-1]"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2 group mb-3">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-crimson via-violet to-cyan relative flex items-center justify-center">
              <span className="absolute inset-[1.5px] rounded-full bg-black"></span>
              <span className="w-2 h-2 rounded-full bg-crimson"></span>
            </span>
            <span className="font-sans text-sm font-semibold tracking-[0.2em] text-white uppercase">
              Vecna AI
            </span>
          </a>
          <h2 className="font-sans text-xl font-bold tracking-tight text-white uppercase">
            Initialize Core
          </h2>
          <p className="font-sans text-[11px] text-zinc-500 tracking-wide uppercase mt-1">
            Register new autonomous node to the ecosystem
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-violet/10 border border-violet/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(123,44,191,0.2)]">
              <svg className="w-6 h-6 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                Verification cipher broadcasted
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                An activation link has been sent to your terminal (<span className="text-zinc-200">{email}</span>). 
                Please verify it to complete synchronization.
              </p>
            </div>
            <div className="pt-4">
              <a
                href="/signin"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-zinc-800 bg-[#040404]/50 hover:bg-[#040404] hover:border-zinc-700 text-zinc-400 hover:text-white font-sans text-xs font-semibold tracking-widest uppercase transition-all duration-300"
              >
                Back to Authentication
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-3 rounded-lg border border-crimson/30 bg-crimson/5 text-crimson text-xs font-sans tracking-wide leading-relaxed text-center">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                  Identity Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#040404]/80 border border-zinc-800 text-zinc-200 text-sm font-sans focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all duration-300"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                  Designation Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#040404]/80 border border-zinc-800 text-zinc-200 text-sm font-sans focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all duration-300"
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2">
                  Access Cipher (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#040404]/80 border border-zinc-800 text-zinc-200 text-sm font-sans focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet transition-all duration-300"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-sans text-xs font-semibold tracking-[0.2em] text-white bg-gradient-to-r from-crimson to-violet uppercase relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,44,191,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {loading ? "Registering Node..." : "Initialize Identity"}
              </button>
            </form>

            {/* Redirect Footer */}
            <div className="mt-8 text-center">
              <p className="font-sans text-[11px] text-zinc-600">
                Already Synced?{" "}
                <a
                  href="/signin"
                  className="font-semibold text-zinc-400 hover:text-white uppercase transition-colors"
                >
                  Access Hive Mind
                </a>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
