import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* ─── Background Effects ─── */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[160px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center font-bold text-lg text-white">
            S
          </div>
          <span className="text-xl font-bold tracking-tight">Split<span className="text-emerald-400">Ease</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/api/auth/signin"
            className="text-sm text-zinc-400 hover:text-white transition font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/signin"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free & Open Source
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
            Split Bills{" "}
            <span className="text-gradient-emerald">Effortlessly</span>
            <br />
            With <span className="text-gradient-violet">Friends</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Track shared expenses, split bills fairly, and settle up instantly.
            No more awkward money conversations — SplitEase handles it all.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/api/auth/signin"
              className="px-8 py-4 rounded-2xl gradient-emerald text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105"
            >
              Start Splitting →
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-2xl border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white font-semibold text-lg transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* ─── Stats Bar ─── */}
          <div className="grid grid-cols-3 gap-6 pt-12 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient-emerald">100%</div>
              <div className="text-xs text-zinc-500 mt-1">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient-violet">∞</div>
              <div className="text-xs text-zinc-500 mt-1">Unlimited Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient-emerald">₹</div>
              <div className="text-xs text-zinc-500 mt-1">INR Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-gradient-emerald">Split Smart</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-lg mx-auto">
            Powerful features designed to make expense sharing seamless and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card rounded-2xl p-8 group hover:border-emerald-500/30 transition-all duration-300 hover:glow-emerald">
            <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-xl font-bold mb-3">Split Any Way</h3>
            <p className="text-zinc-400 leading-relaxed">
              Split bills equally or enter exact amounts for each person.
              Flexible splitting that works for any situation.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-2xl p-8 group hover:border-violet-500/30 transition-all duration-300 hover:glow-violet">
            <div className="w-14 h-14 rounded-2xl gradient-violet flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-xl font-bold mb-3">Live Balances</h3>
            <p className="text-zinc-400 leading-relaxed">
              See who owes what in real-time. Our smart ledger system keeps
              track of every rupee across all your groups.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-2xl p-8 group hover:border-emerald-500/30 transition-all duration-300 hover:glow-emerald">
            <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              🤝
            </div>
            <h3 className="text-xl font-bold mb-3">Settle Up</h3>
            <p className="text-zinc-400 leading-relaxed">
              One-click settlements with smart debt simplification.
              Minimize the number of payments needed in your group.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Get Started in{" "}
            <span className="text-gradient-violet">3 Simple Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400">
              1
            </div>
            <h3 className="text-xl font-bold">Create a Group</h3>
            <p className="text-zinc-400">
              Sign in with Google and create a group for your trip, apartment, dinner, or any shared expense.
            </p>
          </div>

          <div className="relative text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl font-bold text-violet-400">
              2
            </div>
            <h3 className="text-xl font-bold">Add Expenses</h3>
            <p className="text-zinc-400">
              Log expenses as they happen. Choose equal or exact splits — SplitEase calculates who owes what.
            </p>
          </div>

          <div className="relative text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400">
              3
            </div>
            <h3 className="text-xl font-bold">Settle Up</h3>
            <p className="text-zinc-400">
              See simplified debts and settle up with one click. No more spreadsheets or mental math.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="glass-card rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-violet-500/5 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Split <span className="text-gradient-emerald">Smarter</span>?
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Join thousands of people who use SplitEase to manage their shared expenses.
              It&apos;s free, fast, and fair.
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-block px-10 py-4 rounded-2xl gradient-emerald text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-emerald flex items-center justify-center font-bold text-sm text-white">
              S
            </div>
            <span className="font-bold">Split<span className="text-emerald-400">Ease</span></span>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} SplitEase. Built with Next.js & MongoDB.
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/AryanSri-235/SPLITWISE" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-emerald-400 transition">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
