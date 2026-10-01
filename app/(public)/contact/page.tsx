import { randomUUID } from "node:crypto";
import type { Metadata } from "next";

import { submitGeneralContactAction } from "@/app/(public)/intake-actions";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { GeneralContactForm } from "@/components/public/intake-forms";
import { OfficeMap } from "@/components/public/office-map";
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
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPublicMetadata({
  title: "Contact UrbanEdge Land Space",
  description:
    "Contact UrbanEdge about land discovery and brokerage support in Ahmedabad and Gandhinagar.",
  path: "/contact",
  robots: { index: true, follow: true },
});

export default async function ContactPage() {
  const [config, locale] = await Promise.all([loadPublicBusinessConfig(), getRequestLocale()]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const telephone = buildTelephoneUrl(config);
  const whatsapp = buildWhatsAppUrl(config);
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: t("contact.breadcrumb") }];
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <section className="collection-hero">
        <div className="site-container py-12 sm:py-16">
          <Breadcrumbs items={breadcrumbs} />
          <p className="eyebrow mt-7 text-[var(--brand-gold)]">{t("contact.eyebrow")}</p>
          <h1 className="public-page-title mt-3 max-w-4xl text-white">{t("contact.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{t("contact.intro")}</p>
        </div>
      </section>
      <section className="section">
        <div className="site-container conversion-layout">
          <div>
            <p className="eyebrow">{t("contact.direct")}</p>
            <h2 className="section-title">{t("contact.heading")}</h2>
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
                  className="button button-whatsapp"
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
      {config.officeAddress ? (
        <section className="section section-light contact-map-section">
          <div className="site-container">
            <OfficeMap
              address={config.officeAddress}
              mapUrl={OFFICIAL_OFFICE_MAP_URL}
              locale={locale}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
