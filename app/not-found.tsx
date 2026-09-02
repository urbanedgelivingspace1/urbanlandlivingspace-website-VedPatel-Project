import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5">
      <section className="max-w-xl text-center">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--brand-navy)] uppercase">
          404
        </p>
        <h1 className="font-display mt-3 text-5xl text-[var(--brand-navy-deep)]">Page not found</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          The requested page is unavailable or has moved.
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 font-bold text-white"
          href="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
