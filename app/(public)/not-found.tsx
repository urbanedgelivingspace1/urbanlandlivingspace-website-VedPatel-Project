import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="public-state-page">
      <p className="eyebrow">404 · Not found</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p>
        The link may be outdated, or the property may no longer be publicly available. You can
        continue exploring or tell UrbanEdge what you need.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/properties" className="button button-primary">
          Explore Land
        </Link>
        <Link href="/requirements" className="button button-outline" prefetch={false}>
          Share Requirement
        </Link>
        <Link href="/contact" className="button button-outline" prefetch={false}>
          Contact UrbanEdge
        </Link>
        <Link href="/" className="button button-outline">
          Go Home
        </Link>
      </div>
    </main>
  );
}
