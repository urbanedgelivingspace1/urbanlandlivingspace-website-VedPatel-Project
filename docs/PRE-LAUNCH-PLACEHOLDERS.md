# UrbanEdge Land Space — Pre-Launch Placeholder Register

Every development placeholder must be replaced or explicitly approved before launch. This register
supplements `14-PRE-LAUNCH-CHECKLIST.md`; it does not weaken any launch gate in that document.

| ID | Current placeholder | Location | Required replacement / resolution | Target milestone | Status |
|---|---|---|---|---|---|
| PLH-001 | Former foundation-only public home content | `app/(public)/page.tsx` | Resolved with the M10 public home experience backed only by publish-eligible projections and honest empty/fallback states | M10 | RESOLVED |
| PLH-002 | Former unauthenticated admin foundation notice | `/admin/login` and `/admin/dashboard` | Resolved with protected authentication, active-admin authorization and responsive operational shell | M5 | RESOLVED |
| PLH-003 | Text-only “UrbanEdge Land Space” wordmark | `components/foundation/brand-wordmark.tsx` | Obtain approval for a Land Space-specific lockup or explicitly approve the text treatment; do not relabel the supplied Living Space JPEG | Brand approval before launch | OPEN |
| PLH-004 | No approved real property inventory or property photography/media | Public property collections and details | Import only owner-approved real inventory through the publication gate and approve its public media; never substitute fabricated property records or misleading stock property imagery | M19 / before launch | OPEN |
| PLH-005 | Public phone, WhatsApp, email, office address and Living Space destination are unconfigured | `public_app_settings` consumed by the public header, footer and property actions | Approve and configure real destinations; unavailable actions remain disabled or absent until then | M13 / before launch | OPEN |
| PLH-006 | Map style/provider and attribution are unconfigured | `NEXT_PUBLIC_MAP_STYLE_URL`, `NEXT_PUBLIC_MAP_PROVIDER` and public property maps | Select and approve the MapLibre-compatible provider/style and attribution; map enhancement remains unavailable until configured | M19 / before launch | OPEN |
| PLH-007 | No lawyer-approved public property verification terminology | Public property details and verification explainer | Obtain qualified Gujarat property-lawyer approval through the existing copy-policy workflow before enabling any property-specific claim | Legal approval before launch | OPEN |

No real property inventory, owner/customer data or misleading property photography is present. Synthetic fixtures exist only inside guarded automated tests and the isolated disposable local database.
