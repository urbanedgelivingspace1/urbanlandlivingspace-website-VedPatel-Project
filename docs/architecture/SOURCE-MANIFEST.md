# Architecture Source Manifest

This directory contains implementation-facing architecture records. The authoritative source documents remain at the repository root.

## Current input status

| Source | Exact accessible location | Status | Handling |
|---|---|---|---|
| Master build prompt | `/Users/vedpatel/Desktop/merged (1).md`, embedded final document at lines 56904–62392 under `## 19. richtext_converted_to_markdown.md` | PRESENT AND READ IN FULL; not extracted under the expected filename | Highest-priority source; the merged package lists it as `00-MASTER-CODEX-BUILD-PROMPT.md` |
| Architecture documents `01`–`14` | `/Users/vedpatel/Desktop/UrbanLand_website/` | PRESENT | Authoritative roles follow the owner-defined hierarchy |
| Product requirements | `/Users/vedpatel/Desktop/UrbanLand_website/LANDSPACE_PRODUCT_REQUIREMENTS.md` | PRESENT | Business/V1 authority below master prompt |
| Legal verification report | `/Users/vedpatel/Desktop/UrbanLand_website/LEGAL_VERIFICATION_REPORT.md` | PRESENT | Legal/verification constraint authority; not legal advice |
| Land data model report | `/Users/vedpatel/Desktop/UrbanLand_website/LAND_DATA_MODEL_REPORT.md` | PRESENT | Supporting research |
| Living Space design report | `/Users/vedpatel/Desktop/UrbanLand_website/URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` | PRESENT, REVIEWED AND OWNER-DESIGNATED AUTHORITATIVE BRAND/DESIGN REFERENCE | Governs Living Space brand/design reference within its source-priority position; implementation architecture remains governed by the higher-ranked sources |
| Merged specification package | `/Users/vedpatel/Desktop/merged (1).md` | PRESENT | Contains the 18 root source documents plus the embedded master prompt |
| UrbanEdge Living Space repository | Not provided by owner | NOT PROVIDED / NOT REQUIRED | Owner confirmed on 2026-09-03 that it will not be provided and must not block M0; do not seek, modify or couple to it |
| Approved UrbanEdge logo asset | `/Users/vedpatel/Desktop/UrbanLand_website/UrbanEdge_Living_Space_Logo_HD.jpg` | PRESENT AND VISUALLY INSPECTED | Approved 4267×4267 RGB JPEG brand-reference asset; retain provenance and do not misrepresent it as a purpose-built Land Space logo |
| Additional photography/property media | No accessible location found | NOT LOCATED / OPTIONAL FOR DEVELOPMENT | Use only clearly marked development placeholders later and track every replacement |

Search scope used before the owner resolved the repository limitation on 2026-09-03:

- `/Users/vedpatel/Desktop/UrbanLand_website`;
- `/Users/vedpatel/.codex/attachments` and its attachment index;
- `/Users/vedpatel/Desktop`, `/Users/vedpatel/Documents`, `/Users/vedpatel/Downloads`;
- other accessible user directories while pruning unrelated dependency/build/system trees;
- `/Volumes`, permitted temporary workspace directories and mounted workspace roots.

The design report identifies historical reference asset names such as `public/uelslogo.jpg`, `public/logo192.png`, `public/logo512.png`, `public/og-image.svg` and `src/assets/UrbanEdge_Living_Space_Logo_HD.jpg`. The approved root-level JPEG is now present and inspected; the other historical files remain report evidence only. The report—not the unavailable old repository—is the authoritative Living Space brand/design reference by explicit owner direction.

## Accepted implementation decisions

- `docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md`: accepted owner decision. It preserves the database's eight-value site-visit enum and represents follow-up through CRM rather than `site_visit_status`.
- Owner source-resolution dated 2026-09-03: the old Living Space repository will not be provided; `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` is the authoritative Living Space brand/design reference and the repository's absence is not an M0 blocker.

## Integrity snapshot

The implementation ledger references all supplied sources and records missing inputs. Review snapshot captured on 2026-09-03:

| Source | Size | SHA-256 |
|---|---:|---|
| `/Users/vedpatel/Desktop/merged (1).md` | 1,550,039 bytes | `c8047b3d4d8127ee5ab097bef70d73b364ca0b9caf720b3e93766ce64bb3affc` |
| `/Users/vedpatel/Desktop/UrbanLand_website/URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` | 80,559 bytes | `dbd10c45bb3394ca396f21d5b75682d87a32d118e023f22a1abfd95371a36b8b` |
| `/Users/vedpatel/Desktop/UrbanLand_website/UrbanEdge_Living_Space_Logo_HD.jpg` | 3,516,693 bytes | `a889d3814187ba2da98e77f7609fed09b31bc662dd5b6b655e281c1d8a32d072` |
| `/Users/vedpatel/Desktop/UrbanLand_website/docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md` | — | `7c3df79e63aa9455435ed7325dcf89e745677b254f3c0b3c2a78f395f3aa571c` |

Run the following read-only command after source files change to refresh root-document review evidence:

```sh
wc -l ./*.md
shasum -a 256 ./*.md
```

Do not copy UrbanEdge Living Space source, database configuration, migrations, authentication, storage configuration or deployment configuration into this repository.
