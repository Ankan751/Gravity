"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-zinc-800/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-sm sm:max-w-md w-full dev-box p-6 sm:p-8 text-center space-y-6">
        <div className="dev-icon-box w-14 h-14 mx-auto text-[#bef264]">
          <WifiOff className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            NETWORK UNREACHABLE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">You're Offline</h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">
            SplitEase couldn't connect. Check network connection to sync balances.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="dev-btn-white w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Reconnecting
          </button>
          <Link
            href="/"
            className="dev-btn-dark w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-mono cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
