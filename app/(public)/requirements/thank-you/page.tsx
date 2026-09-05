import Link from "next/link";

import { Breadcrumbs } from "@/components/public/breadcrumbs";

export default function RequirementThankYouPage() {
  return (
    <main className="section">
      <div className="site-container max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Requirement received" }]} />
        <div className="conversion-confirmation" role="status">
          <p className="eyebrow">Requirement received</p>
          <h1>Thank you. Your requirement has been shared with UrbanEdge.</h1>
          <p>
            Our team will review it and contact you about suitable land opportunities. No fixed
            response time or property match is promised.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="button button-primary">
              Explore land
            </Link>
            <Link href="/" className="button button-outline">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
