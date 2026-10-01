"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-zinc-800/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-sm sm:max-w-md w-full metallic-card rounded-3xl p-6 sm:p-8 text-center space-y-6">
        <div className="metallic-medallion w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-zinc-300 shadow-md">
          <WifiOff className="w-7 h-7 text-zinc-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">You're Offline</h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            SplitEase couldn't reach the network. Please check your connection to sync expenses and balances.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="metallic-btn-platinum w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Reconnecting
          </button>
          <Link
            href="/"
            className="metallic-btn-steel w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
