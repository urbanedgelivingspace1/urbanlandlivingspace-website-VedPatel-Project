const checks = ["Independent application", "Privacy-first boundary", "Testable from day one"];

export function FoundationStatus() {
  return (
    <aside
      aria-labelledby="foundation-status-heading"
      className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-2xl shadow-[var(--brand-navy)]/10 backdrop-blur"
    >
      <h2
        id="foundation-status-heading"
        className="font-display text-2xl text-[var(--brand-navy-deep)]"
      >
        Foundation principles
      </h2>
      <ul className="mt-5 space-y-3">
        {checks.map((check) => (
          <li className="flex items-center gap-3 text-sm font-semibold text-slate-700" key={check}>
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--brand-gold)]" />
            {check}
          </li>
        ))}
      </ul>
    </aside>
  );
}
