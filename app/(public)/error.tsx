"use client";

import Link from "next/link";

export default function PublicError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="public-state-page">
      <p className="eyebrow">Temporary interruption</p>
      <h1>We couldn&apos;t load this page.</h1>
      <p>Please try again, explore current land, or contact UrbanEdge if you need help.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="button button-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/properties" className="button button-outline">
          Explore Land
        </Link>
        <Link href="/contact" className="button button-outline" prefetch={false}>
          Contact UrbanEdge
        </Link>
      </div>
    </main>
  );
}
