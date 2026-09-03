import type { Metadata } from "next";

import { signInAdmin } from "./actions";

export const metadata: Metadata = { title: "Admin sign in" };

const messages: Readonly<Record<string, string>> = {
  invalid_input: "Check the email and password format and try again.",
  invalid_credentials: "The credentials could not be verified.",
  no_session: "Your session has expired. Sign in again.",
  not_active_admin: "This account is not authorized for the admin workspace.",
  unauthorized: "Admin authorization could not be verified.",
  signed_out: "You have signed out safely.",
};

export default async function AdminLoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ reason?: string }> }>) {
  const { reason } = await searchParams;
  const message = reason ? messages[reason] : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl sm:p-9">
        <p className="text-xs font-bold tracking-[0.18em] text-[var(--brand-gold)] uppercase">
          UrbanEdge Land Space
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Access is limited to active UrbanEdge admin profiles.
        </p>
        {message ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100"
          >
            {message}
          </p>
        ) : null}
        <form action={signInAdmin} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold">
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 font-normal"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--brand-gold)] px-4 py-3 font-bold text-slate-950 hover:bg-amber-300"
          >
            Sign in securely
          </button>
        </form>
      </section>
    </main>
  );
}
