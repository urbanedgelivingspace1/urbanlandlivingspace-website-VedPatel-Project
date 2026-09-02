export default function AdminFoundationPage() {
  return (
    <main
      aria-labelledby="admin-foundation-heading"
      className="rounded-3xl border border-white/10 p-8"
    >
      <p className="text-xs font-bold tracking-[0.18em] text-[var(--brand-gold)] uppercase">
        Development placeholder
      </p>
      <h1 id="admin-foundation-heading" className="font-display mt-4 text-4xl font-semibold">
        Admin foundation
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-300">
        The route group compiles, but authentication and operational tools intentionally begin in
        later milestones. This page is not an authenticated admin dashboard.
      </p>
    </main>
  );
}
