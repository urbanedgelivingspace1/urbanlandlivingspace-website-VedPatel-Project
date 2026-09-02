# URBANEDGE LAND SPACE — MEDIA STORAGE ARCHITECTURE

**File:** `09-MEDIA-STORAGE-ARCHITECTURE.md`  
**System:** UrbanEdge Land Space V1  
**Status:** Production media/storage architecture and implementation handoff  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Expansion direction:** Gujarat → India  
**Primary storage:** Supabase Storage  
**Architecture date:** 31 August 2026

> **Purpose** — Define the authoritative V1 architecture for property media, external media URLs, private legal/owner documents, storage access, validation, ordering, cover selection, lifecycle, duplicate handling, and storage-cost safeguards.
>
> **Scope boundary** — This document is intentionally limited to media and file storage. It does not redefine the property, verification, CRM, legal, or database architecture. Where those systems already define a contract, this document follows it.

---

# 0. Architecture Authority

This document is subordinate to the supplied UrbanEdge architecture set:

1. `LAND_DATA_MODEL_REPORT.md`
2. `03-DATABASE-SCHEMA-ARCHITECTURE.md`
3. `08-SECURITY-PRIVACY-RLS.md`

The supplied data model already defines a separate media collection with `media_type`, source, storage path, external URL, sort order, cover state, alt text, caption, visibility, MIME type, file size, dimensions, upload time, approval time and checksum. It also explicitly distinguishes YouTube/external video, drone video, public brochure PDFs and 360-tour URLs from private legal evidence.  

The database architecture already defines `media_assets` and `private_documents` as separate entities, with public media limited to approved public storage and private documents restricted to private buckets. fileciteturn1file0L19-L67 fileciteturn1file4L531-L614

The security architecture requires deny-by-default access, server-owned upload handling, binary inspection, malware scanning for user-submitted private documents, EXIF stripping for public images, checksum recording, server-owned object names, private buckets for sensitive material, and short-lived signed URLs. fileciteturn1file3L392-L446

## 0.1 Non-negotiable V1 decisions

- Supabase Storage is the system of record for UrbanEdge-hosted media binaries in V1.
- Public property images that are approved for publication live in `property-media-public`.
- Pre-publication property media may be staged in `property-media-private`.
- Legal, ownership, verification, and owner-submission files never live in public buckets.
- Large video binaries are **not** hosted by UrbanEdge in V1. Use approved external video hosts and store the external URL/provider/video ID as metadata.
- Public brochures may be hosted when deliberately approved as marketing media; legal evidence PDFs remain private documents.
- 360 experiences are external URLs/provider integrations in V1, not 360 binary hosting infrastructure.
- Storage object paths are server-generated and are never authoritative input from the browser.
- A signed URL is a temporary capability, not a stored field and not a substitute for authorization.
- Normal business retirement is archive/unpublish; binary deletion is a separate, audited retention operation.
- Exact location metadata must never be embedded in public images, public EXIF, public object names, captions, filenames, or public media metadata.

---

# 1. Media Storage Goals

The V1 media architecture must support:

1. Property listing image galleries.
2. One deterministic cover image per active public property.
3. Drag/drop or equivalent admin reordering.
4. Responsive image delivery without retaining unnecessary source weight.
5. Accessible alt text and optional editorial captions.
6. Property videos hosted externally, especially YouTube.
7. Drone-video links without hosting large video files.
8. Public brochure PDFs when explicitly approved as marketing material.
9. External 360-tour URLs/provider metadata.
10. Private legal and owner document storage.
11. Admin-only preview/download using short-lived signed URLs.
12. Duplicate detection by cryptographic checksum and external canonical URL identity.
13. Archive and deletion behavior that protects auditability and prevents orphaned binaries.
14. Free-tier-aware storage controls so media cannot silently consume the project budget.

---

# 2. Media Classification Model

Every asset must be classified along **four orthogonal dimensions**:

## 2.1 Asset kind

```text
IMAGE
VIDEO
DRONE_VIDEO
PANORAMA_360
BROCHURE_PDF
MAP_IMAGE
DOCUMENT_PREVIEW
OTHER
```

The existing database enum includes `IMAGE`, `VIDEO`, `PANORAMA_360`, `BROCHURE`, `DOCUMENT_PREVIEW`, `MAP_IMAGE`, and `OTHER`; this document introduces `DRONE_VIDEO` and `BROCHURE_PDF` as product-level subtypes/labels where implementation requires them, while preserving compatibility with the existing `media_type` contract. The source model explicitly describes drone video as a video subtype and public brochures as media rather than legal documents. fileciteturn1file0L52-L67

## 2.2 Source kind

```text
SUPABASE_UPLOAD
EXTERNAL_URL
YOUTUBE
VIMEO
OTHER_VIDEO_PROVIDER
OTHER_360_PROVIDER
GENERATED_DERIVATIVE
```

`source_type` remains the database-level field. External sources never create a fake Storage object just for uniformity.

## 2.3 Visibility

```text
PUBLIC
ADMIN_ONLY
PRIVATE
DRAFT
```

Only `PUBLIC` assets are included in public property projections.

## 2.4 Lifecycle

```text
UPLOADING
VALIDATING
READY
APPROVED
ARCHIVED
DELETE_PENDING
DELETED
FAILED
```

The relational `visibility` and `archived_at` contract remains authoritative for the database. The lifecycle above is an implementation/state-machine concept and may be represented by additional status fields only where needed.

---

# 3. Supabase Bucket Architecture

The authoritative V1 bucket set remains:

```text
property-media-public
property-media-private
verification-documents-private
owner-submissions-private
guide-media-public
```

This exactly follows the existing database/security architecture. fileciteturn1file1L174-L190 fileciteturn1file7L875-L903

## 3.1 Bucket matrix

| Bucket | Purpose | Visibility | Anonymous read | Anonymous upload | Non-admin auth | Admin | Service role |
|---|---|---|---:|---:|---:|---|---|
| `property-media-public` | Approved public property images and intentionally public brochure/preview assets | Public | Yes | No | No | Authorized CRUD | Full server CRUD |
| `property-media-private` | Staging, rejected/draft property media, restricted previews | Private | No | No | No | Authorized CRUD | Full server CRUD |
| `verification-documents-private` | Legal/verification evidence | Private | No | No | No | Authorized CRUD | Full server CRUD |
| `owner-submissions-private` | Owner-submission attachments | Private | No | No direct | No | Authorized CRUD | Full server CRUD |
| `guide-media-public` | Public guide/content media | Public | Yes | No | No | Authorized CRUD | Full server CRUD |

Public buckets must contain intentionally public assets only. Private buckets cannot rely on unguessable paths as the access model. fileciteturn1file8L1005-L1041

## 3.2 Bucket ownership rule

The server determines the bucket. The browser may send an **upload purpose** such as:

```text
PROPERTY_GALLERY_IMAGE
PROPERTY_PUBLIC_BROCHURE
OWNER_SUBMISSION_ATTACHMENT
VERIFICATION_EVIDENCE
```

The browser must never choose:

```text
bucket_id
storage_bucket
object_path
visibility
```

as authoritative values.

The server resolves the destination from the authenticated actor, target entity, validation result, and workflow state. This follows the established security rule that client-provided bucket/path values are not trusted. fileciteturn1file8L1153-L1192

---

# 4. Storage Object Path Conventions

## 4.1 General rule

Every object name must be:

- generated server-side;
- stable enough for relational lookup;
- independent of user filename;
- non-semantic with respect to sensitive facts;
- resistant to enumeration;
- normalized to a known safe extension;
- compatible with future migration to another storage provider.

The security architecture explicitly requires the pattern:

```text
purpose + server-authorized entity ID + random object identifier + normalized extension
```

and rejects arbitrary client-selected paths. fileciteturn1file3L414-L431

## 4.2 Canonical path format

### Public property media

```text
properties/{property_uuid}/media/{media_uuid}.{ext}
```

Example:

```text
properties/7c8b.../media/4f7a....webp
```

### Private/staging property media

```text
properties/{property_uuid}/private-media/{media_uuid}.{ext}
```

### Verification documents

```text
properties/{property_uuid}/verification/{document_uuid}.{ext}
```

### Owner submissions

```text
owner-submissions/{submission_uuid}/attachments/{attachment_uuid}.{ext}
```

### Public guide media

```text
guides/{guide_uuid}/media/{media_uuid}.{ext}
```

## 4.3 What must never appear in an object path

Never include:

- owner name;
- owner phone/email;
- survey number;
- exact coordinates;
- private document type if the bucket/path itself could reveal sensitive information unnecessarily;
- original user filename;
- auth UID unless required for a narrowly scoped private workflow;
- government document reference numbers;
- free-form titles or slugs containing user-controlled text.

The path is an internal storage key, not a human-readable business identifier.

---

# 5. Relational Media Contract

The existing `media_assets` table remains the authoritative registry for property media. Its current contract includes property relation, media type, bucket/path, MIME type, size, dimensions, duration, alt text, caption, visibility, cover flag, ordering, source type, checksum, timestamps, actors, and archive timestamp. fileciteturn1file4L533-L576

## 5.1 Recommended authoritative fields

| Field | Purpose | V1 rule |
|---|---|---|
| `id` | Internal media UUID | Immutable |
| `property_id` | Property relation | Null only for reusable/content-specific media if explicitly supported |
| `media_type` | IMAGE / VIDEO / PANORAMA_360 / BROCHURE / etc. | Controlled |
| `source_type` | Upload vs external provider | Required |
| `storage_bucket` | Supabase bucket | Required only for hosted binary |
| `object_path` | Storage object key | Required only for hosted binary; never public for private objects |
| `external_url` | Canonical external URL | Required for external asset types |
| `external_provider` | YouTube/Vimeo/360 provider etc. | Recommended for external assets |
| `external_media_id` | Provider ID | Recommended for stable providers |
| `mime_type` | Actual validated MIME type | Server-derived |
| `file_size_bytes` | Stored binary size | Server-derived |
| `width_px` | Width | Required for images; nullable otherwise |
| `height_px` | Height | Required for images; nullable otherwise |
| `duration_seconds` | Duration | Video only, nullable for external URLs where unavailable |
| `alt_text` | Accessibility description | Required before public image publication |
| `caption` | Editorial caption | Optional |
| `visibility` | Public/private/draft/admin | Server-controlled |
| `is_cover` | Cover selection | At most one active public image |
| `sort_order` | Gallery order | Integer sequence, server-normalized |
| `checksum_sha256` | Dedup/integrity | Required for hosted uploads |
| `uploaded_at` | Upload timestamp | Server-generated |
| `approved_at` | Public approval | Required for public publication workflow |
| `created_at` / `updated_at` | Record timestamps | Standard database contract |
| `archived_at` | Soft archive | Preferred retirement marker |

## 5.2 External URL fields

The existing schema contains `external_url`. For production-grade provider handling, prefer adding or standardizing:

```text
external_provider
external_media_id
external_url_canonical
thumbnail_url
embed_url
```

only if later implementation needs them. Do not create redundant fields merely to duplicate provider URLs.

For V1, `external_url` can remain sufficient when the provider's stable media ID can be derived from the canonical URL. The database model explicitly permits external URLs and recommends provider metadata for 360 tours. fileciteturn1file0L52-L67

---

# 6. Image Architecture

## 6.1 V1 image policy

Property images are the primary hosted media type.

Recommended accepted source formats:

```text
JPEG
PNG
WebP
```

The security architecture explicitly establishes this public-image allowlist. fileciteturn1file8L1164-L1173

SVG is not part of the public property-image pipeline by default.

## 6.2 Canonical source and derivatives

Do not keep multiple visually identical originals merely for responsive delivery.

Preferred model:

```text
validated original
      ↓
normalized public master
      ↓
responsive derivatives
      ├── thumbnail
      ├── card
      ├── gallery
      └── large/detail
```

The relational row should identify the source asset; responsive derivatives should be deterministic and replaceable.

A practical V1 image size strategy is:

| Derivative | Target long edge | Typical purpose |
|---|---:|---|
| `thumb` | 480 px | Admin list, small cards |
| `card` | 960 px | Property cards / search results |
| `gallery` | 1600 px | Gallery/lightbox |
| `large` | 2200 px | Detail-page zoom / high-density screens |

These are **UrbanEdge implementation targets**, not legal or provider limits. Actual output should be capped by device/use case and measured against storage cost.

## 6.3 Image dimensions

Store actual validated dimensions in:

```text
width_px
height_px
```

Minimum public publishing target:

```text
width_px >= 1200
height_px >= 800
```

unless the image is an intentionally narrow/vertical composition such as a site plan, map image, or brochure preview.

Recommended hard safety ceiling:

```text
max dimension: 8192 px
max pixel count: 40 megapixels
```

The security baseline already requires rejection of impossible dimensions, excessive pixel counts, and decompression-bomb patterns. fileciteturn1file8L1153-L1162

## 6.4 Compression

Public-image normalization should:

1. decode the original safely;
2. rotate according to valid orientation metadata;
3. strip unnecessary EXIF/GPS metadata;
4. resize to the largest useful output;
5. encode to WebP for normal web delivery;
6. preserve JPEG when source characteristics make it materially better;
7. avoid retaining multiple unnecessarily large source copies;
8. retain only the minimum source needed for reprocessing/audit policy.

The public pipeline must not leak the image's original EXIF geolocation. The security architecture specifically requires EXIF/geolocation stripping for public media. fileciteturn1file8L1153-L1162

## 6.5 EXIF rule

For public assets:

```text
GPS coordinates → strip
camera serial → strip
owner/device identifiers → strip where present
capture metadata → strip unless explicitly useful and safe
orientation → consume into pixels, then remove EXIF
```

For private legal/verification files, preserve original source material according to retention policy; do not silently rewrite evidentiary documents merely for public-media optimization.

---

# 7. Alt Text and Captions

## 7.1 Alt text

`alt_text` is a semantic accessibility field, not a filename.

Good:

```text
Front road access and entrance to the agricultural land parcel near the listed locality
```

Bad:

```text
IMG_9321.jpg
```

Rules:

- required for every public image;
- concise, truthful, descriptive;
- no keyword stuffing;
- no unsupported legal claims;
- do not expose exact location when the listing intentionally uses approximate location;
- avoid owner names unless intentionally public and approved.

The source model marks alt text as a public accessibility/SEO field. fileciteturn1file0L25-L43

## 7.2 Caption

Captions are optional editorial context:

```text
28-ft approach road visible from the parcel entrance
```

Captions may describe visible physical conditions but must not convert an image into a legal guarantee. A caption such as `clear title shown in this image` is prohibited.

---

# 8. Ordering Architecture

## 8.1 `sort_order` is the display contract

The public gallery order is determined by:

```text
sort_order ASC
created_at ASC
id ASC
```

The latter two are deterministic tie-breakers only.

## 8.2 Normalization

Use compact positive integer ordering:

```text
10
20
30
40
...
```

This leaves space for inserts during admin editing without renumbering every row.

When an admin performs a reorder, the server may normalize the full active sequence back to:

```text
10, 20, 30, 40, ...
```

## 8.3 Reordering transaction

A reorder operation must:

1. verify active-admin authorization;
2. verify the property owns every supplied media ID;
3. reject duplicate/foreign media IDs;
4. exclude archived media;
5. update all positions atomically;
6. preserve cover state unless explicitly changed;
7. create one audit event describing the reorder, not hundreds of noisy events.

The browser must submit an ordered ID list, not arbitrary `sort_order` values for unrelated records.

---

# 9. Cover Image Architecture

## 9.1 Cover invariant

A property has:

```text
0 or 1 active cover image
```

The source database contract explicitly requires at most one active cover image. fileciteturn1file4L564-L569

The recommended V1 publish gate is:

```text
Published property → exactly one approved cover image
```

A draft property may have no cover.

## 9.2 Cover precedence

Cover selection is explicit, not inferred from `sort_order` alone.

Preferred rules:

1. explicit `is_cover = true` wins;
2. cover must be an active, approved, public-capable image;
3. if cover is archived or unpublished, the server clears it;
4. if publication requires a cover and none exists, publication is blocked;
5. `sort_order = 10` does not automatically make an image the cover.

## 9.3 Cover change operation

The server performs the operation transactionally:

```text
clear current cover
→ set new cover
→ optionally move new cover to sort_order 10
→ audit change
```

Never rely on a UI sequence that temporarily creates two covers.

---

# 10. Video Architecture — V1

## 10.1 No large video binaries in V1

UrbanEdge does **not** host large property video binaries in Supabase Storage in V1.

This includes:

- long drone footage;
- walkthrough videos;
- cinematic property videos;
- 4K/8K marketing reels;
- large MP4 source masters.

The property media database can represent videos, but the binary should be externally hosted.

This is consistent with the supplied data model's recommendation to store external video ID/URL rather than copied video binaries when external hosting is used. fileciteturn1file0L52-L59

## 10.2 YouTube

Preferred V1 storage pattern:

```text
media_type = VIDEO
source_type = YOUTUBE
external_media_id = provider video ID
external_url = canonical watch URL
embed_url = controlled embed URL
```

Do not store a copied YouTube MP4 in Supabase.

Store only metadata required to render the player and, where available, a safe thumbnail reference. The public page should embed the external provider rather than proxying video bytes through UrbanEdge.

## 10.3 Provider allowlist

V1 should allowlist approved providers rather than accepting arbitrary video URLs.

Initial provider set may be:

```text
YouTube
Vimeo
```

Additional providers require a reviewed parser, URL policy, CSP/embedding policy, and test coverage.

## 10.4 External URL validation

Server validation must confirm:

- HTTPS;
- provider domain is allowlisted;
- URL parses as an expected media type;
- provider/media ID can be safely extracted when applicable;
- no `javascript:`/data/blob/custom-protocol URL;
- normalized canonical URL is stored;
- tracking parameters are removed where safe.

Never accept an arbitrary URL and render it directly into an iframe.

---

# 11. Drone Video Architecture

Drone video is a subtype of property video, not a separate storage technology.

Use:

```text
media_type = VIDEO
video_subtype = DRONE
source_type = YOUTUBE | VIMEO | OTHER_APPROVED_PROVIDER
```

The product may display labels such as:

```text
Drone Overview
Aerial View
Drone Walkthrough
```

The public media workflow remains:

```text
external URL submitted
→ provider validated
→ metadata normalized
→ admin review
→ approve
→ publish
```

Do not infer parcel boundaries, legal ownership, road rights, zoning, or developability from drone footage. Video is marketing evidence/visual context, not title evidence.

---

# 12. 360 Tour Architecture

## 12.1 V1 rule

Do not host a full 360/panorama binary platform in V1.

Store:

```text
media_type = PANORAMA_360
source_type = OTHER_360_PROVIDER
external_url = canonical tour URL
external_provider = provider identifier
external_media_id = optional provider ID
```

The data model explicitly recommends storing URL/provider metadata for 360 tours. fileciteturn1file0L64-L67

## 12.2 360 provider validation

Allowed 360 URLs must pass:

- HTTPS validation;
- provider allowlist;
- canonical URL normalization;
- iframe/embed compatibility check;
- safe host/CSP review;
- removal of arbitrary query parameters where safe.

## 12.3 360 privacy

A 360 experience must not expose exact parcel coordinates merely because the viewer is hosted externally. External URLs should be reviewed for:

- embedded maps;
- GPS coordinates;
- owner names/contact details;
- private access roads;
- metadata or query strings containing sensitive coordinates.

---

# 13. Public Brochure PDF Architecture

## 13.1 Brochure vs legal document boundary

A PDF is public media only when it is an intentional **marketing brochure**.

Examples of public brochure content:

```text
Property overview
Area summary
Amenities/features
Photographs
Public locality information
Brokerage contact CTA
```

Examples that remain private:

```text
VF-7 / VF-8A records
Mutation records
Property cards used for verification
Registered deeds
NA permissions/orders used as evidence
GIDC allotment/lease/transfer evidence
Survey/legal verification evidence
Owner identity documents
```

The data model explicitly states that brochures may be media when public marketing material, while legal evidence PDFs belong in the private-document model. fileciteturn1file0L60-L67

## 13.2 Public brochure validation

Accepted public brochure format:

```text
PDF
```

Before publication:

1. validate PDF signature/content;
2. reject active or malformed content where the parser/security layer cannot safely process it;
3. malware-scan where upload origin requires it;
4. enforce a bounded file size;
5. verify page count;
6. generate a thumbnail/preview if used;
7. confirm no private owner/legal evidence is embedded;
8. require admin approval.

## 13.3 Recommended V1 brochure limits

UrbanEdge starting policy:

```text
max brochure size: 15 MB
max page count: 40
```

These are product safeguards, not provider quotas. Increase only with measured need.

---

# 14. Private Legal and Owner Documents

## 14.1 Absolute privacy boundary

Legal/owner documents never become public because:

- a listing is published;
- a document was reviewed;
- a verification check passed;
- an admin opened the file;
- `visibility` was changed in a client request;
- the object path is difficult to guess.

Private documents have their own relational and storage boundary. The security contract requires no anonymous/non-admin table access and server-mediated authorization. fileciteturn1file1L111-L170

## 14.2 Private document buckets

Use:

```text
verification-documents-private
owner-submissions-private
```

`property-media-private` may be used for restricted property media staging, but legal evidence belongs in the dedicated private-document bucket(s).

## 14.3 Private document object path

```text
properties/{property_uuid}/verification/{document_uuid}.{ext}
```

or, for owner submission files:

```text
owner-submissions/{submission_uuid}/attachments/{attachment_uuid}.{ext}
```

## 14.4 Private document metadata

The existing `private_documents` contract includes document type, bucket/path, MIME type, size, checksum, reference, date, issuer, visibility, internal notes, timestamps and archive state. fileciteturn1file4L580-L614

Recommended document metadata also includes:

```text
original_file_name
page_count
source_type
uploaded_by
uploaded_at
reviewed_by
reviewed_at
verification_status
supersedes_document_id
sha256
```

The original filename is metadata only; it is never the storage key.

---

# 15. Upload Pipeline

Every upload uses the same server-owned pipeline.

```text
Browser
  ↓
request intent + file
  ↓
origin/auth/resource validation
  ↓
file-count + request-size limits
  ↓
bucket/purpose resolution
  ↓
magic-byte validation
  ↓
MIME/type validation
  ↓
content parser
  ↓
malware scan where required
  ↓
EXIF/privacy normalization for public media
  ↓
image/PDF/video metadata extraction
  ↓
SHA-256 checksum
  ↓
duplicate check
  ↓
server-generated object path
  ↓
Storage upload
  ↓
atomic media/document registration
  ↓
admin approval or workflow transition
```

The security architecture mandates request validation, bucket-level type/size policy, binary inspection, content validation, malware scanning for user-submitted private documents, public EXIF stripping, image safety, server-owned filenames, SHA-256 checksums and atomic registration. fileciteturn1file8L1153-L1162

## 15.1 Browser responsibility

The browser may perform early UX checks for:

- obvious MIME mismatch;
- file size;
- image dimensions;
- file count.

These checks are only user-experience optimizations.

They are **not security controls**.

## 15.2 Server responsibility

The server is authoritative for all validation and must assume the client is malicious or incorrect.

Never trust:

```text
Content-Type
filename
file extension
width/height fields
size fields
visibility
is_cover
sort_order
bucket/path
source_type
external_url
```

when supplied by an untrusted client.

---

# 16. MIME, File Size, and Content Validation

## 16.1 Public-image allowlist

```text
image/jpeg
image/png
image/webp
```

## 16.2 Private evidence allowlist

```text
application/pdf
image/jpeg
image/png
```

The supplied security architecture explicitly recommends these V1 defaults. fileciteturn1file8L1164-L1173

## 16.3 Public brochure

```text
application/pdf
```

## 16.4 Hosted public video

Large video is not part of the V1 hosted-storage pipeline. Where a small operational MP4 is ever required, it must be explicitly enabled and bounded.

## 16.5 Disallowed by default

```text
HTML
JavaScript
Executables
Macro-enabled office files
Archive containers
Arbitrary binary formats
Active-content SVG
```

This aligns with the existing security baseline. fileciteturn1file8L1164-L1173

## 16.6 Recommended upload limits

UrbanEdge should configure product-level limits independent of whatever maximum the underlying provider permits:

| Asset | V1 recommended max |
|---|---:|
| Public property image | 10 MB source upload |
| Public brochure PDF | 15 MB |
| Private legal/verification PDF | 20 MB |
| Private legal/verification image | 10 MB |
| Owner-submission image | 10 MB |
| Hosted video binary | Not supported in V1 |
| 360 binary | Not supported in V1 |

These are conservative product safeguards intended to protect the free tier and abuse surface. They must remain configurable.

---

# 17. Image Quality and Optimization Policy

The media service should reject uploads that are technically valid but operationally poor when they would materially degrade the listing.

## 17.1 Recommended quality gates

Reject or flag images when:

- dimensions are too small for their intended role;
- pixel count exceeds the safety ceiling;
- decode fails;
- image is corrupted;
- color/profile handling produces an invalid output;
- aspect ratio is extreme without a legitimate use;
- file size is disproportionately high for its dimensions;
- image contains obvious active content where applicable.

## 17.2 Recompression strategy

A public image may be normalized from PNG/JPEG into WebP for web delivery while the relational asset remains the canonical media record.

The system should not repeatedly recompress the same derivative. Derivatives should be generated from the normalized master to avoid quality degradation.

## 17.3 Thumbnail generation

For each public property image, optionally generate:

```text
thumb
card
gallery
large
```

The derivative key can be derived deterministically from the source media UUID:

```text
properties/{property_uuid}/media/{media_uuid}/thumb.webp
properties/{property_uuid}/media/{media_uuid}/card.webp
properties/{property_uuid}/media/{media_uuid}/gallery.webp
properties/{property_uuid}/media/{media_uuid}/large.webp
```

The base `media_assets.object_path` should refer to the canonical/public master, with derivative paths handled by the media service rather than pretending that every derivative is a separate business media asset.

---

# 18. Duplicate Detection

Duplicate handling operates differently for hosted files and external URLs.

## 18.1 Hosted files

Compute:

```text
SHA-256(binary)
```

before relational registration.

The checksum is the first duplicate signal. The media schema already includes a checksum field specifically for duplicate/integrity support. fileciteturn1file0L33-L44

## 18.2 Exact duplicate policy

Within the same property and purpose:

```text
same checksum + same effective media type
→ do not create a second business asset
```

The upload service may return the existing asset ID to the admin UI.

## 18.3 Cross-property duplicate policy

Do **not** automatically reject the same binary across different properties.

Example:

```text
UrbanEdge logo
site-plan template
standard map legend
```

may legitimately repeat.

For property photographs, repeated checksums across different properties should produce an admin warning rather than an automatic global block.

## 18.4 Near-duplicate images

V1 does not require perceptual hashing.

Possible V2 enhancement:

```text
pHash / dHash
```

for near-duplicate detection, but only after storage and moderation telemetry justify its complexity.

## 18.5 External URL duplicates

Normalize external URLs before persistence:

```text
scheme
host
provider/media ID
canonical path
safe query subset
```

For YouTube, identity should be provider + canonical video ID rather than arbitrary tracking-query differences.

Example:

```text
youtube.com/watch?v=ABC&utm_source=x
```

and

```text
youtu.be/ABC
```

should resolve to the same canonical provider/media identity.

---

# 19. Public Media Approval and Promotion

Public media must follow a controlled promotion lifecycle.

```text
upload/stage privately
      ↓
validate
      ↓
scan
      ↓
normalize
      ↓
deduplicate
      ↓
admin review
      ↓
approve
      ↓
promote/copy to public bucket
      ↓
register/activate public asset
      ↓
update cover/order if required
      ↓
audit
```

The supplied security architecture explicitly requires private → validate → scan → review → promote → register → audit, and says a private document cannot become public by changing only a visibility field. fileciteturn1file8L1194-L1209

## 19.1 Public readiness gate

An image may be exposed publicly only when:

```text
property is publication-eligible
AND
media is validated
AND
media is approved
AND
media is non-archived
AND
media points to public storage or an approved external provider
AND
alt_text is valid
```

## 19.2 Rejected assets

Rejected media remains private/staged or is archived according to retention policy. It must never remain in the public bucket merely because a previous public URL exists.

---

# 20. Signed URL Architecture

Private files are accessed through short-lived signed URLs generated by the trusted server after resource authorization.

Canonical flow:

```text
Admin browser
   ↓
Server Action / Route Handler
   ↓
requireAdmin()
   ↓
resource authorization
   ↓
retention/archive check
   ↓
create signed URL
   ↓
return URL to admin UI
```

The existing security contract explicitly specifies this flow and says to persist only `bucket + object_path`, never the temporary signed URL. fileciteturn1file1L131-L170

## 20.1 Recommended V1 TTLs

| Use | TTL |
|---|---:|
| Admin inline private document preview | 60–300 seconds |
| Admin private document download | 60–300 seconds |
| Admin private image preview | 60–300 seconds |
| Temporary evidence batch | ≤ 5 minutes |
| Public asset | No signed URL |

These match the existing security recommendation. fileciteturn1file1L159-L170

## 20.2 Signed URL logging

Never put signed URLs in:

- audit payloads;
- analytics events;
- application logs;
- emails;
- database columns intended for durable storage;
- client-side persistence beyond the minimum active session need.

Log the resource ID and action instead:

```text
DOCUMENT_ACCESS
media_id/document_id
actor_id
timestamp
purpose
```

## 20.3 Archived/deleted assets

A signed URL for an archived/deleted private object must not be newly issued.

Previously issued URLs rely on the underlying storage/object lifecycle and expiry; the application must not treat a historical signed URL as durable authorization.

The security test suite explicitly requires rejection of archived/deleted-document signing and reuse after expiry. fileciteturn2file0L11-L19

---

# 21. Access Rules by Asset Type

| Asset | Public browser | Admin browser | Storage access model |
|---|---|---|---|
| Approved property image | Yes | Yes | Public bucket |
| Draft/rejected property image | No | Yes | Private bucket + signed URL |
| YouTube video | Yes, if approved | Yes | External provider |
| Drone video | Yes, if approved | Yes | External provider |
| 360 tour | Yes, if approved | Yes | External provider |
| Public brochure PDF | Yes, if approved | Yes | Public bucket |
| Legal verification PDF | No | Yes | Private bucket + signed URL |
| Owner attachment | No | Yes | Private bucket + signed URL |
| Internal document preview | No | Yes | Private bucket + signed URL |

---

# 22. Private Document Authorization

Private resource authorization is based on the relational ownership chain, not on the fact that an admin supplied a document ID.

Conceptually:

```text
private document
    ↓
property / party / owner submission
    ↓
active admin + operation permission
    ↓
retention/archive check
    ↓
storage access
```

This is the same authorization boundary defined in the security contract. fileciteturn2file11L1576-L1604

The object path alone is never the authorization mechanism.

---

# 23. Deletion, Archive, and Retention

## 23.1 Default rule: archive first

Normal business retirement uses:

```text
archived_at
```

rather than immediately deleting the row or binary.

The database architecture explicitly states that soft archive is the normal deletion strategy and that `archived_at` represents ordinary business retirement. fileciteturn1file4L907-L924

## 23.2 Unpublish vs archive

### Unpublish

Use when the asset is temporarily not public but may be reused:

```text
visibility → DRAFT/ADMIN_ONLY
archived_at → null
```

### Archive

Use when the asset is retired from active business use:

```text
archived_at → timestamp
```

### Hard deletion

Reserved for:

- approved retention expiry;
- duplicate cleanup where safe;
- rejected transient uploads;
- confirmed accidental uploads;
- policy-mandated deletion/anonymization.

Hard deletion must be audited and should follow a retention decision rather than a casual admin button.

## 23.3 Binary deletion workflow

Relational deletion and Storage deletion are separate operations.

```text
archive row
   ↓
mark delete eligible
   ↓
retention/ownership check
   ↓
remove public references
   ↓
delete binary
   ↓
record successful deletion
```

The database contract explicitly states that binary deletion is handled separately from relational deletion. fileciteturn1file4L564-L569

## 23.4 Orphan protection

A storage object must not become the only record of a business asset.

Every hosted object must have a corresponding relational row, except transient objects during a short upload-validation window.

A scheduled reconciliation job should detect:

```text
DB row exists → object missing
Object exists → DB row missing
```

and route them to admin/maintenance cleanup rather than silently repairing business state.

---

# 24. Upload Failure and Partial-Failure Handling

## 24.1 Upload fails before Storage write

No media/document row is created.

## 24.2 Storage write succeeds but DB registration fails

Mark the object as a transient/orphan candidate and retry registration or delete safely after a short grace period.

## 24.3 DB row succeeds but promotion fails

The row remains non-public and points only to a valid private/staging object until promotion is completed.

## 24.4 Public promotion fails halfway

The server must avoid exposing a partially promoted state through the public projection.

The property remains published only with its previous approved media until the new media promotion is fully committed.

---

# 25. Concurrent Admin Media Operations

Media editing is a concurrency-sensitive admin operation.

## 25.1 Reorder conflicts

Use one of:

```text
updated_at compare-and-set
```

or

```text
media collection revision/version
```

for future scale.

V1 minimum:

- reload current active media before a save;
- reject stale reorder submissions where the collection changed materially;
- return current server order to the UI.

## 25.2 Cover conflicts

Cover selection must be transactional and protected by a uniqueness constraint/index equivalent to:

```text
one active cover per property
```

The exact SQL representation belongs in the database migration document, but the invariant belongs here.

---

# 26. Public Media URL Contract

## 26.1 Public Storage URLs

For public assets, the public property projection may expose a stable CDN/storage URL or a server-generated image URL.

Do not expose private object paths.

## 26.2 Private URLs

Private storage paths never enter public DTOs, public HTML, JSON-LD, metadata, or analytics.

## 26.3 External media URLs

External provider URLs may be public only after:

```text
provider allowlist
+ URL normalization
+ admin approval
+ publication eligibility
```

## 26.4 Caching

Public media may be aggressively cached because public assets are intentionally immutable-ish.

Recommended pattern:

```text
immutable object ID/path
→ long-lived CDN caching
```

When replacing an image, create a new object ID rather than overwrite a public object in place. This avoids stale browser/CDN variants.

---

# 27. Image Replacement Policy

Never overwrite an approved public image in place when the content changes materially.

Preferred:

```text
old media UUID/path
        ↓
archive
        ↓
new media UUID/path
        ↓
approve
        ↓
activate
```

This makes cache invalidation deterministic and preserves historical audit context.

For an exact duplicate binary, reuse the existing media record where business semantics allow it rather than generating pointless copies.

---

# 28. Metadata Privacy Rules

Media metadata can leak more than intended. The following are private unless explicitly public:

```text
original filename
uploader identity
source IP
GPS coordinates
camera/device identifiers
private storage path
verification notes
owner names/contact data
internal document references
internal source URLs
signed URLs
```

Public media metadata may contain:

```text
alt_text
caption
public media type
approved external provider label
public thumbnail/embed metadata
safe dimensions
safe display order
```

The security architecture prohibits sensitive information from entering public projections and lists private documents, owner PII, source links, exact coordinates, internal notes and verification evidence as private. fileciteturn2file5L737-L798

---

# 29. Free-Tier Storage Safeguards

The V1 design intentionally avoids depending on large video hosting and treats storage as a bounded product resource.

## 29.1 Hard application limits

Enforce server-side:

```text
max images per active property
max upload size by asset type
max total hosted media bytes per property
max total hosted media bytes per owner submission
max brochure size
max private document size
max upload count per request
```

Recommended starting policy:

| Resource | Starting safeguard |
|---|---:|
| Property public images | 30 active images/property |
| Property staged images | 20 additional pending images/property |
| Owner-submission attachments | 10 files/submission |
| Public brochure | 1 active brochure/property by default |
| Hosted public media from V1 binaries | Images + brochures only |
| Video binary | 0 supported in V1 |
| 360 binary | 0 supported in V1 |

These are operational starting points and can be changed through a reviewed configuration migration.

## 29.2 Total storage budget

Do not encode provider free-tier limits directly into business logic because provider quotas can change.

Instead define an UrbanEdge storage budget configuration:

```text
MEDIA_STORAGE_WARNING_PERCENT
MEDIA_STORAGE_HARD_STOP_PERCENT
MEDIA_PROPERTY_IMAGE_BYTE_LIMIT
MEDIA_PRIVATE_DOC_BYTE_LIMIT
MEDIA_UPLOAD_DAILY_LIMIT
```

Recommended starting behavior:

```text
Warning: 70%
Soft alert: 80%
Hard upload stop: 90%
Emergency maintenance: 95%
```

The application should surface storage health to the admin dashboard.

## 29.3 Per-property budget

A practical default target:

```text
public hosted property media ≤ 150 MB/property
```

This should be treated as a **budget**, not a hard legal limit. The actual average should be much lower once WebP/responsive derivatives are used.

## 29.4 Do not store redundant derivatives forever

When a source/derivative strategy changes:

```text
new derivative set
→ validate
→ switch references
→ delete obsolete derivatives after grace period
```

Storage growth must be actively managed rather than accumulating every historical derivative indefinitely.

## 29.5 Admin alerts

Trigger an admin warning when:

- project storage budget exceeds threshold;
- a property exceeds image-count or byte budget;
- unusually large uploads are attempted repeatedly;
- duplicate upload rate spikes;
- orphan-object count increases;
- private-document growth exceeds expected baseline.

---

# 30. Abuse and Upload Security

Media upload endpoints are an abuse surface even when only admins can upload directly.

For owner-facing upload workflows, use:

```text
rate limit
→ anti-bot / Turnstile where applicable
→ request validation
→ file count/size limits
→ type validation
→ malware scan
→ checksum
→ storage upload
```

Public forms remain server-controlled; anonymous clients are not granted direct inserts into `private_documents` or equivalent sensitive tables. fileciteturn2file3L433-L504

## 30.1 Malware scanning

Mandatory for user-submitted private documents before they can become trusted workflow evidence.

The scan result should be represented as operational metadata/status, for example:

```text
SCAN_PENDING
SCAN_CLEAN
SCAN_INFECTED
SCAN_FAILED
```

Infected or failed files never enter trusted verification evidence.

## 30.2 Content sniffing

Do not trust:

```http
Content-Type: image/jpeg
```

when the bytes are actually something else.

Check magic bytes/signatures and parse actual content.

---

# 31. Public Media Security Rules

Public image delivery is intentionally public, but the upload and publication process remains protected.

A public media object must never contain:

- owner contact data;
- legal/verification evidence;
- exact-coordinate EXIF;
- internal source notes;
- internal storage metadata;
- signed URLs to private documents;
- active executable content.

The security architecture specifically tests oversized files, executable masquerading, HTML uploads, and private EXIF leaking into public media. fileciteturn2file0L11-L19

---

# 32. Database/RLS Integration Contract

The media architecture depends on the existing database/security separation.

## 32.1 `media_assets`

Expected posture:

```text
anon
  → only approved public projection

non-admin authenticated
  → deny

active admin
  → authorized CRUD

service_role
  → server-only privileged path
```

## 32.2 `private_documents`

```text
anon
  → deny

non-admin authenticated
  → deny

active admin
  → authorized read/write through protected workflow

service_role
  → server-only privileged path
```

The security architecture defines this exact private-document boundary. fileciteturn1file1L111-L129

## 32.3 Public projection

Public property DTO should expose only:

```text
media_id
media_type
public URL/embed URL where applicable
width/height where useful
alt_text
caption
sort_order
cover indicator
safe provider metadata
```

Never expose:

```text
storage_bucket for private objects
private object_path
checksum if not needed publicly
uploader ID
internal approval metadata
private document relations
review notes
source links
```

The security architecture requires explicit public projections rather than returning base rows and deleting fields in the client. fileciteturn1file0L234-L278

---

# 33. Audit Requirements

Audit these media/document operations:

```text
MEDIA_UPLOAD
MEDIA_APPROVE
MEDIA_REJECT
MEDIA_REORDER
MEDIA_COVER_SET
MEDIA_COVER_CLEAR
MEDIA_PUBLISH
MEDIA_UNPUBLISH
MEDIA_ARCHIVE
MEDIA_RESTORE
MEDIA_EXTERNAL_URL_ADD
MEDIA_EXTERNAL_URL_UPDATE
DOCUMENT_UPLOAD
DOCUMENT_VIEW
DOCUMENT_DOWNLOAD
DOCUMENT_ARCHIVE
DOCUMENT_DELETE
STORAGE_RECONCILIATION
```

Where the existing audit enum already covers a broader action, map to that existing enum or add a migration-reviewed subtype/event detail rather than silently expanding the enum ad hoc.

Do not store file contents or signed URLs in the audit record.

The existing security contract treats document access as a sensitive auditable event and excludes raw documents/secrets from audit payloads. fileciteturn1file1L147-L155

---

# 34. External Media URL Safety

External URLs are data, not trusted HTML.

## 34.1 Allowed schemes

```text
https://
```

Only.

## 34.2 URL parser behavior

Normalize:

- lowercase host;
- remove default ports;
- remove known tracking parameters;
- normalize provider-specific equivalent URLs;
- reject malformed/ambiguous URLs.

## 34.3 Embed safety

Use provider-specific embed components rather than:

```tsx
<iframe src={userProvidedUrl} />
```

The frontend should receive a validated provider enum and sanitized canonical media identifier.

## 34.4 CSP

The application CSP should permit frames/media only from explicitly approved provider origins used in V1.

This is a deployment/security configuration decision and should be updated whenever provider support changes.

---

# 35. Admin UX Contract

The admin property media editor should support:

```text
Upload Images
Drag to Reorder
Set Cover
Edit Alt Text
Edit Caption
Add YouTube/Vimeo Video
Add Drone Video
Add 360 URL
Upload Public Brochure
Archive Media
Replace Media
Preview Private Evidence
```

## 35.1 Media editor sections

Recommended grouping:

```text
Gallery
Videos
360 Tour
Brochure
Private Evidence
```

Do not mix private legal documents into the public Gallery editor.

## 35.2 Upload feedback

Each upload should show states such as:

```text
Uploading…
Validating…
Processing…
Duplicate
Needs Review
Approved
Failed
```

Errors should state the actionable reason without exposing server internals.

Examples:

```text
Image is too large. Maximum source size is 10 MB.
This file type is not supported.
The image could not be decoded safely.
This video provider is not supported.
A matching image already exists for this property.
```

---

# 36. Public Property Gallery Contract

The property detail page should consume media from a safe public projection with the following semantic ordering:

```text
cover
→ gallery images by sort_order
→ video blocks
→ 360 block
→ brochure CTA
```

The gallery must never request private storage URLs merely because a property has private evidence.

A property can therefore legitimately be:

```text
public listing
+ public photos
+ external YouTube video
+ private legal documents
+ private verification evidence
```

at the same time.

This matches the broader architecture's principle that storage, review, and public publication are separate states. fileciteturn2file6L867-L899

---

# 37. Placeholder and Empty-State Strategy

## 37.1 No media

Do not generate a fake storage object.

The public UI uses a deterministic application placeholder when a property has no approved image.

The placeholder is **not** a `media_assets` row unless the product explicitly needs a configurable placeholder system.

## 37.2 Missing cover

For a draft:

```text
No cover selected
```

For an attempted publish:

```text
Publication blocked: select one approved cover image.
```

## 37.3 Broken public image

If a public asset returns an invalid/dead response:

1. monitoring records failure;
2. public UI falls back to placeholder;
3. admin is alerted;
4. media is not automatically deleted;
5. repair/replacement is handled through the media lifecycle.

## 37.4 Missing external video

Render an unavailable/fallback state rather than exposing malformed provider links.

---

# 38. Media Metadata Versioning

Media metadata is mutable but the binary itself should be treated as immutable once approved.

## 38.1 Metadata changes

May update:

```text
alt_text
caption
sort_order
is_cover
visibility
external metadata
```

## 38.2 Binary changes

Treat as a new media asset.

Do not replace the binary behind the same public object path.

## 38.3 Document versioning

Private documents follow the existing version approach:

```text
new document row
→ supersedes_document_id = old document
→ old document archived/superseded
```

This preserves verification history. The database architecture explicitly calls for document append/version rather than destructive overwrite. fileciteturn1file12L1343-L1358

---

# 39. Storage Reconciliation Job

A trusted maintenance job should periodically inspect the relationship between:

```text
media_assets/private_documents
            ↕
Supabase Storage objects
```

## 39.1 Detect

- orphaned objects;
- missing objects referenced by active rows;
- duplicate checksums;
- objects in the wrong bucket;
- public objects with no approved public relation;
- archived rows whose retention period has elapsed;
- derivative files no longer referenced.

## 39.2 Correct

Automatic correction should be conservative.

Safe automated actions:

```text
remove known transient upload orphan after grace period
flag missing active object
flag unauthorized public object
queue duplicate cleanup
queue stale derivative cleanup
```

Do not automatically change business publication state based only on a storage scan without an explicit business rule.

---

# 40. Operational Metrics

Track:

```text
media_upload_count
media_upload_bytes
media_rejected_count
media_duplicate_count
media_processing_failures
media_public_active_bytes
media_private_bytes
orphan_object_count
missing_object_count
public_media_error_rate
external_media_validation_failures
signed_document_url_issuance_count
```

Metrics must not contain:

```text
private document contents
signed URLs
owner PII
exact coordinates
raw source documents
```

The security architecture explicitly keeps sensitive metadata out of public analytics and logs. fileciteturn2file5L737-L798

---

# 41. Security Test Matrix — Media and Storage

The following tests are mandatory before production sign-off.

| ID | Scenario | Expected |
|---|---|---|
| MED-001 | Anonymous reads approved public image | Allow |
| MED-002 | Anonymous reads private property media | Deny |
| MED-003 | Anonymous reads verification document | Deny |
| MED-004 | Non-admin authenticated reads private document | Deny |
| MED-005 | Active admin reads authorized private document | Allow via signed URL workflow |
| MED-006 | Admin requests document for unrelated property | Deny |
| MED-007 | Signed URL request for archived document | Deny |
| MED-008 | Reuse expired signed URL | Deny |
| MED-009 | Guess private storage path | Deny |
| MED-010 | Upload HTML renamed `.jpg` | Deny |
| MED-011 | Upload executable renamed `.png` | Deny |
| MED-012 | Oversized image | Deny |
| MED-013 | Impossible/excessive image dimensions | Deny |
| MED-014 | Public image containing GPS EXIF | Strip/reject |
| MED-015 | Duplicate checksum on same property | Deduplicate |
| MED-016 | Two simultaneous cover selections | Exactly one active cover |
| MED-017 | Reorder including another property's media ID | Deny |
| MED-018 | Publish without approved cover | Block publication |
| MED-019 | Private document moved to public bucket by client flag | Ignore/deny |
| MED-020 | Client supplies `bucket` path | Ignore/derive server-side |
| MED-021 | Arbitrary external iframe URL | Deny |
| MED-022 | Unsupported video provider | Deny |
| MED-023 | YouTube tracking URL variants | Canonicalize to same media identity |
| MED-024 | Public DTO exposes private `object_path` | Must never occur |
| MED-025 | Public DTO exposes private document relation | Must never occur |
| MED-026 | Public image object contains owner/private metadata | Must never occur |
| MED-027 | Storage object exists with no DB registration | Flag/reconcile |
| MED-028 | DB row references missing object | Flag/reconcile |
| MED-029 | Large video upload attempted | Reject V1 hosted-video path |
| MED-030 | Private signed URL persists in audit payload | Must never occur |

The existing security test suite already requires checks for direct private-storage access, path guessing, signed-URL abuse, arbitrary HTML, executable masquerading, oversized uploads, and private EXIF leakage. fileciteturn2file0L11-L19

---

# 42. Implementation Boundary

Recommended server-only structure:

```text
server/
├── storage/
│   ├── upload-policy.ts
│   ├── object-path.ts
│   ├── checksum.ts
│   ├── image-processing.ts
│   ├── document-validation.ts
│   ├── external-media.ts
│   ├── signed-urls.ts
│   ├── object-authorization.ts
│   ├── promotion.ts
│   ├── reconciliation.ts
│   └── storage-health.ts
├── authorization/
│   └── resource-access.ts
└── audit/
    └── append-audit.ts

features/property/media/
├── actions/
│   ├── upload-media.ts
│   ├── reorder-media.ts
│   ├── set-cover.ts
│   ├── approve-media.ts
│   ├── archive-media.ts
│   └── add-external-media.ts
├── dto/
│   ├── public-media.ts
│   └── admin-media.ts
└── components/
    └── media-editor.tsx
```

These boundaries extend the existing security architecture's `server/storage`, authorization, audit, validation and DTO separation. fileciteturn2file4L678-L733

---

# 43. Migration / Schema Implications

The media architecture assumes the current V1 database migration sequence already creates `media_assets` and `private_documents` after core property/party foundations and then configures storage buckets and policies. fileciteturn1file12L1490-L1499

Any additional fields introduced by this document should be added only through explicit SQL migrations and kept backward-compatible with the current contract.

Likely optional additions:

```text
external_provider
external_media_id
external_url_canonical
embed_url
thumbnail_url
processing_status
scan_status
original_file_name
page_count
media_subtype
```

Do not introduce these fields merely to duplicate data that can be deterministically derived.

---

# 44. V1 Media Decision Table

| Requirement | V1 decision |
|---|---|
| Property images | Supabase Storage |
| Public property image bucket | `property-media-public` |
| Draft/restricted property media | `property-media-private` |
| Public image formats | JPEG / PNG / WebP |
| Public image EXIF | Strip unnecessary metadata, especially GPS |
| Image checksum | SHA-256 |
| Image ordering | `sort_order` |
| Cover | `is_cover`, max one active |
| Alt text | Required for public images |
| Caption | Optional |
| YouTube | External URL + provider/media ID |
| Drone video | External video subtype |
| Large video binaries | **Do not host in V1** |
| 360 tours | External URL/provider metadata |
| Public brochure | Public PDF media when approved |
| Legal PDFs | Private documents only |
| Owner files | `owner-submissions-private` |
| Verification evidence | `verification-documents-private` |
| Private access | Server auth + signed URL |
| Signed URL persistence | Never |
| Storage path | Server-generated |
| Duplicate detection | SHA-256 for hosted binaries; canonical provider identity for external media |
| Normal retirement | Archive/unpublish |
| Hard delete | Retention-controlled + audited |
| Free-tier safeguard | App-level count/byte limits + project budget thresholds |
| Exact location in media metadata | Never public |

---

# 45. Final Architecture Summary

The authoritative V1 design is:

```text
                         URBANEDGE MEDIA SYSTEM

                ┌───────────────────────────────┐
                │      Property / Guide DB      │
                │       media_assets rows       │
                └──────────────┬────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   Hosted Images        External Media       Private Documents
          │                    │                    │
          │                    │                    ├─ verification-documents-private
          │                    │                    └─ owner-submissions-private
          │                    │
          ├─ property-media-private
          │  staging/restricted
          │
          └─ property-media-public
             approved public assets

   External media:
      YouTube / approved video provider / approved 360 provider

   No large video binaries in V1.

   Upload:
      validate → sniff → scan → normalize → checksum → dedupe → register → approve

   Private access:
      authorize → retention check → short-lived signed URL

   Public access:
      explicit projection → approved public object / validated external provider

   Lifecycle:
      draft → approved → published → unpublished/archive → retention → delete
```

The central architectural principle is **separation of media purpose, binary storage, public visibility, external hosting, and private evidence**. Property photos can be public without making legal documents public; a reviewed verification document can remain private while producing only a public verification summary; and external video/360 content can enrich a listing without introducing large-media storage costs into V1.

This preserves the supplied UrbanEdge requirements for public/private separation, source-backed verification, explicit media entities, private documents, RLS, server-owned storage operations, soft archive behavior, and controlled signed access. fileciteturn1file0L19-L67 fileciteturn2file5L737-L798

---

# 46. Production Sign-Off Checklist

## Storage

- [ ] All five V1 buckets exist with the intended visibility.
- [ ] Public buckets contain only intentionally public assets.
- [ ] Private buckets are not publicly readable.
- [ ] No application code trusts a client-selected bucket or object path.

## Uploads

- [ ] File count and byte limits are enforced server-side.
- [ ] MIME is verified from file content.
- [ ] Magic bytes/content parsing are active.
- [ ] Malware scanning is active for private user-submitted documents.
- [ ] Image dimensions/pixel ceilings are enforced.
- [ ] Public EXIF/GPS metadata is stripped.
- [ ] SHA-256 is computed and persisted.
- [ ] Server-owned object names are used.

## Public media

- [ ] `media_assets` drives public gallery state.
- [ ] Only approved media enters public projections.
- [ ] Cover uniqueness is enforced.
- [ ] Ordering is atomic and server-validated.
- [ ] Alt text is required before publication.
- [ ] Public object paths do not reveal sensitive identifiers.

## External media

- [ ] Provider allowlist is enforced.
- [ ] YouTube/provider URLs are canonicalized.
- [ ] Arbitrary iframe URLs are blocked.
- [ ] Large video binaries are rejected in V1.
- [ ] 360 content remains external.

## Private documents

- [ ] Legal/owner documents use private buckets only.
- [ ] No private object paths are public.
- [ ] Signed URLs are short-lived.
- [ ] Signed URLs are never persisted.
- [ ] Archived/deleted documents cannot receive new signed URLs.
- [ ] Sensitive document access is audited.

## Lifecycle/cost

- [ ] Archive is the default business retirement strategy.
- [ ] Binary deletion is separate from relational deletion.
- [ ] Orphan reconciliation is scheduled.
- [ ] Storage budget thresholds are monitored.
- [ ] Per-property media limits are enforced.
- [ ] Large video is external-only.
- [ ] Old derivatives are cleaned up after replacement.

## Security

- [ ] Anonymous/private Storage tests pass.
- [ ] Path-guessing tests fail as expected.
- [ ] Signed-URL abuse tests pass.
- [ ] Public DTO contains no private media/document fields.
- [ ] Service-role credentials are server-only.
- [ ] Exact-location information cannot leak through media metadata, filenames, URLs, captions or EXIF.

---

# 47. Explicit V1 Non-Goals

The following are intentionally deferred:

```text
large video binary hosting
self-hosted video transcoding pipeline
live streaming
advanced DAM/versioning platform
perceptual-hash near-duplicate service
full 360 viewer infrastructure
AI image tagging
AI-generated alt text as the authoritative field
multi-region storage replication architecture
provider-neutral media CDN abstraction
```

These may be introduced later without changing the fundamental separation between:

```text
public media
external media
private evidence
relational metadata
```

---

# 48. Source Alignment Notes

The media architecture directly preserves the supplied source decisions that:

- media is a separate collection rather than `image_1`, `image_2`, etc.;
- YouTube/video should use external IDs/URLs rather than copied binaries when external hosting is used;
- drone video is a video subtype;
- public brochures are media, while legal evidence PDFs remain private documents;
- 360 tours use URL/provider metadata;
- private documents require metadata and controlled access;
- `media_assets` carries order, cover, dimensions, MIME, checksum, and public/private state;
- public media must reference approved public storage;
- private buckets and explicit public projections form the storage/privacy boundary;
- soft archive and versioning preserve business history. fileciteturn1file0L19-L75 fileciteturn1file4L531-L614

The security source further requires binary validation, malware scanning, EXIF stripping, checksum persistence, server-owned paths, explicit private authorization, short-lived signed URLs, and storage regression testing. fileciteturn1file8L1153-L1209 fileciteturn1file1L131-L170

---

**End of `09-MEDIA-STORAGE-ARCHITECTURE.md`**
