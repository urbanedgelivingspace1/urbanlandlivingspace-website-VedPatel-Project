"use client";

import { useEffect } from "react";

export default function ProtectedAdminError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("admin_protected_route_error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section aria-labelledby="admin-error-heading" className="max-w-2xl py-8">
      <p className="text-xs font-bold tracking-[0.16em] text-rose-600 uppercase">
        Something went wrong
      </p>
      <h1
        id="admin-error-heading"
        className="font-display mt-2 text-3xl font-semibold text-slate-900"
      >
        Unable to load this page
      </h1>
      <p className="mt-4 leading-7 text-slate-600">
        Some information could not be loaded. Refresh the page or contact technical support if the
        problem continues.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
