import Link from "next/link";
import { ArrowRight, Receipt, Users, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden selection:bg-zinc-800 selection:text-white">
      {/* ─── Background Ambient Effects ─── */}
      <div className="fixed inset-0 bg-grid opacity-35 pointer-events-none" />
      <div className="fixed top-[-250px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-zinc-800/25 blur-[160px] pointer-events-none" />

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="metallic-medallion w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-md">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Split<span className="metallic-silver-text">Ease</span>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/api/auth/signin"
            className="text-sm text-zinc-400 hover:text-white transition font-medium px-2 py-1"
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/signin"
            className="metallic-btn-platinum px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full metallic-badge text-xs sm:text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
          Zero Hassle Shared Expenses
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-white">
          Split Bills{" "}
          <span className="metallic-silver-text">
            Effortlessly
          </span>
          <br className="hidden sm:inline" />
          {" "}With Anyone.
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-xl mx-auto mt-6 leading-relaxed">
          Track shared expenses, balance group debts fairly, and settle up in seconds.
          Engineered with precision for real-world groups.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 max-w-md mx-auto sm:max-w-none">
          <Link
            href="/api/auth/signin"
            className="metallic-btn-platinum w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            Start Splitting
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="metallic-btn-steel w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-base flex items-center justify-center cursor-pointer"
          >
            Learn More
          </Link>
        </div>

        {/* ─── Stats Bar ─── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-12 sm:pt-16 max-w-lg mx-auto">
          <div className="metallic-card rounded-2xl p-3.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-extrabold metallic-silver-text">100%</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Free Forever</div>
          </div>
          <div className="metallic-card rounded-2xl p-3.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-extrabold metallic-silver-text">Instant</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Calculations</div>
          </div>
          <div className="metallic-card rounded-2xl p-3.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-extrabold metallic-silver-text">₹ / $</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Multi-Split</div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-zinc-800/80">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Everything You Need To Split Smart
          </h2>
          <p className="text-zinc-400 mt-3 text-sm sm:text-base max-w-md mx-auto">
            Engineered to eliminate awkward debt math from group trips, flatmates, and dining out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="metallic-card rounded-2xl p-6 sm:p-8 hover:border-zinc-600/50 transition-all duration-300">
            <div className="metallic-medallion w-12 h-12 rounded-xl flex items-center justify-center text-zinc-200 mb-5 shadow-inner">
              <Receipt className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Equal & Exact Splits</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Split bills evenly across all members or assign exact rupee amounts per participant with precision.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="metallic-card rounded-2xl p-6 sm:p-8 hover:border-zinc-600/50 transition-all duration-300">
            <div className="metallic-medallion w-12 h-12 rounded-xl flex items-center justify-center text-zinc-200 mb-5 shadow-inner">
              <Users className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Group Balances</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Real-time ledger updates keep balances synchronized across all devices instantly with zero refresh delays.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="metallic-card rounded-2xl p-6 sm:p-8 hover:border-zinc-600/50 transition-all duration-300">
            <div className="metallic-medallion w-12 h-12 rounded-xl flex items-center justify-center text-zinc-200 mb-5 shadow-inner">
              <Zap className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Simplified Settlements</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Smart debt simplification computes the minimum number of payments required to clear everyone&apos;s balances.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="metallic-card rounded-3xl p-8 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Ready to simplify group expenses?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mt-3">
            Open in browser or install directly on your phone as a Progressive Web App.
          </p>
          <div className="mt-8">
            <Link
              href="/api/auth/signin"
              className="metallic-btn-platinum inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base shadow-xl cursor-pointer"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="metallic-medallion w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm">
              S
            </div>
            <span className="font-semibold text-sm text-zinc-200">SplitEase</span>
          </div>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} SplitEase. All rights reserved.
          </p>
          <div>
            <a
              href="https://github.com/Ankan751/Gravity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
