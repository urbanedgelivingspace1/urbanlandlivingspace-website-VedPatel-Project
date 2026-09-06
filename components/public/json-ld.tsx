import { serializeJsonLd } from "@/lib/seo/privacy-safe-seo";

export function JsonLd({ data }: Readonly<{ data: unknown }>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
