import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { submitGeneralContactAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { GeneralContactForm } from "@/components/public/intake-forms";
import { loadPublicBusinessConfig } from "@/server/queries/public-page-data";
import {
  buildTelephoneUrl,
  buildWhatsAppUrl,
  OFFICIAL_OFFICE_MAP_URL,
  OFFICIAL_PHONE_DISPLAY,
} from "@/lib/config/public-business";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPublicMetadata({
  title: "Contact UrbanEdge Land Space",
  description:
    "Contact UrbanEdge about land discovery and brokerage support in Ahmedabad and Gandhinagar.",
  path: "/contact",
  robots: { index: true, follow: true },
});

export default async function ContactPage() {
  const config = await loadPublicBusinessConfig();
  const telephone = buildTelephoneUrl(config);
  const whatsapp = buildWhatsAppUrl(config);
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Contact" }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">Contact UrbanEdge</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">
            Speak with UrbanEdge about your land requirement.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            Buyer, investor or landowner—we’ll help you find the right next step across Ahmedabad
            and Gandhinagar.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">Direct contact</p>
            <h2 className="section-title">Call, message or visit our Gandhinagar office.</h2>
            <div className="contact-methods mt-7">
              <div>
                <span>Phone</span>
                <strong>{OFFICIAL_PHONE_DISPLAY}</strong>
                <small>For buyer requirements, property enquiries and owner submissions.</small>
              </div>
              <div>
                <span>Office</span>
                <strong>Randesan, Gandhinagar</strong>
                <small>{config.officeAddress}</small>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 contact-actions">
              {telephone ? (
                <a className="button button-outline" href={telephone}>
                  Call {OFFICIAL_PHONE_DISPLAY}
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
              <a
                className="button button-outline"
                href={OFFICIAL_OFFICE_MAP_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open Google Maps
              </a>
            </div>
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
