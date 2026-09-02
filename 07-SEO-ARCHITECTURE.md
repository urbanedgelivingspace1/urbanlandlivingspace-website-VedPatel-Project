# URBANEDGE LAND SPACE — SEO ARCHITECTURE

**File:** `07-SEO-ARCHITECTURE.md`  
**System:** UrbanEdge Land Space V1  
**Parent architecture:** `01-MASTER-WEBSITE-ARCHITECTURE.md`  
**Route/UX contract:** `02-PAGE-ROUTE-UX-ARCHITECTURE.md`  
**Database contract:** `03-DATABASE-SCHEMA-ARCHITECTURE.md`  
**Business/product scope:** `LANDSPACE_PRODUCT_REQUIREMENTS.md`  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Expansion direction:** Gujarat → India  
**Primary domain:** `https://urbanedgelandspace.com`  
**Architecture date:** 30 August 2026  
**Status:** Specialist SEO architecture / coding-agent handoff

---

## 0. Document Purpose

This document defines the production SEO architecture for UrbanEdge Land Space.

It converts the parent architecture's SEO-first, server-rendered, curated-land model into exact implementation rules for:

- URL design;
- metadata;
- canonicalization;
- index/noindex behavior;
- structured data;
- XML sitemaps;
- `robots.txt`;
- SSR and crawlability;
- property-detail SEO;
- category pages;
- Ahmedabad/Gandhinagar location pages;
- future Gujarat expansion;
- search/filter crawl control;
- pagination;
- property lifecycle SEO;
- slug-change redirects;
- breadcrumbs;
- Open Graph/social metadata;
- guide/content strategy;
- thin-page prevention;
- public/private/approximate location safety in both visible HTML and machine-readable markup.

This document must not be used to create mass programmatic SEO pages. UrbanEdge is a curated brokerage platform, not a location-keyword page generator.

---

# 1. Source Alignment and Non-Negotiable Constraints

The following existing architecture decisions remain authoritative.

## 1.1 Product model

UrbanEdge Land Space is a curated, brokerage-led land discovery and lead-management platform for:

- Agricultural Land;
- NA Land;
- Industrial Land;
- Buy;
- Rent;
- Lease;
- Sell Your Land as an owner-submission workflow.

SEO exists to attract qualified land demand and strengthen trust. It does not exist to maximize page count.

## 1.2 V1 geography

Public V1 focuses on:

- Ahmedabad;
- Gandhinagar.

The geography system remains configurable for broader Gujarat and later India.

## 1.3 Public route contract

The established public routes include:

```text
/
/properties
/properties/[property-slug]

/agricultural-land
/na-land
/industrial-land

/buy
/rent
/lease

/sell-your-land
/requirements
/site-visit

/guides
/guides/[guide-slug]
/guides/category/[category-slug]

/locations/ahmedabad
/locations/gandhinagar
/locations/[city]/[category]

/about
/contact
/terms
/privacy
/disclaimer
/search
```

This SEO architecture refines how these routes are crawled, indexed, canonicalized and expanded. It does not replace the route architecture.

## 1.4 Server-first requirement

Public SEO content must be present in the initial HTML response.

Client-side JavaScript may enhance:

- filters;
- maps;
- galleries;
- accordions;
- analytics;
- form interactions.

It must not be required to reveal the primary listing text, H1, breadcrumb, canonical, metadata, public price/area/location, status or structured data.

## 1.5 Public/private coordinate requirement

Location visibility has three states:

```text
EXACT
APPROXIMATE
HIDDEN
```

Default:

```text
APPROXIMATE
```

Private exact coordinates must never be sent to the browser for `APPROXIMATE` or `HIDDEN` listings.

That prohibition applies equally to:

- HTML;
- React/Next.js props;
- JSON responses;
- JSON-LD;
- Open Graph metadata;
- map configuration;
- client state;
- analytics payloads;
- hidden DOM attributes;
- image metadata if UrbanEdge controls the image processing pipeline.

## 1.6 Existing SEO data model

The database already provides:

- property `public_slug`;
- property `seo_title`;
- property `seo_description`;
- property `canonical_path`;
- guide SEO fields;
- curated `seo_pages`;
- `seo_page_status` values:

```text
DRAFT
REVIEW
PUBLISHED
NOINDEX
ARCHIVED
```

The `seo_pages` entity is the only mechanism for intentionally creating curated location/category SEO landing pages beyond the permanent core routes.

---

# 2. SEO Principles

## 2.1 One useful page per search intent

Create a new indexable URL only when it represents a meaningfully distinct user intent with useful content.

Do not create multiple URLs simply because different words can be combined.

Bad pattern:

```text
/agricultural-land-in-ahmedabad
/buy-agricultural-land-ahmedabad
/agricultural-land-for-sale-ahmedabad
/best-agricultural-land-ahmedabad
/cheap-agricultural-land-ahmedabad
```

Preferred architecture:

```text
/agricultural-land
/locations/ahmedabad
/locations/ahmedabad/agricultural-land
```

Search/filter state handles the rest.

## 2.2 Curated paths, not combinatorial paths

Indexable discovery pages are explicitly approved routes.

Arbitrary combinations of:

- district;
- taluka;
- locality;
- transaction;
- category;
- budget;
- area;
- road width;
- GIDC status;
- verification status;
- sorting;
- availability;

must not automatically become indexable pages.

## 2.3 Search state is not SEO architecture

`/properties?...` is primarily a user-state URL system.

A filter URL can be:

- shareable;
- bookmarkable;
- server-rendered;
- useful to a visitor;

without being eligible for indexing.

## 2.4 Stable pages should survive inventory fluctuations

Do not automatically switch a strong location/category page between `index` and `noindex` every time inventory moves from 3 listings to 2 and back.

Indexability is an editorial state with automated quality checks, not a minute-by-minute inventory calculation.

## 2.5 Metadata never overrides reality

Do not place claims in metadata or structured data that are not supported by visible public content.

Examples that must never be fabricated:

- exact price;
- availability;
- exact coordinates;
- approval status;
- legal/title status;
- reviews;
- ratings;
- investment returns;
- appreciation projections.

---

# 3. Canonical Host and URL Normalization

## 3.1 Canonical origin

The canonical production origin is:

```text
https://urbanedgelandspace.com
```

Rules:

1. HTTPS only.
2. Non-canonical host variants permanently redirect to the canonical host.
3. One trailing-slash policy must be used globally. V1 recommendation: **no trailing slash** except `/`.
4. Paths are lowercase.
5. Slug words use hyphens, not underscores.
6. Duplicate slashes are normalized.
7. Default ports are never exposed.
8. Query parameter names are case-sensitive contracts and should remain consistently camelCase or lowercase according to the search implementation; do not support multiple aliases for the same parameter.

## 3.2 Canonical URL examples

```text
https://urbanedgelandspace.com/
https://urbanedgelandspace.com/properties
https://urbanedgelandspace.com/properties/agricultural-land-near-sanand
https://urbanedgelandspace.com/agricultural-land
https://urbanedgelandspace.com/locations/ahmedabad
https://urbanedgelandspace.com/locations/ahmedabad/agricultural-land
https://urbanedgelandspace.com/guides/agricultural-land-buying-checklist-gujarat
```

## 3.3 URLs that must normalize or redirect

Examples:

```text
/AGRICULTURAL-LAND               → /agricultural-land
/agricultural_land               → /agricultural-land only if legacy URL existed
/properties/?page=1              → /properties
/properties?page=01              → /properties
/properties?page=2&page=2        → normalized single page parameter
```

Do not create duplicate live variants to accommodate capitalization or alternate punctuation.

---

# 4. Canonical Public URL Architecture

## 4.1 Permanent core routes

### Brand / utility

```text
/
/about
/contact
/sell-your-land
```

### Discovery

```text
/properties
/agricultural-land
/na-land
/industrial-land
/buy
/rent
/lease
```

### Property

```text
/properties/[property-slug]
```

### Editorial

```text
/guides
/guides/[guide-slug]
/guides/category/[category-slug]
```

### V1 locations

```text
/locations/ahmedabad
/locations/gandhinagar

/locations/ahmedabad/agricultural-land
/locations/ahmedabad/na-land
/locations/ahmedabad/industrial-land

/locations/gandhinagar/agricultural-land
/locations/gandhinagar/na-land
/locations/gandhinagar/industrial-land
```

These location/category routes may exist technically before they are indexable, but they may only be published as indexable pages when the quality gates in this document pass.

## 4.2 Future Gujarat route expansion

When UrbanEdge opens another Gujarat district, use the same district-level pattern:

```text
/locations/[district-slug]
/locations/[district-slug]/agricultural-land
/locations/[district-slug]/na-land
/locations/[district-slug]/industrial-land
```

Examples only after business activation and SEO approval:

```text
/locations/mehsana
/locations/mehsana/agricultural-land
/locations/vadodara/industrial-land
```

A district existing in the database does **not** create an SEO page.

## 4.3 Future taluka/locality pages

Taluka/locality SEO pages are **not V1 default routes**.

If later introduced, use explicit hierarchy markers rather than ambiguous positional slugs:

```text
/locations/[district]/taluka/[taluka]
/locations/[district]/locality/[locality]
```

Potential category refinements:

```text
/locations/[district]/taluka/[taluka]/agricultural-land
/locations/[district]/locality/[locality]/industrial-land
```

These routes require the stricter expansion gates in Section 16.

Do not use:

```text
/land-in-[every-village]
/agricultural-land-in-[every-village]
```

## 4.4 Transaction + geography combinations

V1 must **not** automatically generate combinations such as:

```text
/locations/ahmedabad/agricultural-land/buy
/locations/ahmedabad/industrial-land/lease
```

Use `/buy`, `/rent`, `/lease` plus filters for user discovery.

A future transaction + geography landing page requires:

- documented search/user value;
- meaningful active inventory;
- substantial unique content;
- manual SEO approval;
- a distinct `seo_pages` record;
- an ADR/route architecture update if a new path shape is introduced.

---

# 5. Indexability Matrix

The following is the default V1 robots/index policy.

| Page type | Default | Sitemap | Canonical |
|---|---|---:|---|
| `/` | `index,follow` | yes | self |
| `/properties` | `index,follow` | yes | self |
| `/properties?page=N` valid | `index,follow` | optional | self |
| `/properties?...filters...` | `noindex,follow` | no | normalized rule below |
| Property detail, published | `index,follow` | yes | self |
| Agricultural / NA / Industrial core category | quality-gated `index,follow` | yes when indexable | self |
| `/buy`, `/rent`, `/lease` | quality-gated `index,follow` | yes when indexable | self |
| Ahmedabad / Gandhinagar page | quality-gated `index,follow` | yes when indexable | self |
| Location + category page | strict quality-gated | yes when indexable | self |
| Future taluka/locality page | stricter quality-gated | yes when indexable | self |
| `/guides` | `index,follow` | yes | self |
| Published guide | `index,follow` | yes | self |
| Guide category | quality-gated | yes when indexable | self |
| `/about` | `index,follow` | yes | self |
| `/contact` | `index,follow` | yes | self |
| `/sell-your-land` | `index,follow` if substantive | yes when indexable | self |
| `/requirements` | `noindex,follow` by default | no | self |
| `/site-visit` | `noindex,follow` | no | self |
| Thank-you pages | `noindex,follow` | no | self |
| `/search` | `noindex,follow` | no | self |
| Terms / Privacy / Disclaimer | `noindex,follow` by default | no | self |
| Admin | inaccessible to anonymous + `noindex` defense | no | n/a |
| API routes | non-indexable | no | n/a |
| Draft/unpublished content | non-public | no | n/a |
| Invalid route | 404 | no | none |
| Intentionally removed page | 410 where appropriate | no | none |

`noindex,follow` is preferred over `noindex,nofollow` for public utility/form pages so normal internal links can still be discovered.

---

# 6. Exact Indexability Rules for Category and Location Pages

This is the key anti-thin-page contract.

Search engines do not define an official minimum listing count or word count. The thresholds below are **UrbanEdge V1 publishing rules** designed to prevent thin programmatic SEO.

## 6.1 Universal gates — every indexable SEO landing page

A category, transaction, location, or location+category page may be `index,follow` only if **all** of the following are true:

1. The route is a deliberate approved route, not a generated filter permutation.
2. The page has a unique H1.
3. The page has a unique SEO title.
4. The page has a useful meta description.
5. The canonical resolves to the same intended page and returns HTTP 200.
6. The page has at least one meaningful visible paragraph written for that exact user intent.
7. The page has a useful discovery component or an explicit requirement CTA.
8. The page has at least two crawlable internal links to relevant next steps, excluding global header/footer links.
9. No sibling landing page is merely the same body with the location/category token swapped.
10. Public location wording follows the privacy model.
11. Inventory counts use only public, published inventory.
12. The page has an admin/editorial approval state.
13. It is not marked `NOINDEX` or `ARCHIVED` in `seo_pages`.
14. It is not duplicating another canonical page's primary intent.
15. It is eligible to be included in the XML sitemap.

If any universal gate fails, the page must remain `noindex,follow` or unpublished.

## 6.2 Core category pages

Applies to:

```text
/agricultural-land
/na-land
/industrial-land
```

A core category page may be indexed if it passes the universal gates **and either Route A or Route B**.

### Route A — inventory-supported

All required:

- at least **3 published relevant properties** currently `AVAILABLE` or `UNDER_NEGOTIATION`;
- at least **250 words** of useful category-specific editorial content across the page excluding listing-card text, navigation and boilerplate;
- a category explanation;
- at least one land-specific decision/help section;
- links to Ahmedabad and/or Gandhinagar discovery when relevant.

### Route B — evergreen editorial-supported

All required:

- at least **700 words** of substantial original category content;
- content explains the category, important buyer considerations and how UrbanEdge handles the category;
- at least **2 relevant internal guide links** or equivalent substantial internal resources;
- a truthful empty/limited-inventory state if current inventory is low;
- no wording implying inventory exists when it does not.

This allows permanent category pages to remain useful even when curated inventory temporarily becomes sparse.

## 6.3 Core transaction pages

Applies to:

```text
/buy
/rent
/lease
```

Index only if the universal gates pass and either:

- at least **3 published relevant listings** support that transaction plus at least **250 words** of transaction-specific content; or
- the page contains at least **700 words** of genuine transaction-specific educational/discovery content and useful navigation to inventory/requirements.

Do not index a transaction page that is merely a filter wrapper with a different H1.

## 6.4 District-level location pages

Applies first to:

```text
/locations/ahmedabad
/locations/gandhinagar
```

Index only if the universal gates pass and either:

### Inventory-supported district page

- at least **3 published active listings** in the district across one or more land categories;
- at least **350 words** of original district-specific land context;
- at least two useful district-specific subsections, such as connectivity, major land-use/search considerations, industrial/development context, or how UrbanEdge covers the district;
- links to every qualifying category page for that district.

### Editorial-supported district page

- at least **900 words** of substantial district-specific land content;
- at least **2 district-relevant guides/resources**;
- a clear current-inventory state;
- a buyer-requirement CTA when inventory is sparse.

## 6.5 District + category pages

Applies to routes such as:

```text
/locations/ahmedabad/agricultural-land
/locations/gandhinagar/industrial-land
```

Index only if the universal gates pass and **one** of these two gates passes.

### Gate A — inventory + editorial

All required:

- at least **3 published properties** matching the exact district + category combination and currently `AVAILABLE` or `UNDER_NEGOTIATION`;
- at least **350 words** of original content specific to that district + category combination;
- at least one meaningful local land-context section that is not copied from the parent district page;
- at least one related guide/resource or strong explanatory block;
- a relevant property/requirement CTA.

### Gate B — strong editorial page without inventory threshold

All required:

- at least **1,000 words** of substantial original content specific to the district + category;
- at least **3 meaningful internal references** composed of guides, parent category, parent district, relevant inventory, or authoritative external references where appropriate;
- a clear statement when no matching public listings are currently available;
- no fake listing cards, placeholder prices or invented market statistics;
- manual SEO/editorial approval.

Gate B exists for genuinely useful local educational pages, not for manufacturing keyword coverage.

## 6.6 Future taluka/locality pages

A future taluka/locality page may be indexed only when:

- the route is explicitly approved;
- the geography node is active for business operations;
- at least **5 published active properties** match that geography, **or** the page has at least **1,200 words** of substantial original location-specific editorial value;
- the page contains at least **400 words** of local editorial content even when the inventory threshold is met;
- the content includes at least two genuinely local facts/considerations that are not copied from the district page;
- at least two useful internal links are available;
- the page has manual editorial approval;
- the page is added explicitly to `seo_pages` or equivalent governed content configuration;
- the page appears in the sitemap only after approval.

## 6.7 Inventory-count definition

For SEO quality gates, a property counts as active inventory only when:

```text
publication_status = PUBLISHED
AND deleted_at IS NULL
AND archived_at IS NULL
AND availability_status IN (AVAILABLE, UNDER_NEGOTIATION)
```

`SOLD`, `RENTED`, `LEASED` and `OFF_MARKET` properties do not count toward active-inventory thresholds.

## 6.8 No automatic indexability flapping

Once a page has been approved and indexed:

- a temporary fall below the inventory threshold does not automatically add `noindex`;
- if active matching inventory becomes **zero for 30 consecutive days**, the SEO admin should reassess the page;
- the page may remain indexed if it still passes the editorial-supported gate;
- otherwise change the page to `NOINDEX` or archive it according to content value.

This avoids unstable index/noindex changes caused by normal brokerage inventory turnover.

---

# 7. Thin-Page Prevention

## 7.1 Prohibited patterns

Do not publish pages that consist mainly of:

- one H1;
- a reused introduction;
- zero or one listing card;
- a generic CTA;
- a location name swapped into a template.

Do not generate pages for every:

- village;
- PIN code;
- road;
- survey number;
- GIDC estate;
- TP scheme;
- price band;
- land-area range;
- combination of filter attributes.

## 7.2 Duplicate-content editorial warning

The admin SEO workflow should compare the main body content of sibling `seo_pages`.

Recommended warning rule:

- if normalized main-body text similarity is **70% or greater**, show a duplicate-content warning before publication;
- the warning may be overridden only by an admin/editorial decision;
- an override does not itself make the page indexable if the universal quality gates fail.

This is a quality-control warning, not a search-engine penalty detector.

## 7.3 No placeholder index pages

Pages containing any of the following must remain `noindex`:

- `Coming soon` as the primary content;
- `No listings yet` with no substantive editorial value;
- automatically generated location copy;
- incomplete metadata;
- empty guide categories;
- unresolved placeholder images/text;
- duplicated SEO titles/H1s that create the same intent.

---

# 8. Search and Filter Indexability

## 8.1 Search route

Canonical discovery route:

```text
/properties
```

Search state uses stable query parameters.

Conceptual example:

```text
/properties?district=ahmedabad&category=agricultural&transaction=buy&minArea=10000&page=2&sort=newest
```

## 8.2 Filter URLs are user-state URLs

The following parameter classes are **not indexable by default**:

- `q` / free-text search;
- `district`;
- `taluka`;
- `locality`;
- `category`;
- `transaction`;
- `minArea`;
- `maxArea`;
- `minPrice`;
- `maxPrice`;
- `availability`;
- category-specific filters;
- verification filters;
- media filters;
- `sort`.

If a combination deserves organic visibility, create or approve a dedicated curated path rather than indexing the query URL.

## 8.3 Filter response metadata

For a normal filtered result URL:

```text
robots: noindex,follow
```

Canonical behavior:

### Case 1 — exact semantic duplicate of a curated page

Example:

```text
/properties?district=ahmedabad&category=agricultural
```

If this returns the same intended discovery set as:

```text
/locations/ahmedabad/agricultural-land
```

and that curated page is published, set canonical to the curated page.

Do this only when the meaning and primary content are genuinely equivalent.

### Case 2 — arbitrary filter combination

Example:

```text
/properties?district=ahmedabad&category=agricultural&minArea=10000&maxArea=15000&sort=price-asc
```

Use:

```text
robots: noindex,follow
canonical: normalized self URL or nearest truly equivalent non-filter route only when semantically valid
```

Do not lie with a canonical pointing to an unrelated broader page.

## 8.4 Parameter normalization

Before rendering/canonical generation:

- remove empty parameters;
- remove default values where not needed;
- deduplicate repeated values;
- normalize known enum values;
- reject invalid enum values;
- sort multi-value parameters into a deterministic order;
- do not place temporary UI state into the URL;
- remove tracking parameters from canonical URLs.

## 8.5 Tracking parameters

Examples:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
gclid
fbclid
```

Rules:

- the page may still render normally;
- canonical excludes tracking parameters;
- sitemap never includes tracking URLs;
- internal links should not preserve tracking parameters after normal site navigation unless analytics requirements explicitly require it.

## 8.6 Crawl control for high-cardinality facets

Because filter combinations can create effectively unlimited URLs, `robots.txt` should discourage crawling of high-cardinality search parameters that have no indexing value.

However:

- do not use `robots.txt` as the mechanism for removing a URL already indexed;
- `noindex` must remain visible to crawlers where deindexing is required;
- deploy aggressive query blocking only for parameter groups UrbanEdge has decided never need organic indexing.

---

# 9. Pagination

## 9.1 URL format

Use:

```text
?page=2
?page=3
```

Do not use:

```text
#page=2
/page/2 if the existing route contract remains query-based
```

## 9.2 Page 1

Canonical first page has no page parameter:

```text
/properties
/agricultural-land
/locations/ahmedabad/agricultural-land
/guides
```

Requests with:

```text
?page=1
?page=01
```

should permanently normalize to the first-page URL.

## 9.3 Page 2+

For an indexable collection:

```text
/agricultural-land?page=2
```

must have:

- a unique crawlable URL;
- a self-referencing canonical;
- server-rendered listing links;
- normal sequential `<a href>` links to previous/next pages where applicable;
- HTTP 200 only when the page number contains valid results.

Do **not** canonicalize every paginated page to page 1.

## 9.4 Out-of-range pagination

Example:

```text
/agricultural-land?page=9999
```

when only 4 pages exist:

```text
HTTP 404
```

Do not redirect an invalid page number to page 1.

## 9.5 Filter + pagination

Example:

```text
/properties?district=ahmedabad&minArea=10000&page=2
```

inherits the parent filtered URL's `noindex` policy.

Pagination does not make a filtered page indexable.

## 9.6 Infinite scroll / load more

If the UI later adds infinite scroll or `Load More`, maintain crawlable paginated URLs underneath it.

Search engines must not need to click a JavaScript button to discover deeper listings.

---

# 10. Metadata Architecture

## 10.1 Next.js implementation

Use the Next.js Metadata API.

Preferred tools:

```text
export const metadata
export async function generateMetadata()
app/robots.ts
app/sitemap.ts or generated sitemap routes
opengraph-image.* / ImageResponse where justified
```

Do not inject primary SEO metadata only after hydration.

## 10.2 Metadata source priority

For pages with admin SEO overrides:

```text
explicit approved SEO field
→ deterministic page-type template
→ safe fallback
```

Never expose internal notes as metadata fallbacks.

## 10.3 Title rules

Editorial target:

- usually concise enough to display well in search;
- normally around 45–65 characters when practical;
- no hard truncation purely because of character count;
- unique by primary intent;
- brand appended once.

Do not repeat exact-match phrases unnaturally.

### Homepage

Recommended pattern:

```text
Land in Ahmedabad & Gandhinagar | UrbanEdge Land Space
```

### Category

```text
Agricultural Land in Ahmedabad & Gandhinagar | UrbanEdge
NA Land in Ahmedabad & Gandhinagar | UrbanEdge
Industrial Land in Ahmedabad & Gandhinagar | UrbanEdge
```

### District

```text
Land in Ahmedabad | Agricultural, NA & Industrial | UrbanEdge
Land in Gandhinagar | Agricultural, NA & Industrial | UrbanEdge
```

### District + category

```text
Agricultural Land in Ahmedabad | UrbanEdge Land Space
Industrial Land in Gandhinagar | UrbanEdge Land Space
```

### Transaction

```text
Land for Purchase in Ahmedabad & Gandhinagar | UrbanEdge
Land for Rent in Ahmedabad & Gandhinagar | UrbanEdge
Land for Lease in Ahmedabad & Gandhinagar | UrbanEdge
```

The visible product language may continue to use `Buy`; title wording can use normal natural-language phrasing as long as the page intent remains consistent.

### Property detail

Default deterministic pattern:

```text
[Area] [Category] Land in [Public Location] for [Transaction] | UrbanEdge
```

Examples:

```text
2 Acre Agricultural Land in Sanand for Sale | UrbanEdge
Industrial Land in Gandhinagar for Lease | UrbanEdge
```

If the location is hidden, do not insert a private locality into the title.

Fallback:

```text
[Listing Title] | UrbanEdge Land Space
```

### Guide

```text
[Guide Title] | UrbanEdge Land Space
```

## 10.4 Meta description rules

Editorial target:

- normally about 140–165 characters when practical;
- natural language;
- accurately summarizes visible content;
- includes a useful differentiator, not keyword repetition;
- does not promise availability that may have changed.

Property description may include:

- land type;
- public-safe location;
- area;
- transaction;
- one useful fact;
- UrbanEdge inquiry/site-visit assistance.

Do not insert private survey identifiers, owner identity or hidden location clues.

## 10.5 Metadata freshness

When these fields change materially, metadata and cache must be revalidated:

- property title;
- public-safe location;
- category;
- primary transaction;
- availability;
- public price mode/value;
- SEO title/description override;
- slug/canonical path;
- guide title/status;
- SEO page status/content.

---

# 11. Canonical Rules

## 11.1 Self-canonical indexable pages

Every normal indexable page should emit an absolute canonical URL.

Examples:

```text
<link rel="canonical" href="https://urbanedgelandspace.com/agricultural-land">
<link rel="canonical" href="https://urbanedgelandspace.com/properties/example-slug">
```

## 11.2 Canonical signals must agree

The same preferred URL should be used in:

- `rel=canonical`;
- sitemap;
- internal links;
- Open Graph `og:url`;
- structured-data `url` / `@id` where applicable;
- redirect destination after a slug change.

## 11.3 Do not canonicalize unrelated content

Do not canonicalize:

- a sold property to the homepage;
- every Ahmedabad filter to `/locations/ahmedabad`;
- every no-result URL to `/properties`;
- every paginated page to page 1.

Canonical is for duplicate/near-equivalent representatives, not for hiding architecture mistakes.

## 11.4 `canonical_path` override safety

A property-level explicit `canonical_path` may only point to:

- the same site's approved canonical property URL; or
- an explicitly approved consolidation target after a controlled migration.

The admin must not be able to enter arbitrary cross-domain canonicals without a deliberate specialist override.

---

# 12. Property Detail SEO

## 12.1 Eligibility

A property detail page is indexable when:

```text
publication_status = PUBLISHED
AND public_slug IS NOT NULL
AND listing_title IS NOT NULL
AND deleted_at IS NULL
```

Availability can be:

```text
AVAILABLE
UNDER_NEGOTIATION
SOLD
RENTED
LEASED
OFF_MARKET
```

but the page behavior changes by lifecycle state as defined later.

## 12.2 Required initial HTML

An indexable property page must server-render:

- H1/title;
- Property ID;
- category;
- transaction;
- area;
- public-safe location;
- price or Price on Request;
- current availability/status;
- useful description/overview;
- key land characteristics that are approved for public display;
- visible verification summaries that are approved for public display;
- breadcrumb links;
- primary public image or image markup where available;
- inquiry/contact actions;
- canonical metadata;
- structured data.

## 12.3 Property uniqueness

A property page must not be published as indexable with only copied owner text.

Before indexable publication, require:

- a meaningful sanitized listing title;
- a useful public description;
- category/transaction/location/area facts;
- at least one property-specific differentiating field beyond category/location/area where available;
- no private owner/verification notes.

## 12.4 Property ID

`UE-LS-000001` is the stable public business identifier.

It may appear in:

- visible page content;
- structured-data `identifier`;
- inquiry context;
- WhatsApp context.

It is not a government land-record ID and must never be described as one.

## 12.5 Property image SEO

Use only public listing media.

Requirements:

- meaningful `alt` text;
- no private document imagery;
- no embedded exact-location metadata where privacy policy prohibits it;
- no third-party watermarked imagery unless approved and legally usable;
- cover image should be crawlable if used in structured data/OG;
- image URLs must remain stable enough for crawling/caching.

Alt text describes the visible image rather than repeating SEO keywords.

Example:

```text
Road-facing view of agricultural land near Sanand, Ahmedabad
```

not:

```text
best agricultural land Ahmedabad cheap agricultural land buy land Ahmedabad
```

---

# 13. Structured Data Architecture

## 13.1 General rule

Use JSON-LD.

Structured data must describe visible public content accurately.

Schema.org vocabulary may be used for semantic clarity even when Google does not provide a dedicated rich-result treatment for that specific type.

Do not promise that `RealEstateListing` markup will generate a Google real-estate rich result.

## 13.2 Site-wide structured data

### Homepage

Use:

- `Organization`;
- `WebSite`;
- optionally `RealEstateAgent` / applicable `LocalBusiness` subtype only after public business identity, office location and contact information are verified and intentionally public.

Do not invent business ratings or reviews.

### Organization fields

Potential approved fields:

```text
@type
@id
name
url
logo
telephone        # only if public business phone
email            # only if public business email
sameAs           # only verified official social profiles
address          # only verified public business address
areaServed       # Ahmedabad/Gandhinagar/Gujarat as accurately configured
```

## 13.3 Breadcrumb structured data

Use `BreadcrumbList` on:

- category pages;
- transaction pages;
- location pages;
- property detail;
- guide pages;
- guide category pages.

Structured breadcrumb labels and destinations must match the visible breadcrumb concept.

## 13.4 Property detail schema

Primary page type:

```text
RealEstateListing
```

Recommended safe properties where data exists:

```text
@context
@type: RealEstateListing
@id: canonical URL + #listing
url
name
description
identifier       # UE-LS-xxxxxx
datePosted
dateModified
image
inLanguage
offers
about             # public-safe Place/property description where useful
breadcrumb
```

### `about` / public place representation

A public-safe `Place` may include:

```text
name
address
geo
additionalProperty
```

subject to the exact location rules in Section 14.

### Area

Area can be represented through visible text plus `PropertyValue`/`QuantitativeValue` where semantically appropriate.

Never convert regional units into a standardized value in structured data unless the conversion is supported by the application's normalization/provenance rules.

## 13.5 Offer rules

Create `Offer` markup only for actual public commercial offers.

Potential fields:

```text
@type: Offer
url
price
priceCurrency: INR
availability
```

### Exact public price

If a trustworthy exact public price exists, numeric `price` may be emitted.

### Price on Request

If:

```text
price_mode = PRICE_ON_REQUEST
```

then:

- omit numeric `price`;
- never emit `0`;
- never emit a fake number;
- never use internal asking price.

### Price range / per-unit pricing

Only emit structured numeric pricing when the representation is unambiguous and matches visible public content.

If the schema mapping would be misleading, omit numeric price instead of forcing a value.

## 13.6 Availability mapping

Recommended semantic mapping:

| UrbanEdge status | Structured offer availability |
|---|---|
| `AVAILABLE` | `https://schema.org/InStock` |
| `UNDER_NEGOTIATION` | `https://schema.org/LimitedAvailability` where appropriate, otherwise omit |
| `SOLD` | `https://schema.org/OutOfStock` |
| `RENTED` | `https://schema.org/OutOfStock` |
| `LEASED` | `https://schema.org/OutOfStock` |
| `OFF_MARKET` | `https://schema.org/OutOfStock` or omit offer if no longer offered |

The visible page status is authoritative. Structured data must never imply availability after the page says Sold/Rented/Leased.

## 13.7 Collection/category/location schema

For indexable discovery pages use:

- `CollectionPage`;
- `BreadcrumbList`;
- optional `ItemList` containing only the properties actually displayed on that paginated page.

Do not generate an `ItemList` containing hidden or unpublished inventory.

## 13.8 Guide schema

Published guides may use:

- `Article` or `BlogPosting`;
- `BreadcrumbList`.

Potential fields:

```text
headline
description
image
datePublished
dateModified
author
publisher
mainEntityOfPage
inLanguage
```

Use a public author identity only if the author is intended to be publicly attributed.

## 13.9 Structured-data validation

Before production launch and after schema template changes:

- validate JSON syntax;
- validate with Schema.org Validator;
- validate Google-supported features with Rich Results Test where applicable;
- inspect representative URLs in Search Console after launch;
- test exact/approximate/hidden location listings separately.

---

# 14. Location Privacy in SEO and Structured Data

This section is mandatory.

## 14.1 General principle

Search engines, social crawlers and structured-data consumers are public recipients.

Therefore machine-readable metadata is **public disclosure**.

A field is not private merely because it is invisible on screen.

## 14.2 `EXACT`

When:

```text
location_visibility = EXACT
```

and the admin has intentionally approved public exact disclosure:

Allowed where supported:

- exact public latitude/longitude;
- full public address;
- exact map pin;
- exact locality;
- accurate `Place.geo`;
- accurate address fields in JSON-LD;
- exact location wording in metadata if appropriate.

Even for `EXACT`, never expose internal owner identity, private notes or private documents unless separate business policy explicitly makes them public.

## 14.3 `APPROXIMATE`

When:

```text
location_visibility = APPROXIMATE
```

private exact coordinates are prohibited from every public output.

Allowed:

- district;
- taluka/village/locality when approved as public;
- broad address wording;
- broad landmark context when it does not defeat the privacy decision;
- **public-safe** approximate coordinates stored separately in `public_latitude/public_longitude`;
- public accuracy/radius context if the product chooses to explain it.

JSON-LD rule:

- use `GeoCoordinates` only when the coordinates come from the explicit public-safe coordinate fields;
- never transform or round the private coordinate on the client or in the JSON-LD renderer;
- if no approved public-safe coordinates exist, omit `geo` entirely and use broad `Place`/address locality data only.

Open Graph rule:

- OG title/description must use the same broad location wording as the visible page;
- do not include exact location in social preview text.

## 14.4 `HIDDEN`

When:

```text
location_visibility = HIDDEN
```

structured data and metadata must not disclose enough fields to reconstruct the parcel location.

Prohibited unless the admin explicitly changes visibility:

- `geo`;
- street address;
- exact village/locality if hidden by policy;
- precise landmark;
- survey/block number;
- TP/FP/OP number if it would identify the parcel;
- parcel coordinates in image metadata;
- exact location in OG description;
- exact location in image alt text;
- exact location in canonical slug if that slug would reveal the intentionally hidden location.

Allowed fallback:

```text
Ahmedabad District, Gujarat
Gandhinagar District, Gujarat
```

or another explicitly approved broad market label.

## 14.5 No SEO override may bypass privacy

An admin-entered:

- SEO title;
- SEO description;
- landing-page body;
- structured-data override;
- image alt text;

must not be allowed to reintroduce private location data that the property projection excludes.

The SEO layer must consume the same public-safe geography projection as the page UI.

---

# 15. Ahmedabad and Gandhinagar SEO Architecture

## 15.1 District pages

Canonical V1 pages:

```text
/locations/ahmedabad
/locations/gandhinagar
```

Each page should contain genuinely local content, not a renamed template.

Recommended sections:

1. H1 + concise market introduction;
2. category discovery;
3. active relevant inventory;
4. district-specific land-search considerations;
5. useful connectivity/planning/industrial context where supported;
6. related guides;
7. requirement CTA;
8. Sell Your Land / contact path where contextually useful.

## 15.2 District + category pages

Six planned V1 combinations:

```text
/locations/ahmedabad/agricultural-land
/locations/ahmedabad/na-land
/locations/ahmedabad/industrial-land
/locations/gandhinagar/agricultural-land
/locations/gandhinagar/na-land
/locations/gandhinagar/industrial-land
```

These are not automatically indexable merely because the route exists.

Use the Section 6.5 quality gate.

## 15.3 Local market claims

Do not publish unsupported claims such as:

- fastest-growing location;
- guaranteed appreciation;
- safest investment;
- government-approved zone;
- best ROI;
- future highway/metro certainty;
- development rights based solely on locality.

Where planning/authority information is discussed, date it and source it appropriately.

---

# 16. Future Gujarat Expansion

## 16.1 Expansion trigger

Do not activate SEO geography merely because the database contains Gujarat geography reference data.

A district becomes SEO-eligible only when:

1. UrbanEdge is operationally willing to serve that market;
2. the location is marked active for public business use;
3. there is curated inventory or substantial local editorial value;
4. the required local terminology/units can be presented accurately;
5. public location/privacy rules are configured;
6. the page passes the quality gate;
7. an admin approves the page;
8. the page is intentionally added to internal navigation and sitemap.

## 16.2 No statewide doorway-page rollout

Do not pre-generate:

- every Gujarat district;
- every taluka;
- every village;
- every category × district combination;

and leave most of them thin.

Generate routes from approved SEO entities, not from the entire geography table.

## 16.3 Internal linking after expansion

When a new district qualifies:

- link it from the relevant location directory/section;
- link category ↔ district pages when useful;
- add relevant guides;
- avoid an enormous sitewide footer containing every future location.

---

# 17. Guide and Content Strategy

## 17.1 Editorial purpose

Guides should support:

- buyer education;
- seller education;
- local authority/trust;
- repeated sales explanations;
- category understanding;
- location understanding;
- organic search demand.

Do not build a high-volume AI content machine.

## 17.2 V1 content clusters

### Land Buying

Examples:

- What to check before buying agricultural land in Gujarat;
- Agricultural vs NA vs industrial land;
- What 7/12 / RoR information is useful for;
- Why exact land-use status matters;
- Questions to ask before a land site visit.

### Ahmedabad / Gandhinagar

Examples:

- Land-buying considerations around Ahmedabad growth corridors;
- Gandhinagar land search guide;
- Understanding TP/FP references at a high level;
- Industrial land search checklist.

### Transaction

Examples:

- Land sale document checklist;
- What to ask before renting/leasing land;
- Price-per-unit terminology explained.

## 17.3 Content quality rules

Every guide must have:

- a clear search/user question;
- original editorial value;
- reviewed publication status;
- title;
- slug;
- excerpt/meta description;
- useful headings;
- relevant internal links;
- publication date;
- meaningful `updated_at`/review context when updated;
- a contextually appropriate CTA.

## 17.4 Legal content

Any guide that makes definitive legal claims must be professionally reviewed before publication.

Do not automatically publish:

- unsourced latest-law claims;
- definitive buyer eligibility conclusions for every user;
- legal-clear/title-clear claims;
- fabricated government process details;
- automatic legal advice.

## 17.5 Content refresh

Content mentioning:

- laws;
- government portals;
- Jantri/rates;
- planning rules;
- authority processes;
- GIDC policy;
- registration processes;

must carry an editorial review date and should be periodically rechecked.

Do not update `dateModified` merely to manufacture freshness.

---

# 18. Sold, Rented, Leased and Off-Market Property SEO

Publication status and availability are separate.

## 18.1 `SOLD`, `RENTED`, `LEASED` while still `PUBLISHED`

The property URL may remain HTTP 200 and indexable when the page still has useful public value.

Required behavior:

- show the closed status prominently above the fold;
- remove normal `AVAILABLE` language;
- remove or replace misleading direct conversion wording;
- change primary CTA to `Find Similar Land`, `Tell UrbanEdge Your Requirement`, or equivalent;
- remove the property from active-search inventory counts;
- exclude it from active inventory modules unless explicitly presented as historical/unavailable;
- update structured-data availability;
- retain the same canonical URL;
- keep property facts only if they are still safe and accurate.

## 18.2 When a closed property may stay indexable

It may remain `index,follow` if:

- it was previously a genuine published listing;
- it retains unique useful property information/media;
- the page clearly states its closed status;
- it links to useful current alternatives or requirement capture;
- it does not create a misleading impression that the land is still available.

## 18.3 `OFF_MARKET`

If temporarily off-market but business policy may restore it:

- page may remain published with clear `Off Market` status if useful;
- remove active-offer structured data where appropriate;
- use alternative CTA;
- reassess if the page becomes stale or no longer useful.

## 18.4 `UNPUBLISHED` / `ARCHIVED`

An unpublished or archived property must not continue to behave as an active indexable listing.

Choose exactly one outcome:

### Outcome A — exact successor exists

Permanent redirect:

```text
old property URL → exact replacement/successor property URL
```

Use only when the replacement represents substantially the same real-world opportunity.

### Outcome B — no successor, page intentionally retired

Return:

```text
HTTP 410 Gone
```

or `404` if implementation/business semantics do not distinguish the state.

Remove it from:

- sitemap;
- active internal links;
- structured-data item lists;
- search results.

### Outcome C — historical closed page remains useful

Do not archive/unpublish it. Keep `publication_status = PUBLISHED` and use the explicit closed availability state.

## 18.5 Do not redirect removed properties to broad pages

Do not send every removed property to:

- homepage;
- `/properties`;
- its category page;
- its district page.

An irrelevant redirect can behave like a soft 404 and confuses users.

---

# 19. Slug Changes and Redirect Architecture

## 19.1 Property slug stability

The canonical property route is:

```text
/properties/[property-slug]
```

Price and date must never be encoded into the required canonical slug because they change frequently.

Light title edits should not automatically regenerate the public slug.

## 19.2 Slug-edit rule

Treat the slug as stable after first publication.

Admin should see a warning before changing a published slug:

> Changing this slug creates a permanent redirect from the old public URL.

## 19.3 Redirect behavior

When a slug changes:

1. store the old canonical path;
2. publish the new canonical path;
3. create a permanent server-side redirect from old → new;
4. return HTTP `301` or `308` consistently;
5. update internal links;
6. update sitemap;
7. update canonical;
8. update Open Graph URL;
9. update JSON-LD `url`/`@id`;
10. avoid redirect chains.

Example:

```text
/properties/agricultural-land-sanand
    308 → /properties/2-acre-agricultural-land-sanand
```

If that slug changes again, rewrite the first redirect so both historical URLs point directly to the newest canonical URL.

## 19.4 Redirect retention

Keep permanent redirects for at least **12 months** and preferably indefinitely for previously public property/guide/SEO URLs.

## 19.5 Required persistence gap

The current database architecture does not define a dedicated slug-history/redirect table.

A production implementation therefore needs one of these two controlled solutions:

### Preferred: additive `seo_redirects` table

```text
id
source_path          UNIQUE
source_hash          optional
destination_path
status_code          301 or 308
entity_type          PROPERTY | GUIDE | SEO_PAGE | ROUTE
entity_id            nullable
is_active
created_at
created_by
updated_at
```

This is an additive specialist requirement and should be introduced through a migration plus ADR/update to the database architecture before dynamic slug editing is enabled.

### Temporary V1 alternative

If public slug editing is disabled after publication, static application redirects may handle the small number of manually approved migrations.

Do not allow dynamic admin slug changes without a persistent redirect-history mechanism.

---

# 20. Breadcrumb Architecture

## 20.1 Visible breadcrumbs

Use crawlable `<a href>` links.

Breadcrumbs represent a logical user path and do not need to mirror physical URL nesting exactly.

## 20.2 Patterns

### Category

```text
Home > Agricultural Land
```

### Transaction

```text
Home > Buy Land
```

### District

```text
Home > Locations > Ahmedabad
```

If `/locations` has no public index page, `Locations` may be rendered as a non-linked breadcrumb label or a future curated directory route may be introduced through the route architecture.

### District + category

```text
Home > Ahmedabad > Agricultural Land
```

### Property

Recommended semantic path:

```text
Home > Agricultural Land > Ahmedabad > [Property title]
```

or:

```text
Home > Ahmedabad > Agricultural Land > [Property title]
```

Choose one consistent convention.

### Guide

```text
Home > Guides > [Guide Category] > [Guide Title]
```

## 20.3 JSON-LD parity

`BreadcrumbList` should use the same conceptual hierarchy and canonical URLs.

Do not include unpublished/noindex landing pages as required breadcrumb parents unless they are intentionally public navigation nodes.

---

# 21. Open Graph and Social Metadata

## 21.1 Required fields

For public indexable pages:

```text
og:title
og:description
og:url
og:site_name
og:type
og:image
```

Also support:

```text
twitter:card = summary_large_image
```

where the platform metadata implementation supports it.

Use `og:type` consistently:

- `website` for homepage, category, transaction, location, property-detail and normal business pages;
- `article` for guide detail pages.

Do not invent a non-standard property-specific Open Graph type.

## 21.2 Property OG image

Use:

1. approved public cover image;
2. fallback branded category/location image;
3. global UrbanEdge branded fallback.

Never use:

- private document scans;
- owner-uploaded private evidence;
- image URLs requiring private signed authorization;
- images that expose hidden location information contrary to policy.

## 21.3 `og:url`

Always use the canonical absolute URL without tracking parameters.

## 21.4 Social privacy

Social crawlers are external public systems.

Therefore all location privacy rules apply to:

- OG title;
- OG description;
- OG image;
- Twitter metadata;
- dynamically rendered social preview images.

---

# 22. XML Sitemap Architecture

## 22.1 Sitemap principle

A sitemap contains URLs UrbanEdge actually wants search engines to discover and potentially index.

Do not use the sitemap as a dump of every public route.

## 22.2 Included URL classes

Include only canonical HTTP-200 `index,follow` pages:

- homepage;
- core category pages that pass quality gates;
- transaction pages that pass quality gates;
- published property pages eligible for indexing;
- approved Ahmedabad/Gandhinagar pages;
- approved future Gujarat location pages;
- published guides;
- approved guide-category pages;
- About/Contact/Sell Your Land when indexable.

## 22.3 Excluded URL classes

Never include:

- filtered search URLs;
- sort URLs;
- tracking URLs;
- `NOINDEX` pages;
- admin;
- APIs;
- thank-you pages;
- utility `/search`;
- draft/review content;
- unpublished properties;
- archived properties returning 404/410;
- redirect source URLs;
- duplicate canonical variants;
- invalid pagination;
- terms/privacy/disclaimer if configured `noindex`.

## 22.4 Sitemap structure

V1 may use one generated sitemap if comfortably below limits.

Preferred scalable architecture:

```text
/sitemap.xml                     # sitemap index or primary entry
/sitemaps/static.xml
/sitemaps/properties-1.xml
/sitemaps/locations.xml
/sitemaps/guides.xml
```

The implementation may use Next.js generated sitemap facilities.

Split files when scale or operational reporting makes it useful; XML sitemap protocol limits remain 50,000 URLs / 50 MB uncompressed per sitemap.

## 22.5 `lastmod`

Use `lastmod` only when content changed meaningfully.

Good triggers:

- property public content updated;
- availability changed;
- public price changed;
- significant media changed;
- guide edited;
- location editorial content edited.

Do not update sitemap `lastmod` merely because:

- the page was requested;
- a cache revalidated;
- analytics changed;
- internal CRM activity changed;
- private notes changed with no public effect.

## 22.6 Image sitemap support

Property sitemap entries may include public listing images when useful.

Do not submit private or authorization-gated images.

## 22.7 Public PDFs and brochure indexing

A public brochure/PDF is not automatically an SEO page.

Default policy:

- public property brochures should use `X-Robots-Tag: noindex, follow` unless UrbanEdge deliberately approves a PDF as a standalone indexable resource;
- private owner/legal/evidence documents must never be publicly crawlable and must remain authorization-protected;
- a public brochure must obey the same `EXACT` / `APPROXIMATE` / `HIDDEN` location policy as the HTML property page;
- do not publish a brochure that reveals exact survey identifiers, coordinates or parcel location when the listing is approximate/hidden;
- PDFs excluded from indexing do not belong in XML sitemaps.

If an approved guide/resource PDF is intentionally indexable, it must have a stable public URL, useful title/document metadata, no private data, and contextual HTML links from relevant pages.

---

# 23. `robots.txt`

## 23.1 Goals

`robots.txt` controls crawl efficiency, not confidentiality.

Private content must be protected by authentication/RLS/storage policies, not robots rules.

## 23.2 Baseline production policy

Conceptual baseline:

```text
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /search

# High-cardinality search/facet parameters that are never SEO landing pages
Disallow: /*?*q=
Disallow: /*?*sort=
Disallow: /*?*minPrice=
Disallow: /*?*maxPrice=
Disallow: /*?*minArea=
Disallow: /*?*maxArea=

Sitemap: https://urbanedgelandspace.com/sitemap.xml
```

The final list of blocked filter parameters should follow the production search parameter contract.

## 23.3 Do not block URLs that need to receive `noindex`

If a URL is already indexed and UrbanEdge needs search engines to see `noindex`, do not block that URL in `robots.txt` until it has been deindexed.

## 23.4 Search facet strategy

For filter dimensions never intended for organic indexing, UrbanEdge may additionally block crawl patterns such as:

```text
/*?*availability=
/*?*roadWidth=
/*?*verification=
```

Do not block `?page=` globally because valid paginated canonical collections need crawlable URLs.

## 23.5 Staging environments

Staging/preview environments must not be publicly indexable.

Preferred controls:

- authentication/access restriction;
- environment-level `noindex` as defense;
- never rely on robots alone for confidential preview content.

---

# 24. SSR, Rendering and Crawlability Requirements

## 24.1 Server Components default

Public SEO pages use Server Components by default.

Client Components only own interactive parts that require browser APIs or client state.

## 24.2 Initial HTML contract

The crawler-visible initial HTML must contain the page's primary value.

For a property page that means:

- property title;
- broad/public-safe location;
- area;
- category;
- transaction;
- status;
- useful description;
- crawlable related links.

For an SEO landing page:

- H1;
- editorial intro/body;
- crawlable property links;
- breadcrumbs;
- contextual internal links.

## 24.3 Crawlable links

Important internal navigation must use normal link semantics:

```html
<a href="/target">...</a>
```

Do not make essential discovery depend exclusively on:

- `onClick` without `href`;
- canvas interactions;
- map pin JavaScript;
- buttons that fetch hidden next pages without crawlable URLs.

## 24.4 Caching/revalidation

Public property, guide and SEO-page caches should revalidate when public data changes.

Private CRM updates should not invalidate public pages unless they change a public projection.

## 24.5 Error status correctness

Use real HTTP semantics:

- valid page → 200;
- permanent redirect → 301/308;
- missing route → 404;
- intentionally retired resource → 410 where selected;
- server failure → 5xx.

Do not serve a generic `200 OK` page saying “Property not found.”

---

# 25. Internal Linking Architecture

## 25.1 Core relationship graph

```text
Home
  → Categories
  → Transactions
  → Ahmedabad / Gandhinagar
  → Featured properties
  → Guides

Category
  → qualifying locations
  → properties
  → related guides

Location
  → qualifying categories
  → properties
  → related guides

Property
  → category
  → public district/location
  → related properties
  → relevant guide

Guide
  → category/location context
  → relevant discovery page
  → related guides
```

## 25.2 No orphan SEO pages

An indexable landing page must have at least one meaningful internal path from another indexable page.

Sitemap discovery alone is not enough for a strategically important page.

## 25.3 Footer restraint

Do not add hundreds of keyword location links to the footer.

Footer may link to:

- core categories;
- Ahmedabad;
- Gandhinagar;
- key company/legal routes;
- Guides;
- Contact.

Future location navigation should use a curated location directory or context-driven links, not footer spam.

---

# 26. Property Search Cards and Indexable Collections

## 26.1 Crawlable property links

Every server-rendered listing card should contain a standard anchor to the canonical property URL.

## 26.2 Card text

Visible card content can include:

- public image;
- category;
- transaction;
- Property ID;
- title;
- public-safe location;
- area;
- price/POR;
- status;
- selected verification signals.

Do not expose private data through `data-*` attributes or serialized props just because it is not visually displayed.

## 26.3 Closed inventory in collections

Normal active discovery collections should not mix closed inventory into active listings.

If UrbanEdge later creates a historical/closed-property collection, that route requires separate UX/SEO approval and must not look like active inventory.

---

# 27. No-Result Behavior

## 27.1 User-facing filtered search

A valid user filter that currently has zero results may show the established useful empty state:

```text
No matching land is currently listed.
→ Broaden filters
→ Tell UrbanEdge Your Requirement
```

Such filtered URLs remain `noindex`.

## 27.2 Indexable curated page with temporary zero inventory

A curated district/category page may remain HTTP 200 only when it passes the strong editorial-supported gate.

It must explicitly state that no matching public listings are currently available rather than showing fake inventory.

## 27.3 Invalid states

Impossible/invalid pagination or malformed route values should return 404 rather than a 200 empty page.

---

# 28. Status and Robots Directives

## 28.1 `PUBLISHED`

For `seo_pages`:

```text
PUBLISHED
```

means eligible for `index,follow` only if the automated quality checks pass.

Publication is necessary but not sufficient for indexing.

## 28.2 `NOINDEX`

Use:

```text
<meta name="robots" content="noindex,follow">
```

The page can remain useful to users and internal navigation but is excluded from sitemap.

## 28.3 `ARCHIVED`

Archived SEO content should normally:

- be removed from sitemap;
- be removed from active navigation;
- redirect only if a genuine successor exists;
- otherwise return 404/410 when the route is retired.

Do not leave an archived route as a thin `200 OK` shell.

---

# 29. Open Search / Site Search

## 29.1 `/search`

`/search` is a utility route and must be:

```text
noindex,follow
```

## 29.2 Site-search result URLs

Do not expose internal search result pages as indexable landing pages.

If a repeated user search reveals real demand, the content team may consider creating a curated guide or SEO landing page after applying the full quality gate.

---

# 30. SEO Admin Architecture

The existing admin SEO pages should expose enough data to enforce this architecture.

## 30.1 SEO landing-page screen

Show:

- page title;
- canonical path;
- page type;
- linked district/locality/category/transaction;
- status;
- index/noindex effective state;
- SEO title;
- description;
- H1/title;
- intro/body content;
- active matching inventory count;
- editorial word count;
- internal-link count;
- duplicate-content warning;
- last public content update;
- publication date;
- sitemap eligibility;
- quality-gate result;
- reasons blocking indexability.

## 30.2 Effective index state

Do not let a single checkbox blindly mean `index`.

Effective state should be derived from:

```text
admin status
+ route eligibility
+ content quality gate
+ canonical validity
+ HTTP/publication state
```

## 30.3 Publishing gate errors

Examples:

```text
Cannot index: only 1 active matching property and editorial content is below 1,000 words.
Cannot index: canonical duplicates /locations/ahmedabad.
Cannot index: missing unique meta description.
Cannot index: page body is too similar to another location page.
Cannot index: linked geography is not active for public use.
```

---

# 31. Technical SEO Validation Checklist

## 31.1 Every deployment

Automated checks should verify:

- canonical host behavior;
- no accidental staging indexability;
- valid robots route;
- valid sitemap XML;
- no sitemap URL returns redirect/404/5xx;
- no sitemap URL emits `noindex`;
- admin routes are protected;
- core pages have metadata;
- no duplicate canonical route generation;
- public property queries exclude private fields.

## 31.2 Property SEO tests

Test fixtures for each:

- Agricultural / NA / Industrial;
- Buy / Rent / Lease;
- exact price;
- Price on Request;
- `EXACT` location;
- `APPROXIMATE` location;
- `HIDDEN` location;
- `AVAILABLE`;
- `UNDER_NEGOTIATION`;
- `SOLD`;
- `RENTED`;
- `LEASED`;
- `OFF_MARKET`;
- slug changed;
- archived/removed.

## 31.3 Privacy leakage tests

For `APPROXIMATE` and `HIDDEN`, search rendered output for private coordinates and sensitive parcel identifiers in:

- HTML source;
- RSC payloads;
- JSON-LD;
- page props;
- network APIs;
- Open Graph;
- dynamic OG-image requests/config;
- analytics events;
- image metadata where processed.

The test fails if private coordinates appear anywhere in an anonymous response.

## 31.4 Search URL tests

Test:

- parameter order normalization;
- duplicate parameters;
- empty parameters;
- default parameters;
- page 1 normalization;
- out-of-range pagination;
- filter noindex;
- tracking canonical stripping;
- curated-filter canonical mapping.

---

# 32. Search Console and Monitoring

After production launch:

1. Verify the canonical domain in Google Search Console.
2. Submit `/sitemap.xml`.
3. Inspect representative:
   - homepage;
   - each core category;
   - Ahmedabad;
   - Gandhinagar;
   - one location+category page;
   - one property per location-visibility mode;
   - one guide.
4. Monitor:
   - indexed vs submitted URLs;
   - duplicate/canonical reports;
   - soft 404s;
   - crawl anomalies from filter URLs;
   - sitemap errors;
   - structured-data errors;
   - unexpected indexing of search/thank-you routes.
5. Review server logs if crawl activity begins concentrating on filter combinations.

Do not respond to indexing problems by publishing more thin pages.

---


# 32A. Future Language / `hreflang` Architecture

V1 is English-first and does not need `hreflang` merely because Gujarati/Hindi may be supported later.

If fully translated public pages are introduced later:

- each language gets a distinct stable URL;
- translated pages must be real localized content, not machine-swapped headings around identical English bodies;
- each language version uses a self-canonical URL, not canonical to the English version;
- reciprocal `hreflang` annotations should connect equivalent language versions;
- include `x-default` only when there is a genuine language-neutral/default destination;
- language variants must independently pass privacy, content-quality and indexability gates;
- do not create Gujarati/Hindi location pages solely to multiply URL count.

---

# 33. External SEO Standards Baseline

This architecture was checked against current public guidance available on 30 August 2026, including:

- Google Search Central — Canonicalization:  
  `https://developers.google.com/search/docs/crawling-indexing/canonicalization`
- Google Crawling Infrastructure — Managing crawling of faceted navigation URLs:  
  `https://developers.google.com/crawling/docs/faceted-navigation`
- Google Search Central — Pagination and incremental page loading:  
  `https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading`
- Google Search Central — Block indexing with `noindex`:  
  `https://developers.google.com/search/docs/crawling-indexing/block-indexing`
- Google Search Central — Build and submit a sitemap:  
  `https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap`
- Google Search Central — Site moves / redirects:  
  `https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes`
- Google Search Central — Breadcrumb structured data:  
  `https://developers.google.com/search/docs/appearance/structured-data/breadcrumb`
- Google Search Central — General structured data guidelines:  
  `https://developers.google.com/search/docs/appearance/structured-data/sd-policies`
- Schema.org — `RealEstateListing`:  
  `https://schema.org/RealEstateListing`
- Next.js — App Router metadata / metadata files documentation.

Search-engine behavior and framework APIs can change. Recheck these references before major SEO migrations or when upgrading the framework substantially.

---

# 34. Final SEO Route Contract

## 34.1 Always-intended core indexable surfaces

Subject to quality/content readiness:

```text
/
/properties
/agricultural-land
/na-land
/industrial-land
/buy
/rent
/lease
/guides
/about
/contact
/sell-your-land
```

## 34.2 V1 governed location surfaces

```text
/locations/ahmedabad
/locations/gandhinagar
/locations/ahmedabad/agricultural-land
/locations/ahmedabad/na-land
/locations/ahmedabad/industrial-land
/locations/gandhinagar/agricultural-land
/locations/gandhinagar/na-land
/locations/gandhinagar/industrial-land
```

Each must pass the applicable quality gate.

## 34.3 Property surfaces

```text
/properties/[property-slug]
```

Index only genuine published listings.

Preserve useful closed listings with truthful status; remove/redirect retired listings according to Section 18.

## 34.4 Editorial surfaces

```text
/guides/[guide-slug]
/guides/category/[category-slug]
```

Index only reviewed, useful content.

## 34.5 Never use arbitrary search combinations as the SEO page system

```text
/properties?...filters...
```

remain discovery-state URLs, not programmatic SEO pages.

---

# 35. Final Non-Negotiable Rules

1. **Do not create keyword-spam programmatic SEO.**
2. **A geography row does not automatically create a public SEO page.**
3. **A filter combination does not automatically create a public SEO page.**
4. **Only curated, quality-gated location/category pages may be indexed.**
5. **Core category/location pages must contain genuine user value beyond listing cards.**
6. **SSR/server rendering is required for primary public SEO content.**
7. **Every indexable page has one stable canonical URL.**
8. **Paginated collection pages use their own canonical URLs.**
9. **Arbitrary filters and sort states remain non-indexable.**
10. **Sitemaps contain only canonical URLs UrbanEdge actually wants indexed.**
11. **`robots.txt` is crawl control, not a privacy/security system.**
12. **Private exact coordinates never enter public HTML, JSON, JSON-LD, Open Graph or client state.**
13. **Approximate structured data may use only deliberately public-safe approximate coordinates.**
14. **Hidden-location listings must remain hidden in machine-readable metadata too.**
15. **Price on Request never becomes a fake numeric structured-data price.**
16. **Availability in structured data must match visible availability.**
17. **Sold/rented/leased properties must never continue to look available.**
18. **Removed properties redirect only to a true successor; otherwise use 404/410.**
19. **Published slug changes require permanent redirect history.**
20. **Do not redirect old property URLs to the homepage merely to avoid a 404.**
21. **Guide/legal content requires editorial review appropriate to its risk.**
22. **Do not auto-update dates merely to simulate freshness.**
23. **Do not place every future Gujarat location in global navigation/footer.**
24. **Do not add a page to sitemap until it passes the indexing gate.**
25. **SEO must optimize for qualified brokerage opportunities, not vanity page count.**

---

# 36. Implementation Handoff Summary

A coding agent implementing this architecture should build the SEO layer around these modules:

```text
lib/seo/
  canonical.ts
  metadata.ts
  robots.ts
  structured-data.ts
  breadcrumbs.ts
  indexability.ts
  sitemap.ts
  redirects.ts
  privacy-safe-seo.ts

features/search/
  url-normalization.ts
  index-policy.ts

features/properties/
  property-seo.ts
  property-structured-data.ts
  property-lifecycle-seo.ts

features/geography/
  location-seo.ts
  location-quality-gate.ts

features/guides/
  guide-seo.ts

server/queries/
  public-seo-properties.ts
  sitemap-urls.ts
  seo-page-quality.ts
```

The implementation must consume **public-safe projections** rather than querying private property data and attempting to hide it afterward.

The final authority chain is:

```text
Product/business scope
→ Master architecture
→ Page/route architecture
→ Database public/private model
→ This SEO architecture
→ implementation + tests
```

Where implementation requires the new persistent redirect-history mechanism described in Section 19.5, update the database architecture through a controlled migration/ADR rather than silently storing redirect history in ad hoc JSON or application memory.

---

# 37. Definition of Done

SEO architecture is considered implemented only when all of the following are true:

- [ ] canonical host redirects work;
- [ ] server-rendered metadata exists for indexable pages;
- [ ] all indexable pages emit valid self/approved canonicals;
- [ ] query/filter URLs follow noindex/crawl rules;
- [ ] valid pagination is crawlable and self-canonical;
- [ ] page 1 normalization works;
- [ ] out-of-range pagination returns 404;
- [ ] property-detail JSON-LD uses only public-safe data;
- [ ] exact/approximate/hidden location tests pass;
- [ ] closed-property structured data matches status;
- [ ] `PRICE_ON_REQUEST` emits no fake price;
- [ ] slug changes create permanent one-hop redirects;
- [ ] sitemap contains only canonical indexable 200 URLs;
- [ ] `robots.txt` references the sitemap and controls high-cardinality crawling;
- [ ] no admin/private route is indexable;
- [ ] Ahmedabad/Gandhinagar landing pages pass quality gates before indexing;
- [ ] no geography/category page is automatically generated into the index;
- [ ] guide content workflow includes editorial/legal review where required;
- [ ] Open Graph uses only public-safe media/location data;
- [ ] breadcrumbs are visible, crawlable and represented in JSON-LD;
- [ ] Search Console is configured after launch;
- [ ] technical SEO tests run in CI or release QA;
- [ ] privacy leakage tests cover HTML, RSC, APIs, JSON-LD and social metadata.

**End of `07-SEO-ARCHITECTURE.md`.**
