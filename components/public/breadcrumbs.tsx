import Link from "next/link";

import { ChevronIcon } from "./icons";

export function Breadcrumbs({
  items,
}: Readonly<{ items: readonly { label: string; href?: string }[] }>) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronIcon className="size-3.5" /> : null}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
