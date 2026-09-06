# ADR-0005: Persistent SEO redirects and controlled guide hero media

- Status: Accepted
- Date: 2026-09-06
- Milestone: M16

## Context

The approved SEO architecture requires every previously published property, guide, or curated SEO slug to redirect permanently and directly to its current canonical path. The M0 implementation ledger records that the original schema intentionally had no redirect-history model and requires an ADR before editable published slugs are enabled.

The guide architecture also reserves a public guide-media bucket but the original guide record has no bounded association for its approved hero image. M16 needs a public-safe hero image without allowing arbitrary HTML or private media into metadata.

## Decision

Add `seo_redirects` as the only persistent dynamic redirect registry. Sources and destinations are same-site absolute paths, query strings and fragments are prohibited, sources are unique, destinations cannot equal sources, and only `301` or `308` are accepted. Redirect lookup is public through a narrow active projection; mutations remain server-owned and require an active admin at the application boundary. On every update, historical sources for the same entity are flattened to the newest destination so redirect chains are not created.

Add bounded guide hero fields directly to `guides`: the bucket must be `guide-media-public`, the path must use a safe relative object key, alt text and positive dimensions are required as a complete set, and partial media state is rejected. This is intentionally a single approved hero association, not a second general media registry or an upload shortcut. M16 administration may select an already approved public guide image; an expanded guide upload workflow can reuse the existing media pipeline later.

Published guide and curated SEO routes are locked to same-site canonical paths. A previously published guide slug remains editable only through the M16 content service, which calls a service-only database operation that changes the slug and canonical path while recording and flattening redirect history in the same transaction. Curated location route keys remain fixed to the approved V1 route whitelist.

## Consequences

- Redirect history is durable, auditable, typed, bounded, and cannot point off-site.
- Historical URLs resolve in one permanent hop.
- Sitemap and canonical generation can exclude redirect sources deterministically.
- Guide social metadata can use only a deliberately public hero object with truthful alt text and dimensions.
- No geography row, filter state, or arbitrary admin path becomes an SEO route automatically.
- Existing ADR-0001 through ADR-0004 and all M0–M15 boundaries remain unchanged.
