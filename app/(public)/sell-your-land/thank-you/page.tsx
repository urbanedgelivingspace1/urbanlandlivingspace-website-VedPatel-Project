import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Land Submission Received",
  robots: { index: false, follow: false },
};

export default async function OwnerSubmissionThankYouPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ reference?: string }> }>) {
  const { reference } = await searchParams;
  const safeReference = reference?.match(/^UE-OS-[0-9]{6}$/)?.[0];
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main>
      <section className="section">
        <div className="site-container max-w-3xl">
          <Breadcrumbs
            items={[{ label: t("common.home"), href: "/" }, { label: t("sell.received") }]}
          />
          <div className="conversion-confirmation">
            <p className="eyebrow">{t("sell.received")}</p>
            <h1 className="section-title">{t("sell.thankYou")}</h1>
            <p className="section-copy">{t("sell.thankYouBody")}</p>
            {safeReference ? (
              <p>
                <strong>{t("sell.reference")}:</strong> {safeReference}
              </p>
            ) : null}
            <div>
              <Link className="button button-gold" href="/">
                {t("common.returnHome")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
