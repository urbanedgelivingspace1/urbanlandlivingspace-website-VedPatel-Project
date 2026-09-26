export default function ProtectedAdminLoading() {
  return (
    <div
      className="mx-auto max-w-[1380px] space-y-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading page content"
    >
      {/* Header skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-4 w-28 rounded-md" />
          <div className="skeleton h-9 w-56 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-10 w-28 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.03)] space-y-3"
          >
            <div className="skeleton h-4 w-24 rounded-md" />
            <div className="skeleton h-8 w-16 rounded-md" />
            <div className="skeleton h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Panels Skeleton */}
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, panelIndex) => (
          <div
            key={panelIndex}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="skeleton h-5 w-44 rounded-md" />
              <div className="skeleton h-4 w-16 rounded-md" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-4 w-1/2 rounded-md" />
                    <div className="skeleton h-3 w-3/4 rounded-md" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
