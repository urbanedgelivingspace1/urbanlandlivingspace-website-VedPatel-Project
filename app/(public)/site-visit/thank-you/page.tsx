import Link from "next/link";

export default async function SiteVisitThankYouPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const value = (await searchParams).property;
  const property = typeof value === "string" && /^UE-LS-\d{6}$/.test(value) ? value : null;
  return (
    <main className="section">
      <div className="site-container max-w-3xl">
        <div className="conversion-confirmation" role="status">
          <p className="eyebrow">Request received</p>
          <h1>Your preferred visit window has been shared with UrbanEdge.</h1>
          <p>
            {property ? `The request concerns ${property}. ` : ""}This is not a confirmed booking.
            UrbanEdge will check property access and availability before confirming anything.
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
