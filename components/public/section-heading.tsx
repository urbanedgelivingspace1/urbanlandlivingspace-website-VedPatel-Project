export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}>) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-3">{title}</h2>
      <span className={align === "center" ? "gold-rule mx-auto" : "gold-rule"} aria-hidden="true" />
      {description ? <p className="section-copy mt-5">{description}</p> : null}
    </div>
  );
}
