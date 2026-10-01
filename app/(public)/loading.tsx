export default function PublicRouteLoading() {
  return (
    <main className="public-route-loading" aria-busy="true" aria-label="Loading page content">
      <div className="public-route-progress" aria-hidden="true" />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <div className="skeleton skeleton-dark h-4 w-40 rounded-md" />
          <div className="skeleton skeleton-dark mt-7 h-4 w-28 rounded-md" />
          <div className="skeleton skeleton-dark mt-4 h-12 w-full max-w-2xl rounded-xl" />
          <div className="skeleton skeleton-dark mt-5 h-5 w-full max-w-xl rounded-md" />
          <div className="skeleton skeleton-dark mt-3 h-5 w-3/4 max-w-md rounded-md" />
        </div>
      </section>
      <section className="section">
        <div className="site-container">
          <div className="skeleton h-4 w-32 rounded-md" />
          <div className="skeleton mt-4 h-9 w-full max-w-lg rounded-lg" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4" key={index}>
                <div className="skeleton aspect-[4/3] rounded-xl" />
                <div className="skeleton mt-5 h-4 w-24 rounded-md" />
                <div className="skeleton mt-3 h-6 w-4/5 rounded-md" />
                <div className="skeleton mt-4 h-4 w-3/5 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
