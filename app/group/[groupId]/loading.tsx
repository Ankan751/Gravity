export default function GroupLoading() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] pb-16 animate-pulse">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-250px] left-[-100px] w-[500px] h-[500px] rounded-full bg-zinc-800/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-40 bg-zinc-800 rounded-lg" />
              <div className="h-3 w-20 bg-zinc-900 rounded-md" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end sm:gap-3">
            <div className="h-10 rounded-xl bg-zinc-900 border border-zinc-800" />
            <div className="h-10 rounded-xl bg-zinc-800" />
          </div>
        </div>

        {/* Members & Balances Skeleton */}
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-800/80">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/70 flex items-center justify-between">
            <div className="h-5 w-44 bg-zinc-800 rounded-lg" />
            <div className="h-4 w-16 bg-zinc-900 rounded-md" />
          </div>
          <div className="p-3 sm:p-4 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-zinc-800 rounded" />
                  <div className="h-3 w-36 bg-zinc-900 rounded" />
                </div>
                <div className="h-6 w-16 bg-zinc-800/80 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Payments Skeleton */}
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-800/80">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/70">
            <div className="h-5 w-40 bg-zinc-800 rounded-lg" />
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-12 bg-zinc-900/40 rounded-xl border border-zinc-800/50" />
          </div>
        </div>

        {/* Activity History Skeleton */}
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-800/80">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/70">
            <div className="h-5 w-36 bg-zinc-800 rounded-lg" />
          </div>
          <div className="p-3 sm:p-4 space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-3 w-24 bg-zinc-900 rounded" />
                  </div>
                </div>
                <div className="h-5 w-14 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
