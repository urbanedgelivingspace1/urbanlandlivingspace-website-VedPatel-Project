# ADR-0002: Model Hosted and External Media in One Registry

- **Status:** Accepted
- **Date:** 2026-09-03
- **Decision owner:** UrbanEdge project owner through the approved M7 implementation brief
- **Scope:** `media_assets`, public media projections, storage promotion, external video/drone/360 metadata and tests

## Context

The authoritative database document, `03-DATABASE-SCHEMA-ARCHITECTURE.md`, defines
`media_assets.storage_bucket`, `object_path` and `mime_type` as non-null. That shape works for
hosted images and brochures but cannot truthfully represent external YouTube/video, drone-video or
360 media without inventing a fake Storage object.

`09-MEDIA-STORAGE-ARCHITECTURE.md` requires external media to remain externally hosted and says
that external sources never create fake Storage objects. It also describes `external_url` as an
existing schema field, although that field is absent from document `03`'s column inventory and the
implemented M2 migration. The owner-approved M7 brief explicitly requires external video/YouTube,
drone-video and 360 URL support while prohibiting large V1 video binaries.

This is an implementation-blocking persistence contradiction. Silently placing URLs in
`object_path`, creating placeholder objects, or adding a second media registry would violate the
approved architecture.

## Decision

Keep `media_assets` as the single authoritative registry and add a mutually exclusive locator
contract:

- hosted assets use `storage_bucket`, `object_path`, `mime_type` and `checksum_sha256`;
- external assets use `external_url`, `external_provider` and `external_media_id`;
- a row cannot use both locator forms or neither locator form;
- `media_subtype` distinguishes product labels such as `DRONE_VIDEO` without changing the
  authoritative `media_type` enum;
- normalized external URLs, never arbitrary iframe HTML, are persisted;
- only allowlisted HTTPS providers are accepted by the server;
- external video and 360 binaries are not uploaded to Supabase Storage in V1.

The migration makes the three hosted locator columns nullable only so the external branch can be
represented, then restores strictness with a table check constraint. It also adds the minimum
workflow metadata needed by M7: `processing_status`, `approved_at`, `scan_status` for hosted public
PDFs, and provider identity fields. It does not create duplicate business fields or a duplicate
storage model.

Public projections may return either a public hosted object path or approved provider metadata.
They still require an approved, non-archived asset attached to a published property. Private
Storage paths and all `private_documents` fields remain excluded.

## Alternatives considered

### Store an external URL in `object_path`

Rejected. It confuses a Supabase object key with a network URL, defeats bucket/path validation and
encourages unsafe rendering.

### Create empty/fake Storage objects for external media

Rejected. It creates meaningless binaries, duplicate lifecycle state and false storage relations.

### Create separate video and 360 tables

Rejected. It duplicates `media_assets`, fragments ordering/cover/archive behavior and conflicts
with the established media collection.

### Host video binaries in V1

Rejected by the owner brief and document `09`; it increases cost and requires a transcoding/media
delivery system outside V1.

## Security, privacy and legal impact

- External URLs are parsed server-side, restricted to HTTPS allowlists and canonicalized.
- Browser-supplied bucket names, object paths, visibility and provider identity are never trusted.
- Public media approval remains distinct from property publication and cannot promote a private
  document.
- Public media projections exclude draft properties, private paths, checksums, uploader identity,
  internal notes, signed URLs and private-document relations.
- Drone/360 links remain visual marketing context and do not become evidence of ownership,
  boundaries, zoning or development rights.

## Schema and migration impact

`20260903070000_media_private_storage.sql`:

- adds the constrained hosted/external locator fields and M7 processing metadata;
- keeps the existing `media_type` and `record_visibility` enums authoritative;
- adds duplicate-prevention indexes for hosted checksums and canonical external identities;
- updates public media projections to require approval and a public-safe locator;
- creates the five approved Storage buckets and deny-by-default object-policy posture;
- adds service-role-only, actor-attributed media/document mutation functions.

No production bucket or migration action is authorized by this ADR. M7 applies and tests the
migration only against the isolated local Supabase project.

## Test impact

Tests must prove both locator branches, URL canonicalization, unsupported provider rejection,
no hosted-video upload path, same-property duplicate handling, private/public projection
separation, server-owned paths, public promotion, rollback/archive behavior and the full Storage
actor matrix.

## Rollback and compatibility impact

The extension is backward-compatible with existing hosted rows. Rollback first archives any new
external assets and removes dependent public references, then restores the previous public views.
The added nullable columns/types/functions/indexes can be removed only after confirming no active
row uses the external locator branch. Public object promotion is immutable: rollback archives the
new asset and reactivates the previous retained asset rather than overwriting an object in place.

## Approvals required

No additional owner approval is required for this architecture resolution because the M7 brief
explicitly requires external URL media and prohibits large hosted video. Production migration,
bucket creation, malware-provider activation and deployment remain separate approval-gated work.
