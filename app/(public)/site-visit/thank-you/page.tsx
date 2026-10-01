import Link from "next/link";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export default async function SiteVisitThankYouPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const value = (await searchParams).property;
  const property = typeof value === "string" && /^UE-LS-\d{6}$/.test(value) ? value : null;
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="section">
      <div className="site-container max-w-3xl">
        <div className="conversion-confirmation" role="status">
          <p className="eyebrow">{t("visit.received")}</p>
          <h1>{t("visit.thankYou")}</h1>
          <p>
            {property ? `${property}. ` : ""}
            {t("visit.thankYouBody")}
          </p>
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
