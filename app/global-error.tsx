"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
          <section className="max-w-lg text-center">
            <h1 className="font-display text-4xl">
              UrbanEdge Land Space is temporarily unavailable.
            </h1>
            <p className="mt-4 text-slate-300">Please refresh the page or return shortly.</p>
          </section>
        </main>
      </body>
    </html>
  );
}
