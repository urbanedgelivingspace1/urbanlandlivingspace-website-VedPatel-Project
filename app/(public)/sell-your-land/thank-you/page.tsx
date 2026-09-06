import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const metadata: Metadata = {
  title: "Land Submission Received",
  robots: { index: false, follow: false },
};

export default async function OwnerSubmissionThankYouPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ reference?: string }> }>) {
  const { reference } = await searchParams;
  const safeReference = reference?.match(/^UE-OS-[0-9]{6}$/)?.[0];
  return (
    <main>
      <section className="section">
        <div className="site-container max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Submission received" }]} />
          <div className="conversion-confirmation">
            <p className="eyebrow">Received for private review</p>
            <h1 className="section-title">Thank you. Your land has not been published.</h1>
            <p className="section-copy">
              UrbanEdge will review the information, contact you if clarification or documents are
              needed, and decide whether it can move forward. A submission does not certify title,
              ownership, zoning, tenure or approvals.
            </p>
            {safeReference ? (
              <p>
                <strong>Submission reference:</strong> {safeReference}
              </p>
            ) : null}
            <div>
              <Link className="button button-gold" href="/">
                Return home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
