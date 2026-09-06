import Link from "next/link";

import type { PublicGuide } from "@/features/content/domain/contracts";

import { ArrowIcon } from "./icons";

export function GuideCard({ guide }: Readonly<{ guide: PublicGuide }>) {
  return (
    <article className="guide-card">
      <p className="eyebrow">{guide.categoryName ?? "Land guide"}</p>
      <h2>
        <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
      </h2>
      <p>{guide.excerpt ?? "Practical land guidance from UrbanEdge."}</p>
      <Link className="text-link" href={`/guides/${guide.slug}`}>
        Read guide <ArrowIcon className="size-4" />
      </Link>
    </article>
  );
}
