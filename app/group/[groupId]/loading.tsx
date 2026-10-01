export default function GroupLoading() {
  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f5] pb-16 animate-pulse">
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141418] border border-zinc-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-40 bg-[#141418] rounded-lg" />
              <div className="h-3 w-20 bg-[#121215] rounded" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end sm:gap-3">
            <div className="h-10 rounded-xl bg-[#141418] border border-zinc-800" />
            <div className="h-10 rounded-xl bg-zinc-800" />
          </div>
        </div>

        {/* Members & Balances Skeleton */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="h-4 w-40 bg-[#141418] rounded" />
            <div className="h-3 w-16 bg-[#141418] rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="dev-surface flex items-center gap-3.5 p-3 rounded-xl"
              >
                <div className="dev-icon-box w-10 h-10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-[#181820] rounded" />
                  <div className="h-3 w-36 bg-[#141418] rounded" />
                </div>
                <div className="h-6 w-16 bg-[#181820] rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Payments Skeleton */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="h-4 w-36 bg-[#141418] rounded pb-2" />
          <div className="space-y-2">
            <div className="h-12 dev-surface rounded-xl" />
          </div>
        </div>

        {/* Activity History Skeleton */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="h-4 w-32 bg-[#141418] rounded pb-2" />
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="dev-surface p-3.5 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="dev-icon-box w-9 h-9 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-[#181820] rounded" />
                    <div className="h-3 w-24 bg-[#141418] rounded" />
                  </div>
                </div>
                <div className="h-5 w-14 bg-[#181820] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
