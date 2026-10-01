import Link from "next/link";
import { ArrowRight, Receipt, Users, Zap, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f5] selection:bg-[#bef264] selection:text-black">
      {/* ─── Subtle Grid Background ─── */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="dev-icon-box w-8 h-8 rounded-lg text-white font-mono text-sm font-bold">
            S
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            splitease<span className="font-mono text-xs text-zinc-500">.app</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#terminal" className="hover:text-white transition">Ledger</a>
          <a
            href="https://github.com/Ankan751/Gravity"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-1"
          >
            GitHub <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/api/auth/signin"
            className="text-xs sm:text-sm text-zinc-400 hover:text-white transition px-2 py-1 font-mono"
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/signin"
            className="dev-btn-white px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section (2 Columns like Reference Image) ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121216] border border-zinc-800 text-[11px] font-mono tracking-widest uppercase text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
              SHARED EXPENSE ENGINE
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]">
              Split
              <br />
              <span className="text-[#bef264]">Ease</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Track shared expenses, simplify multi-person debts, and settle balances with zero awkward math. Built cleanly for flatmates, trips, and dinners.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/api/auth/signin"
                className="dev-btn-white px-6 py-3 font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
              >
                Start Splitting
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/api/auth/signin"
                className="dev-btn-dark px-5 py-3 text-sm font-medium cursor-pointer"
              >
                Sign In ↗
              </Link>
              <a
                href="https://github.com/Ankan751/Gravity"
                target="_blank"
                rel="noopener noreferrer"
                className="dev-btn-dark px-5 py-3 text-sm font-medium cursor-pointer"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Right Column: Terminal Box (Exact Style of Aryan Srivastava Reference) */}
          <div id="terminal" className="lg:col-span-5">
            <div className="terminal-box p-5 sm:p-6 shadow-2xl space-y-4">
              {/* Window Controls */}
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="ml-2 text-xs font-mono text-zinc-500">~/splitease - ledger.zsh</span>
              </div>

              {/* Terminal Item 1 */}
              <div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <span className="text-[#bef264]">→</span>
                  <span>whoami</span>
                </div>
                <p className="text-zinc-400 font-mono text-xs mt-1 pl-4">
                  splitease · automated group ledger
                </p>
              </div>

              {/* Terminal Item 2 */}
              <div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <span className="text-[#bef264]">→</span>
                  <span>cat summary.log</span>
                </div>
                <p className="text-[#bef264] font-mono text-xs mt-1 pl-4 font-semibold">
                  ₹18,450 spent across 4 members
                </p>
                <p className="text-zinc-500 font-mono text-[11px] pl-4 mt-0.5">
                  debts simplified: 6 payments reduced to 2
                </p>
              </div>

              {/* Terminal Item 3: JSON */}
              <div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <span className="text-[#bef264]">→</span>
                  <span>cat active-split.json</span>
                </div>
                <pre className="text-zinc-400 font-mono pl-4 mt-1 text-[11px] leading-relaxed">
{`{
  "group": "Goa Trip",
  "paid_by": "Alex",
  "amount": "₹4,800",
  "split": "equal (4 members)",
  "settle": "Sarah → Alex: ₹1,200"
}`}
                </pre>
              </div>

              {/* Terminal Item 4: Status */}
              <div>
                <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                  <span className="text-[#bef264]">→</span>
                  <span>status</span>
                </div>
                <p className="text-zinc-300 font-mono pl-4 text-xs mt-1">
                  <span className="text-[#bef264] font-semibold">active</span> · ready to split
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section (Clean Classy Boxes) ─── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-zinc-800/80">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
            CORE CAPABILITIES
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineered For Fair Expenses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dev-box p-5 sm:p-6 space-y-3">
            <div className="dev-icon-box w-10 h-10 text-[#bef264]">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">Equal & Exact Splits</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Divide bills equally across all participants or assign custom rupee amounts per member with cent accuracy.
            </p>
          </div>

          <div className="dev-box p-5 sm:p-6 space-y-3">
            <div className="dev-icon-box w-10 h-10 text-[#bef264]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">Live Ledger</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Every expense automatically recalculates net balances so everyone knows exactly who owes whom at any time.
            </p>
          </div>

          <div className="dev-box p-5 sm:p-6 space-y-3">
            <div className="dev-icon-box w-10 h-10 text-[#bef264]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">Debt Simplification</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Graph simplification minimizes total transaction count, eliminating messy circular debts between friends.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">splitease</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Ankan751/Gravity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
