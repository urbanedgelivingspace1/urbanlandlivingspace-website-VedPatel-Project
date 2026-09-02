import { FoundationStatus } from "@/components/foundation/foundation-status";

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(218,186,82,0.22),transparent_34%),linear-gradient(145deg,#ffffff_0%,#f5f5f1_64%,#ececdf_100%)]"
      />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <section aria-labelledby="foundation-heading" className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-[var(--brand-gold)]/50 bg-white px-4 py-2 text-xs font-bold tracking-[0.18em] text-[var(--brand-navy)] uppercase shadow-sm">
            Development foundation
          </p>
          <h1
            id="foundation-heading"
            className="font-display text-5xl leading-[1.05] font-semibold text-[var(--brand-navy-deep)] sm:text-6xl lg:text-7xl"
          >
            Land deserves a more considered search.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            UrbanEdge Land Space is being built as a focused, privacy-conscious land discovery
            service for Ahmedabad and Gandhinagar. This screen is an engineering placeholder, not
            live inventory or a production launch.
          </p>
        </section>

        <FoundationStatus />
      </div>
    </main>
  );
}
