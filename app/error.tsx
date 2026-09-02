"use client";

type ErrorPageProps = Readonly<{
  reset: () => void;
}>;

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-muted)] px-5">
      <section className="max-w-lg rounded-3xl border border-[var(--border)] bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--brand-navy)] uppercase">
          Something went wrong
        </p>
        <h1 className="font-display mt-3 text-4xl text-[var(--brand-navy-deep)]">
          We could not load this page.
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          No private error details are shown here. Try the request again.
        </p>
        <button
          className="mt-6 min-h-11 rounded-full bg-[var(--brand-navy)] px-6 py-3 font-bold text-white"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
