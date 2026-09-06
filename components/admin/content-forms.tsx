import type { AdminSeoPage } from "@/server/services/content";

export function GuideForm({
  action,
  guide,
  categories,
}: Readonly<{
  action: (formData: FormData) => void | Promise<void>;
  guide?: Record<string, unknown> | null;
  categories: readonly { id: string; name: string }[];
}>) {
  const value = (key: string) => String(guide?.[key] ?? "");
  return (
    <form action={action} className="admin-form mt-6">
      <label>
        Title
        <input name="title" required maxLength={240} defaultValue={value("title")} />
      </label>
      <label>
        Slug
        <input
          name="slug"
          required
          maxLength={220}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={value("slug")}
        />
      </label>
      <label>
        Category
        <select name="categoryId" defaultValue={value("category_id")}>
          <option value="">Uncategorised</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Excerpt
        <textarea name="excerpt" rows={3} maxLength={500} defaultValue={value("excerpt")} />
      </label>
      <label>
        Body (controlled Markdown)
        <textarea name="bodyMarkdown" rows={18} required defaultValue={value("body_markdown")} />
      </label>
      <label>
        SEO title
        <input name="seoTitle" maxLength={220} defaultValue={value("seo_title")} />
      </label>
      <label>
        SEO description
        <textarea
          name="seoDescription"
          rows={3}
          maxLength={320}
          defaultValue={value("seo_description")}
        />
      </label>
      <fieldset>
        <legend>Approved guide hero (optional)</legend>
        <label>
          Object path
          <input name="heroObjectPath" defaultValue={value("hero_object_path")} />
        </label>
        <label>
          Alt text
          <input name="heroAltText" maxLength={300} defaultValue={value("hero_alt_text")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            Width
            <input name="heroWidth" type="number" min="1" defaultValue={value("hero_width_px")} />
          </label>
          <label>
            Height
            <input name="heroHeight" type="number" min="1" defaultValue={value("hero_height_px")} />
          </label>
        </div>
      </fieldset>
      <button className="button button-primary" type="submit">
        Save draft
      </button>
    </form>
  );
}

export function SeoPageForm({
  action,
  page,
}: Readonly<{ action: (formData: FormData) => void | Promise<void>; page: AdminSeoPage }>) {
  return (
    <form action={action} className="admin-form mt-6">
      <label>
        Governed route
        <input value={`/${page.slug}`} readOnly />
      </label>
      <label>
        H1
        <input name="title" required maxLength={240} defaultValue={page.title} />
      </label>
      <label>
        Introduction
        <textarea name="introText" rows={5} required defaultValue={page.intro_text ?? ""} />
      </label>
      <label>
        Body (controlled Markdown)
        <textarea name="bodyMarkdown" rows={20} required defaultValue={page.body_markdown ?? ""} />
      </label>
      <label>
        SEO title
        <input name="seoTitle" required maxLength={220} defaultValue={page.seo_title ?? ""} />
      </label>
      <label>
        Meta description
        <textarea
          name="seoDescription"
          rows={3}
          required
          maxLength={320}
          defaultValue={page.seo_description ?? ""}
        />
      </label>
      <button className="button button-primary" type="submit">
        Save content
      </button>
    </form>
  );
}
