import Link from "next/link";
import type { ReactNode } from "react";

function inline(value: string): ReactNode[] {
  const output: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;
  let last = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    const href = match[2];
    if (!href || !/^\/[a-z0-9][a-z0-9/_-]*(?:#[a-z0-9_-]+)?$/i.test(href)) continue;
    output.push(value.slice(last, index));
    output.push(
      <Link href={href} key={`${href}-${index}`}>
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  output.push(value.slice(last));
  return output;
}

export function SafeMarkdown({ value }: Readonly<{ value: string }>) {
  const blocks = value.trim().split(/\n\s*\n/);
  return (
    <div className="safe-markdown">
      {blocks.map((block, index) => {
        const text = block.trim();
        if (text.startsWith("### ")) return <h3 key={index}>{inline(text.slice(4))}</h3>;
        if (text.startsWith("## ")) return <h2 key={index}>{inline(text.slice(3))}</h2>;
        const lines = text.split("\n");
        if (lines.every((line) => line.startsWith("- ")))
          return (
            <ul key={index}>
              {lines.map((line) => (
                <li key={line}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        return <p key={index}>{inline(text.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
