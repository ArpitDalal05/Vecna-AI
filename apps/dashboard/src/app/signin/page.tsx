"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Catch search param errors (like OAuth callback failures)
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setErrorMessage(err);
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) setErrorMessage(error.message);
    } catch (err) {
      setErrorMessage(`Failed to initiate ${provider} authentication.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[#09070A]/70 border border-violet/20 shadow-[0_0_50px_rgba(123,44,191,0.12)] backdrop-blur-xl relative overflow-hidden z-10">
      {/* Background vignette card effect */}
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
          Access Hive Mind
        </h2>
        <p className="font-sans text-[11px] text-zinc-500 tracking-wide uppercase mt-1">
          Synchronize user credentials to connect
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mb-6 p-3 rounded-lg border border-crimson/30 bg-crimson/5 text-crimson text-xs font-sans tracking-wide leading-relaxed text-center">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              Access Cipher (Password)
            </label>
            <a
              href="/forgot-password"
              className="text-[9px] font-semibold tracking-wider text-zinc-500 hover:text-cyan uppercase transition-colors duration-300"
            >
              Reset Cipher
            </a>
          </div>
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
          {loading ? "Establishing Link..." : "Authenticate"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/80"></div>
        </div>
        <span className="relative z-10 px-3 bg-[#09070A] text-[9px] font-semibold tracking-widest text-zinc-600 uppercase">
          OR CONVERGE VIA
        </span>
      </div>

      {/* OAuth Providers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-850 bg-[#040404]/50 hover:bg-[#040404] hover:border-zinc-700 transition-all duration-300 group disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.693 0-8.5-3.807-8.5-8.5s3.807-8.5 8.5-8.5c2.102 0 4.01.766 5.502 2.03l3.07-3.07C18.18 1.48 15.34 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.92 0 12.24-4.87 12.24-12.24 0-.82-.08-1.42-.2-1.955H12.24z"/>
          </svg>
          <span className="font-sans text-[10px] font-semibold tracking-wider text-zinc-400 group-hover:text-white uppercase transition-colors">
            Google
          </span>
        </button>

        {/* GitHub OAuth */}
        <button
          type="button"
          onClick={() => handleOAuthLogin("github")}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-850 bg-[#040404]/50 hover:bg-[#040404] hover:border-zinc-700 transition-all duration-300 group disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          <span className="font-sans text-[10px] font-semibold tracking-wider text-zinc-400 group-hover:text-white uppercase transition-colors">
            GitHub
          </span>
        </button>
      </div>

      {/* Redirect Footer */}
      <div className="mt-8 text-center">
        <p className="font-sans text-[11px] text-zinc-600">
          New Node?{" "}
          <a
            href="/signup"
            className="font-semibold text-zinc-400 hover:text-white uppercase transition-colors"
          >
            Register Core Identity
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#040404] px-4 relative overflow-hidden select-none">
      
      {/* Cinematic Glowing Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,44,191,0.06)_0%,transparent_70%)] z-0"></div>
      
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0" style={{
        backgroundImage: "radial-gradient(var(--violet) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}></div>

      <Suspense fallback={
        <div className="text-zinc-500 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading Access cipher...
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}
