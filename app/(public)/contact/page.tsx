import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { submitGeneralContactAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { GeneralContactForm } from "@/components/public/intake-forms";
import { loadPublicBusinessConfig } from "@/server/queries/public-page-data";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact UrbanEdge Land Space",
  description:
    "Contact UrbanEdge about land discovery and brokerage support in Ahmedabad and Gandhinagar.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const config = await loadPublicBusinessConfig();
  const telephone = buildTelephoneUrl(config);
  const whatsapp = buildWhatsAppUrl(config);
  return (
    <main>
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">Contact UrbanEdge</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            Start with a clear land conversation.
          </h1>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">Direct contact</p>
            <h2 className="section-title">Use the channel that suits you.</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {telephone ? (
                <a className="button button-outline" href={telephone}>
                  Call UrbanEdge
                </a>
              ) : null}
              {whatsapp ? (
                <a
                  className="button button-outline"
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              ) : null}
              {config.email ? (
                <a className="button button-outline" href={`mailto:${config.email}`}>
                  Email
                </a>
              ) : null}
            </div>
            {config.officeAddress ? (
              <p className="mt-6 section-copy">{config.officeAddress}</p>
            ) : null}
          </div>
          <GeneralContactForm
            action={submitGeneralContactAction}
            idempotencyKey={randomUUID()}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </div>
      </section>
    </main>
  );
}
