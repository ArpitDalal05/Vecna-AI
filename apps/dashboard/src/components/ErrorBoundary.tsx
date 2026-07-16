"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside Hive OS:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans text-zinc-100 p-6 relative">
          {/* Ambient scanline and noise overlays */}
          <div className="scanlines"></div>
          <div className="noise-overlay"></div>
          <div className="vignette"></div>

          <div className="max-w-md w-full p-6 rounded-2xl border border-red-950 bg-red-950/10 backdrop-blur-md flex flex-col items-center text-center shadow-[0_0_30px_rgba(153,0,17,0.15)] z-10">
            {/* Critical warning sign */}
            <div className="w-12 h-12 rounded-full border border-red-500/20 flex items-center justify-center text-red-500 mb-4 bg-red-950/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase font-bold mb-2">
              CRITICAL COGNITIVE SHIELD ACTIVATED
            </h2>
            <p className="text-[11px] text-zinc-400 font-sans tracking-wide leading-relaxed mb-6">
              A neural filament exception or WebGL context fault occurred within this viewport loop. Core parameters remain stable.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-red-950 border border-red-500 text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:bg-red-900 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              RE-SYNC COGNITIVE LINK
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
