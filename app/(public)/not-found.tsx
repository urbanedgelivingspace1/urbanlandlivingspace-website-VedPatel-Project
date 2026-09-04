import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="public-state-page">
      <p className="eyebrow">404 · Not found</p>
      <h1>This land page is not available.</h1>
      <p>
        The URL may be incorrect, or the property may not be publicly listed. No private listing
        details are disclosed.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/properties" className="button button-primary">
          Explore published land
        </Link>
        <Link href="/" className="button button-outline">
          Return home
        </Link>
      </div>
    </main>
  );
}
