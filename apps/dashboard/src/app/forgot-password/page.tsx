"use client";

import React, { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPassword() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
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
            Recover Cipher
          </h2>
          <p className="font-sans text-[11px] text-zinc-500 tracking-wide uppercase mt-1">
            Request token to override access cipher
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-violet/10 border border-violet/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(123,44,191,0.2)]">
              <svg className="w-6 h-6 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                Recovery cipher dispatched
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                A secure link has been broadcasted to your terminal (<span className="text-zinc-200">{email}</span>). 
                Follow the transmission instructions to reset your cipher.
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
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-sans text-xs font-semibold tracking-[0.2em] text-white bg-gradient-to-r from-crimson to-violet uppercase relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,44,191,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {loading ? "Transmitting..." : "Send Recovery Cipher"}
              </button>
            </form>

            {/* Redirect Footer */}
            <div className="mt-8 text-center">
              <p className="font-sans text-[11px] text-zinc-600">
                Cancel override?{" "}
                <a
                  href="/signin"
                  className="font-semibold text-zinc-400 hover:text-white uppercase transition-colors"
                >
                  Return to Sign In
                </a>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
