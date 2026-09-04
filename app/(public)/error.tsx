"use client";

export default function PublicError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="public-state-page">
      <p className="eyebrow">Temporary interruption</p>
      <h1>We could not load this page safely.</h1>
      <p>No private or incomplete property information has been shown. Please try again.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
