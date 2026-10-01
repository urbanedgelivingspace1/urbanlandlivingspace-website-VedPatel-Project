import Link from "next/link";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export default async function RequirementThankYouPage() {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="section">
      <div className="site-container max-w-3xl">
        <Breadcrumbs
          items={[{ label: t("common.home"), href: "/" }, { label: t("requirements.received") }]}
        />
        <div className="conversion-confirmation" role="status">
          <p className="eyebrow">{t("requirements.received")}</p>
          <h1>{t("requirements.thankYou")}</h1>
          <p>{t("requirements.thankYouBody")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="button button-primary">
              {t("common.exploreLand")}
            </Link>
            <Link href="/" className="button button-outline">
              {t("common.returnHome")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
