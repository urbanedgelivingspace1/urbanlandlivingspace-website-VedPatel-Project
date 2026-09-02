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
| Living Space design report | `/Users/vedpatel/Desktop/UrbanLand_website/URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` | PRESENT AND REVIEWED | Code-derived design/brand reference; lower priority than finalized architecture |
| Merged specification package | `/Users/vedpatel/Desktop/merged (1).md` | PRESENT | Contains the 18 root source documents plus the embedded master prompt |
| UrbanEdge Living Space repository | No accessible location found | **NOT LOCATED** | Required read-only reference; never modify or couple if supplied |
| UrbanEdge logo/assets | No accessible location found | **NOT LOCATED** | Do not recreate/alter a logo while the actual asset is expected |
| Additional photography/property media | No accessible location found | NOT LOCATED / OPTIONAL FOR DEVELOPMENT | Use only clearly marked development placeholders later and track every replacement |

Search scope used for the unavailable items on 2026-09-03:

- `/Users/vedpatel/Desktop/UrbanLand_website`;
- `/Users/vedpatel/.codex/attachments` and its attachment index;
- `/Users/vedpatel/Desktop`, `/Users/vedpatel/Documents`, `/Users/vedpatel/Downloads`;
- other accessible user directories while pruning unrelated dependency/build/system trees;
- `/Volumes`, permitted temporary workspace directories and mounted workspace roots.

The design report identifies historical reference asset names such as `public/uelslogo.jpg`, `public/logo192.png`, `public/logo512.png`, `public/og-image.svg` and `src/assets/UrbanEdge_Living_Space_Logo_HD.jpg`, but those files themselves are not present in the accessible source set. Their names are evidence of the prior report's inspection, not proof that the current agent has the repository or asset bytes.

## Accepted implementation decisions

- `docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md`: accepted owner decision. It preserves the database's eight-value site-visit enum and represents follow-up through CRM rather than `site_visit_status`.

## Integrity snapshot

The implementation ledger references all supplied sources and records missing inputs. Review snapshot captured on 2026-09-03:

| Source | Size | SHA-256 |
|---|---:|---|
| `/Users/vedpatel/Desktop/merged (1).md` | 1,550,039 bytes | `c8047b3d4d8127ee5ab097bef70d73b364ca0b9caf720b3e93766ce64bb3affc` |
| `/Users/vedpatel/Desktop/UrbanLand_website/URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` | 80,559 bytes | `dbd10c45bb3394ca396f21d5b75682d87a32d118e023f22a1abfd95371a36b8b` |
| `/Users/vedpatel/Desktop/UrbanLand_website/docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md` | — | `7c3df79e63aa9455435ed7325dcf89e745677b254f3c0b3c2a78f395f3aa571c` |

Run the following read-only command after source files change to refresh root-document review evidence:

```sh
wc -l ./*.md
shasum -a 256 ./*.md
```

Do not copy UrbanEdge Living Space source, database configuration, migrations, authentication, storage configuration or deployment configuration into this repository.
