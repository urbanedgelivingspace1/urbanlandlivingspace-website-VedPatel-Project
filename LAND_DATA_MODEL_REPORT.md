# LAND_DATA_MODEL_REPORT.md

# URBANEDGE LAND SPACE — LAND DATA MODEL REPORT

**Research date:** 29 August 2026  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Planned expansion:** Gujarat → India  
**Scope:** Land brokerage data architecture only; no application code and no SQL migrations.

> **Authority note:** This report is a domain/data-model recommendation for a brokerage product. It is not a legal opinion, title certificate, planning opinion, tax opinion, or guarantee that a parcel is transferable/developable. Where a legal or government-specific concept is described, the report cites the researched source. Marketplace fields and workflow recommendations are explicitly identified as product recommendations.

---

## Executive Summary

UrbanEdge Land Space should model a land listing as a **parcel-centric brokerage record plus separate government-record, planning, pricing, media, document, verification, and workflow dimensions**. A single flat `land_status` field is not sufficient.

The most important V1 design choices are:

1. **Separate platform identity from government identifiers.** Use an immutable platform property ID such as `UEL-AG-000001`, while storing survey/block/plot/property-card references as source identifiers. Gujarat land-record systems distinguish rural record-of-rights data, city-survey/property-card data, registration data, and planning data. Government sources show rural records include forms such as VF-6, VF-7 and VF-8A, while urban records use Property Cards/City Survey records. [S1][S2][S3]
2. **Treat geography as multiple dimensions, not one hierarchy.** District → taluka/subdistrict → village/locality is the core administrative chain; TP scheme, planning authority, GIDC estate, city-survey ward, and PIN code are related dimensions rather than child nodes of that chain. AUDA's own TP data is organized by TP scheme and area/village, and the Gujarat CGDCR identifies appropriate development authorities separately from local geography. [S4][S5]
3. **Use strong typed area and price primitives.** Store numeric area and its declared source unit; normalize to square metres only when the conversion is authoritative. Do not create a universal Bigha/Vigha conversion for Gujarat. Government land-data standards explicitly list multiple units and note that conversion factors can be local. [S6]
4. **Make tenure and planning claims structured but non-declarative.** `old_tenure`, `new_tenure`, `restricted_tenure`, NA status, section references, zoning, TP/FP/OP and GIDC tenure should be stored as source-backed attributes/statuses, not as a single “clear/legal” boolean. Gujarat's Revenue Department lists multiple permission/tenure workflows, including sections 43, 63, 65, 65B and 73AA-related matters. [S7][S8]
5. **Separate exact and public-safe location.** Exact coordinates should be private; public coordinates should be separately stored at an intentionally degraded/offset level. This prevents an API or search index from leaking the exact parcel location. The model should also support a public textual locality and access description.
6. **Separate verification from marketing.** A published listing can show a concise verification summary, while evidence files, reviewer identity, notes and document metadata remain internal. Revenue records and registered documents are inputs to a brokerage verification workflow, not merely marketing badges. [S2][S3]
7. **Use a hybrid storage approach.** Strong typed columns should cover identifiers, location, area, transaction, pricing, publication, availability, and commonly filtered category attributes. A configurable attribute layer should cover rapidly changing category-specific fields. Do not use a giant EAV table for all property data.
8. **Design for Gujarat now, India later.** Gujarat-specific terms such as VF-7/VF-8A/VF-6, Sarat terminology, TP/OP/FP and GIDC should sit behind jurisdiction/category-aware concepts so the core property entity remains portable.

The authoritative V1 model is summarized at the end in **Section 27 — Recommended UrbanEdge Land Space Data Model — V1**.

---

# 1. Research Standard

## 1.1 Sources used

The research prioritized Government of Gujarat, Revenue Department, GIDC, AUDA, Gandhinagar district/authority sources and Government of India Department of Land Resources material. Industry terminology was used only where an official source did not provide a sufficiently product-oriented label.

High-value official sources include:

- Gujarat Revenue Department — Gujarat Land Revenue Code, 1879 and Collector Manual. [S1][S2]
- Gujarat Revenue Department — iORA services, which expose workflows relating to section 43, new/restricted tenure, section 65, section 65A, section 65B, section 63, section 73AA and related matters. [S7]
- Gujarat Informatics / e-Dhara — state land-record digitization, VF-6/VF-7/VF-8A and linkage with registration. [S3]
- Gujarat Revenue Department — City Survey / Property Card forms and registers. [S9]
- AUDA — TP Scheme and Development Plan material. [S4]
- Gujarat Urban Development & Urban Housing / CGDCR material hosted by GIDC. [S5]
- GIDC — FAQs, lease tenure, transfer, applications and current allotment-price structure. [S10][S11][S12]
- Government of India, Department of Land Resources — DILRMP, area-unit standards, ULPIN/Bhu-Aadhaar and current DILRMP 3.0 material. [S6][S13][S14]
- Gandhinagar District official site and GUDA official portal for current local authority context. [S15][S16]

## 1.2 Official terminology vs marketplace terminology

The product should preserve official labels where they have legal/record meaning and use marketplace labels only as UI aliases. Examples:

| Official / record concept | Marketplace/UI alias | Rule |
|---|---|---|
| Village Form 7 / VF-7 | “7/12” / “7-12” / “Satbara” | Show “VF-7 (commonly called 7/12)” when explaining the record. Gujarat's current system separates VF-7 from Form 12. [S2] |
| Village Form 12 | Crop/season details | Treat separately from the ownership/rights record. [S2] |
| VF-8A | Khata details / holding account | Keep the government identifier `VF-8A`; “Khata” is a useful UI label. e-Dhara explicitly delivers VF-8A. [S3] |
| VF-6 | Mutation / entry register | Keep the official form reference. [S2][S3] |
| City Survey / Property Card | Urban property record | Use `property_card` and `city_survey` fields for urban parcels. [S9] |
| TP Scheme | Town Planning Scheme | Do not model it as a village child. It is a planning dimension. [S4][S5] |
| FP / OP | Final Plot / Original Plot | Use exact source values and do not infer ownership/development rights from the label alone. [S9] |
| GIDC estate | Industrial estate | Keep `gidc_estate` separate from generic location. [S10] |
| Jantri | Government reference value / Jantri | Store as a source/versioned reference, never as the listing's market price. The Gujarat Revenue Department exposes online Jantri rates. [S17] |

## 1.3 What this report intentionally does not do

This report does not decide whether any particular buyer is legally eligible to acquire agricultural land, whether a title is marketable, whether a parcel is legally developable, whether a section-specific permission is required in a given case, or whether a GIDC transfer is approvable. Those are transaction-specific professional/legal questions.

---

# 2. Goal

The model is designed for eight product needs:

1. **Public discovery:** find relevant land by category, place, size, price, use and high-value physical features.
2. **Public property detail:** show the information a buyer actually needs without leaking private records.
3. **Brokerage operations:** source/owner management, follow-up, listing quality, negotiation and availability.
4. **Legal/verification review:** track records, permissions, evidence and review status separately from marketing data.
5. **Owner submissions:** collect enough information to create a draft without asking owners to submit unnecessary sensitive data.
6. **Search/filtering:** support performant typed filters and sorting.
7. **SEO:** maintain canonical location, category, area, descriptive fields and indexable public content.
8. **Future Gujarat/India expansion:** allow additional state/jurisdiction record types without rewriting the common property model.

### Product principle

A field belongs in V1 only when it materially improves **discovery, decision-making, brokerage operations, verification, integration, or future extensibility**.

---

# 3. Data Classification

Every important field should carry two orthogonal dimensions:

### Visibility

- **Public** — safe/useful to expose on the public listing/API.
- **Admin Only** — operational but not public.
- **Sensitive / Private** — personal, confidential, document, exact-location or commercially sensitive information.
- **Verification Evidence** — internally retained material that supports a verification state.

### Data shape

- **Core Typed Field** — a first-class column because it drives filtering, integrity, sorting, relations or common business logic.
- **Flexible Attribute** — category-specific or evolving attribute suitable for configurable storage.
- **Derived** — computed from authoritative typed inputs; should not normally be hand-entered.

### Recommended rule

A field can be `Public + Core`, `Admin + Core`, `Private + Core`, `Verification Evidence + Flexible`, etc. Visibility and data shape should never be treated as the same concept.

---

# 4. Common Property Fields

These fields apply across Agricultural, NA and Industrial listings.

| Field | Meaning | Data Type Concept | Public/Admin | Filterable | Required? | Notes |
|---|---|---|---|---|---|---|
| `property_id` | Permanent UrbanEdge listing/property identifier | String identifier | Admin + public slug relation | Yes | Yes | Platform ID only; never a government identifier. |
| `public_slug` | SEO/public URL slug | String | Public | No | On publish | Derived/managed; must be unique. |
| `land_category` | Agricultural / NA / Industrial | Enum | Public | Yes | Yes | Strong typed discriminator. |
| `transaction_intent` | Buy / Rent / Lease | Enum/set | Public | Yes | Yes | A listing may support more than one transaction only if commercially true; otherwise one primary intent. |
| `listing_title` | Human-facing title | String | Public | No | Draft optional; publish yes | Editorial field. |
| `short_description` | Concise public summary | Text | Public | No | Publish recommended | Not a legal representation. |
| `description` | Detailed public description | Text | Public | No | Publish recommended | Must avoid unsupported legal/development claims. |
| `availability_status` | Available / Under Negotiation / Sold / Rented / Leased / Off Market | Enum | Public/Admin | Yes | Yes | Separate from publication. |
| `publication_status` | Draft / Under Review / Published / Unpublished / Archived | Enum | Admin | Yes | Yes | Separate lifecycle. |
| `featured` | Editorial featured flag | Boolean | Admin/derived public | No | No | Editorial, not a property fact. |
| `listing_source_type` | Owner / Broker / Developer / Institutional / Internal | Enum | Admin | Optional | No | Operational source dimension. |
| `source_reference` | External/internal source reference | String | Admin | No | No | Do not expose proprietary lead/source notes. |
| `owner_submission_id` | Link to owner submission | Relation | Admin | No | No | Only where applicable. |
| `primary_location_id` | Normalized geography relation | Relation | Admin/public derived | Yes | Yes at publish | Core location relation. |
| `locality_label` | Public locality/area name | String | Public | Yes | Recommended | May be marketplace/locality terminology. |
| `landmark_text` | Nearby recognizable landmark | String/text | Public | Optional | No | Useful for discovery/field work. |
| `public_address` | Public-safe location description | Text | Public | No | Publish yes | Do not equate this with exact legal parcel address. |
| `location_precision` | Exact / Approximate / Hidden | Enum | Admin | Yes internally | Yes | Governs public map behavior. |
| `private_latitude` | Exact parcel/entry coordinate | Decimal | Sensitive / Private | Admin only | No | Never expose through public APIs. |
| `private_longitude` | Exact parcel/entry coordinate | Decimal | Sensitive / Private | Admin only | No | Never expose through public APIs. |
| `public_latitude` | Public-safe map coordinate | Decimal | Public | No | No | May point to locality/centroid/offset area. |
| `public_longitude` | Public-safe map coordinate | Decimal | Public | No | No | Separate storage is critical. |
| `road_touch` | Whether parcel directly touches a road | Boolean/enum | Public | Yes | Category-specific | Prefer enum `direct`, `via_approach`, `no_direct_touch`, `unknown`. |
| `approach_road_type` | Public/private/revenue/access road etc. | Enum/attribute | Public/Admin | Optional | No | Exact legal right of way is verification, not marketing. |
| `road_width_value` | Road width | Number | Public | Yes | No | Store source/measurement context. |
| `road_width_unit` | Road width unit | Enum | Public | No | No | Usually metre/feet. Normalize internally if appropriate. |
| `frontage_value` | Frontage length | Number | Public | Yes | No | Store actual unit. |
| `frontage_unit` | Frontage unit | Enum | Public | No | No | Typically metre/feet. |
| `area_display` | Owner/marketplace-declared display area | Decimal | Public | Yes | Recommended | User-facing source figure; not normalized truth. |
| `area_display_unit` | Display unit | Enum | Public | Yes | Recommended | Strong typed unit enum. |
| `area_sqm` | Authoritative/verified normalized area | Decimal | Admin + public derived | Yes/sort | No | Derived only when conversion/source is authoritative. |
| `area_source` | Where the area came from | Enum/text | Admin | No | Recommended | e.g. owner, VF-7, property card, GIDC record, survey. |
| `area_verification_status` | Verified / Unverified / Conflicting | Enum | Admin/public summary | Yes internally | No | Not the same as title verification. |
| `price_type` | Exact / Range / On Request | Enum | Public | Yes | Yes | Keep display separate from numeric values. |
| `price_min` | Minimum total price | Money | Public/Admin | Yes/sort | Conditional | Required for exact or range. |
| `price_max` | Maximum total price | Money | Public/Admin | Yes/sort | Conditional | Same number as min for exact price. |
| `price_basis` | Total / per unit | Enum | Public | Yes | Conditional | e.g. total, sqm, sq ft, sq yd, acre, guntha. |
| `price_unit` | Unit underlying a per-unit price | Enum | Public | Yes | Conditional | Must be blank/null for total price. |
| `price_currency` | Currency | Currency code | Public | No | Yes | Default INR for launch. |
| `price_negotiable` | Negotiability | Boolean | Public | Optional | No | Marketplace fact supplied by source. |
| `lease_rent_amount` | Rent/lease amount | Money | Public | Yes | For rent/lease | Separate from sale price where needed. |
| `lease_rent_period` | Month/year/quarter/etc. | Enum | Public | Yes | For rent/lease | Use controlled list. |
| `security_deposit_amount` | Deposit | Money | Public/Admin | Optional | No | Use only when relevant. |
| `currency_symbol_display` | UI display symbol | Derived | Public | No | No | Derived from currency. |
| `title_reference_summary` | High-level record summary | Text | Public summary/Admin | No | No | Never a substitute for title review. |
| `verification_summary` | Public verification summary | Text/structured summary | Public/Admin | No | Publish recommended | Only approved safe claims. |
| `media_cover_id` | Cover media relation | Relation | Public | No | Publish yes | Derived from media ordering if desired. |
| `created_at` | Record creation time | Timestamp | Admin | No | Yes | System generated. |
| `updated_at` | Last update time | Timestamp | Admin | No | Yes | System generated. |
| `published_at` | Publication time | Timestamp | Admin | Sortable | No | System generated. |
| `last_verified_at` | Latest approved verification date | Timestamp | Admin/public summary | Sortable | No | Derived from verification records. |
| `seo_title` | SEO title | String | Public | No | Publish recommended | Editorial. |
| `seo_description` | SEO description | String | Public | No | No | Editorial. |
| `canonical_url` | Canonical URL | Derived string | Public | No | On publish | Derived from slug/site structure. |

### Common public detail-page recommendation

The first public screen should focus on: **category, transaction, area, price, location, access, key category-specific facts, media, public verification summary and enquiry CTA**. Government-record identifiers should be shown only when they add buyer confidence and do not expose sensitive/private information.

---

# 5. Agricultural Land Model

## 5.1 Domain observations

Gujarat's rural land records are centered around record-of-rights and mutation/crop information. The Gujarat Collector Manual explains that the current system separates Village Form 7 from Form 12: VF-7 carries information including survey number, area, tenure, holder and other rights/encumbrance information, while Form 12 carries crop/season/irrigation/tree information. VF-6 is used for mutation entries. e-Dhara exposes VF-6, VF-7/7-12 and VF-8A services statewide. [S2][S3]

The model therefore should **not** create one “7/12 JSON blob”. It should store the specific record references and a curated subset of the facts useful to brokerage.

## 5.2 Agricultural fields

| Field | Meaning | Type Concept | Visibility | Filterable | Required? | Notes |
|---|---|---|---|---|---|---|
| `survey_number` | Main government survey identifier | String | Public/Admin | Yes | Publish recommended | Strong typed identifier. Preserve original formatting. |
| `hissa_number` | Subdivision/share of a survey number where applicable | String | Public/Admin | Yes | No | Do not force when not present. |
| `block_number` | Block identifier where used | String | Public/Admin | Yes | No | Some areas/records use block instead of/alongside survey. |
| `vf7_reference` | VF-7 source/reference | String/document relation | Admin + verification | No | No | Public should normally show only a safe record summary, not uploaded file. |
| `vf8a_reference` | VF-8A/Khata reference | String/document relation | Admin + verification | No | No | Useful for internal ownership/holding checks. |
| `vf6_entry_reference` | Relevant mutation entry reference | String/set/document relation | Admin + verification | No | No | Store multiple entries as separate verification evidence or entry records. |
| `vf12_crop_record_summary` | Current/representative crop information | Flexible attribute | Public/Admin | Yes optionally | No | Crop data is distinct from ownership record. [S2] |
| `tenure_type` | Old/New/Restricted/Other/Unknown | Enum | Admin + public summary | Yes | Recommended | Use controlled vocabulary; do not infer legal transferability. |
| `tenure_source` | Source of tenure statement | Text/relation | Admin | No | No | e.g. record/order. |
| `land_classification` | Official/record classification where relevant | Enum/flexible | Admin/Public summary | Optional | No | Do not invent categories. |
| `agricultural_use_status` | Current use or declared agricultural use | Enum | Public/Admin | Yes | No | Separate current use from legal land-use permission. |
| `soil_type` | Buyer-useful soil classification | Flexible attribute | Public/Admin | Yes | No | Source should be known if claimed. |
| `soil_source` | Source for soil claim | Text/document | Admin | No | No | Especially relevant for large farming parcels. |
| `irrigation_status` | Irrigated / Rainfed / Mixed / Unknown | Enum | Public | Yes | No | High-value search field. |
| `irrigation_source_type` | Borewell/Well/Canal/Other | Multi-select enum | Public | Yes | No | Source, not guarantee of current functional capacity. |
| `borewell_count` | Number of borewells | Integer | Public/Admin | Yes | No | Only where material. |
| `well_count` | Number of wells | Integer | Public/Admin | Yes | No | Only where material. |
| `canal_access` | Canal availability/access | Enum | Public/Admin | Yes | No | Do not imply legal water entitlement. |
| `electricity_available` | Electricity connection/access | Boolean/enum | Public | Yes | No | Distinguish `on_site`, `nearby`, `unknown`. |
| `electricity_connection_type` | Connection category | Flexible attribute | Public/Admin | Optional | No | E.g. agricultural/other only when actually documented. |
| `current_crops` | Current crops | Multi-value attribute | Public | Yes | No | Marketing feature, not ownership/title fact. |
| `orchard_present` | Orchard exists | Boolean | Public | Yes | No | Add crop/orchard type as flexible attribute. |
| `orchard_type` | Mango/citrus/etc. | Flexible attribute | Public | Yes | No | Optional. |
| `tree_count_estimate` | Approximate tree count | Number | Public/Admin | Optional | No | Prefer “approx.” label. |
| `fencing_status` | Fenced/Partially/Unfenced/Unknown | Enum | Public | Yes | No | Physical feature, not legal boundary confirmation. |
| `topography` | Flat/Sloping/Undulating/etc. | Enum/flexible | Public | Yes | No | Marketplace field. |
| `land_shape` | Regular/Irregular/Corner etc. | Enum/flexible | Public | Yes | No | Geometry marketing/operational descriptor. |
| `structure_present` | Farmhouse/shed/other structure | Boolean | Public | Yes | No | Structure details as separate flexible attributes. |
| `structure_type` | Farmhouse/Shed/Storage/Other | Multi-select | Public | Yes | No | Do not classify legality here. |
| `built_structure_area` | Approx built-up area | Number + unit | Public/Admin | Yes | No | Source should be captured. |
| `right_of_way_claim` | Claimed access/ROW | Enum | Admin + public summary | Yes internally | No | Legal right should require verification evidence. |
| `approach_road_source` | Source for approach road claim | Text/doc | Admin | No | No | e.g. owner map, survey, planning record. |
| `boundary_summary` | North/East/South/West boundary text | Structured text | Public/Admin | No | No | Prefer generalized public text where exact adjacency is sensitive. |
| `survey_mapni_status` | Mapni/survey measurement status | Enum | Admin + public summary | Yes internally | No | Not a legal conclusion. |
| `measurement_source` | Source of measured area | Enum/relation | Admin | No | Recommended | VF-7, survey/mapni, owner statement, etc. |
| `revenue_case_flag` | Known revenue case/issue | Boolean/status | Admin | Yes internally | No | Avoid public alarm wording until reviewed. |
| `agriculturist eligibility_note` | Buyer-eligibility note | Sensitive/admin | Admin only | No | No | Do not encode eligibility as a general parcel fact. |

## 5.3 What these agricultural record concepts mean for the product

### Survey number

The Gujarat land-record modernization material describes the survey number as the unique number assigned to a parcel during survey and notes that spatial and textual land records are linked to that survey identity. [S2][S18]

**Product role:** core typed identifier; search/filterable; public display is often useful.

### VF-7 / 7-12

The Collector Manual explains that the current Gujarat system separates Form 7 from Form 12. VF-7 contains survey number, area, tenure, holder and other-right information; Form 12 contains cultivation/crop/irrigation/tree information. [S2]

**Product role:** store the record references separately; expose a concise, reviewed summary rather than treating an uploaded record image as the property model.

### VF-8A

e-Dhara explicitly includes VF-8A in its RoR services alongside VF-6 and VF-7/7-12. [S3]

**Product role:** use as a khata/holding-reference field in verification; do not expose more owner-level information than necessary.

### VF-6 / mutation

The Revenue Department describes Village Form 6 as the mutation register and the Gujarat Land Revenue Code contains the statutory record-of-rights/mutation framework. Certified mutation entries flow into record-of-rights according to the prescribed process. [S2][S19]

**Product role:** verification evidence/reference; not a public “title cleared” badge.

### Tenure / Sarat

The Revenue Department's current iORA service menu distinguishes new and indivisible tenure, restricted-tenure permissions, old-tenure conversion/premium workflows, section 43, section 63, section 65 and section 65B matters. [S7] The Collector Manual also instructs officials to examine government controls such as new tenure, restricted tenure or premium conditions when processing NA permission. [S8]

**Product role:** a structured legal/revenue attribute plus evidence/status, never a simple “freehold = yes” assumption.

### Mapni

Government land-survey materials describe spatial records, field measurement books/Tippans and survey/settlement work; Gujarat iORA also exposes an application for measurement relating to survey-number boundary, hissa or part. [S18][S7]

**Product role:** store measurement/survey status and evidence as verification data; do not describe a parcel as “legally demarcated” unless a qualified review supports that claim.

## 5.4 Agricultural V1 filters

Recommended public agricultural filters:

- Location: district, taluka, village, locality.
- Area range.
- Price range and price basis.
- Road-touch/direct access.
- Road width range.
- Irrigation status/source.
- Electricity availability.
- Orchard present.
- Farmhouse/structure present.
- Topography.
- Availability/transaction.
- Optional reviewed tenure category filter only if UrbanEdge has a sufficiently reliable normalized vocabulary.

Do **not** initially create public filters for every revenue-record condition, legal section, mutation type, or internal verification state.

---

# 6. NA Land Model

## 6.1 Meaning of NA

In Gujarat, “Non-Agricultural” is a revenue/use concept with statutory procedures. The Collector Manual states that agricultural land occupants may apply for permission for various non-agricultural uses and references sections 65, 65A, 65B and related provisions. It also states that land records and conditions relating to permission are recorded in village records. [S8] The Gujarat Land Revenue Code contains section 65 for uses by occupants, section 65A for changing from one non-agricultural purpose to another, and section 65B concerning bona fide industrial purpose in specified circumstances. [S20]

**Product implication:** `is_na` alone is insufficient. The application should capture **NA permission/status + purpose + order/reference + date + evidence**, while keeping the exact legal interpretation in verification notes.

## 6.2 NA fields

| Field | Meaning | Type Concept | Visibility | Filterable | Required? | Notes |
|---|---|---|---|---|---|---|
| `na_status` | Not NA / NA / Applied / Unknown / Not Applicable | Enum | Public/Admin | Yes | Recommended | Do not default to NA based on zoning alone. |
| `na_permission_type` | General/section-specific/local category | Enum/text | Admin + public summary | Yes internally | No | Preserve source wording. |
| `na_section_reference` | Section/source reference | String | Admin + public summary | No | No | Example section 65 or 65A. Legal context must be reviewed. [S20] |
| `na_use_purpose` | Residential/Commercial/Industrial/Mixed/Other | Enum | Public | Yes | For NA | One of the highest-value NA fields. |
| `na_use_purpose_detail` | More precise permitted use description | Flexible attribute | Public/Admin | Yes optionally | No | e.g. logistics, hotel, warehouse, office, etc. only when supported. |
| `na_order_number` | Order/reference number | String | Admin/verification | No | No | May be sensitive as part of document metadata; decide per workflow. |
| `na_order_date` | Permission/order date | Date | Public summary/Admin | Sort/no | No | Useful for verification timeline. |
| `na_document_id` | Linked evidence | Relation | Verification evidence | No | No | Private. |
| `survey_number` | Revenue survey identifier | String | Public/Admin | Yes | Recommended | Common across categories. |
| `block_number` | Block identifier | String | Public/Admin | Yes | No | Common identifier where applicable. |
| `planning_authority_id` | Responsible planning/development authority | Relation | Public/Admin | Yes | Recommended | Separate from village/taluka. |
| `development_plan_zone` | DP/zone designation | String/enum | Public summary/Admin | Yes | No | Source-backed planning attribute. |
| `zoning_source` | Source/date for zoning | Relation/text | Admin | No | Recommended | Avoid stale planning claims. |
| `tp_scheme_id` | TP scheme relation | Relation | Public/Admin | Yes | No | Planning dimension, not administrative hierarchy. |
| `op_number` | Original Plot number | String | Public/Admin | Yes | No | Only when applicable. |
| `fp_number` | Final Plot number | String | Public/Admin | Yes | No | Only when applicable. |
| `plot_number` | Marketplace/planning plot number | String | Public/Admin | Yes | No | Keep separate from survey/block. |
| `plot_length` | Length | Number | Public | Yes | No | Use verified source/approx. |
| `plot_width` | Width | Number | Public | Yes | No | Use verified source/approx. |
| `plot_dimension_unit` | Length unit | Enum | Public | No | No | Usually metre/feet. |
| `corner_plot` | Corner status | Boolean/enum | Public | Yes | No | Strong discovery attribute. |
| `road_width_value` | Abutting/approach road width | Number | Public | Yes | No | Specify which road if multiple. |
| `road_width_source` | Road-width source | Admin | No | No | No | Planning drawing/site measurement. |
| `fsi_far_claim` | FSI/FAR stated for parcel | Number/text | Public summary/Admin | Yes internally | No | Critical distinction: “permitted/currently applicable” must be verified. |
| `fsi_far_unit` | Ratio/basis of FSI claim | Enum/text | Admin/public | No | No | Avoid storing only a formatted string. |
| `development_potential_summary` | Buyer-readable potential summary | Text | Public | No | No | Must be explicitly caveated and source-backed. |
| `layout_approval_status` | Approved/Submitted/Not known/Not applicable | Enum | Public/Admin | Yes | No | Source-backed. |
| `layout_approval_reference` | Layout approval reference | String | Admin/verification | No | No | Private document relation. |
| `water_available` | Water access | Enum | Public | Yes | No | On-site/nearby/not available/unknown. |
| `electricity_available` | Electricity access | Enum | Public | Yes | No | On-site/nearby/unknown. |
| `drainage_available` | Drainage | Enum | Public | Yes | No | Do not imply municipal commitment. |
| `sewer_connection` | Sewer/drainage connection | Enum | Public | Yes | No | Category-specific. |
| `development_restrictions_summary` | Known restrictions | Text | Public summary/Admin | No | No | Detailed restrictions remain verification data. |
| `permission_condition_summary` | Key conditions affecting use | Text | Admin/public summary | No | No | Should be reviewed by responsible professional. |

## 6.3 NA V1 recommendation

V1 should support:

- NA status.
- Permitted/current NA purpose.
- Section/reference when known.
- Order number/date as admin/verification data.
- Survey/block/plot identifiers.
- Planning authority.
- DP zone.
- TP/OP/FP where applicable.
- Plot dimensions/frontage/road width.
- Corner status.
- FSI/FAR **as a source-backed planning value**, not an automatically calculated development right.
- Layout approval status.
- Utility/access summary.
- Restrictions summary.

V1 should **not** attempt to model every development-control regulation, building-permission clause, fire code, parking standard or construction-compliance condition. Those belong to a later planning/compliance module.

---

# 7. Industrial Land Model

## 7.1 Gujarat industrial-land distinction

GIDC is a distinct land/estate ecosystem. GIDC states that industrial-estate land is allotted on a leasehold basis, with a 99-year lease that can be renewable for another 99 years, and its public systems include land application, transfer, mortgage permission, plan approval, water, drainage and related workflows. [S10][S11]

GIDC also explicitly provides online services for transfer and distinguishes utilized from non-utilized/open industrial property in its FAQ/policy explanation. [S10]

Therefore, “Industrial” in the UrbanEdge product must not mean “GIDC” automatically. V1 needs at least these commercially useful subtypes:

- **GIDC plot/shed**
- **Private industrial estate plot**
- **Private industrial land with industrial/NA status**
- **Leasehold industrial property**
- **Freehold/private industrial land where applicable**

## 7.2 Industrial fields

| Field | Meaning | Type Concept | Visibility | Filterable | Required? | Notes |
|---|---|---|---|---|---|---|
| `industrial_land_subtype` | GIDC / Private estate / Private industrial / Other | Enum | Public | Yes | Recommended | Critical discovery field. |
| `gidc_estate_id` | GIDC estate | Relation | Public/Admin | Yes | GIDC only | Separate dimension. |
| `gidc_plot_number` | GIDC plot/shed number | String | Public/Admin | Yes | GIDC only | Source identifier. |
| `plot_number` | General industrial plot number | String | Public/Admin | Yes | No | Do not overload with GIDC plot number. |
| `survey_number` | Underlying revenue survey number | String | Admin/Public | Yes | No | May be multiple; relation preferred for multi-parcel listings. |
| `block_number` | Block number | String | Admin/Public | Yes | No | Where used. |
| `industrial_tenure_type` | Leasehold/freehold/other | Enum | Public | Yes | Recommended | GIDC should normally be tagged leasehold based on GIDC guidance. [S10] |
| `lease_start_date` | Lease commencement | Date | Admin/public summary | Yes | GIDC/leasehold | Contractual fact. |
| `lease_end_date` | Lease expiry | Date | Admin/public | Yes/sort | GIDC/leasehold | Do not infer renewal. |
| `lease_renewable` | Whether contract/policy provides renewal possibility | Boolean/enum | Admin | No | No | Source-backed. |
| `transfer_status` | Transfer allowed/pending/requires permission/unknown | Enum | Admin/public summary | Yes internally | No | GIDC transfer requires corporation process. [S10] |
| `allotment_status` | Allotted/occupied/open/etc. | Enum | Public/Admin | Yes | No | Use source terminology where possible. |
| `allotment_letter_reference` | Allotment reference | String/relation | Verification | No | No | Private evidence. |
| `possession_status` | Possession received/pending/unknown | Enum | Admin | Yes | No | Important for GIDC. |
| `permitted_industrial_use` | Permitted industry/use description | Text/enum | Public/Admin | Yes | Recommended | Could be broad + detailed. |
| `industrial_use_class` | Sector/category | Flexible attribute | Public | Yes | No | e.g. engineering, food, warehousing; do not invent statutory category where none exists. |
| `industrial_permission_status` | Permission/status summary | Enum | Admin/public summary | Yes | No | Keep evidence separately. |
| `section_65b_reference` | Section 65B-related reference where applicable | String/relation | Admin | No | No | Do not infer section applicability merely from “industrial”. [S20] |
| `zoning_designation` | Planning/zoning designation | String/enum | Public/Admin | Yes | No | Planning source-backed. |
| `existing_shed_present` | Existing shed | Boolean | Public | Yes | No | Strong buyer filter. |
| `shed_built_up_area` | Shed built-up area | Number | Public | Yes | No | Use area unit. |
| `shed_area_unit` | Unit | Enum | Public | No | No | sq m/sq ft etc. |
| `open_yard_area` | Open area | Number | Public | Yes | No | Buyer logistics use. |
| `shed_height` | Clear/eaves/ridge height depending source | Number + unit | Public | Yes | No | Label exactly which height. |
| `shed_height_type` | Height definition | Enum | Public | No | No | Prevent misleading comparison. |
| `crane_provision` | Crane availability/provision | Enum | Public | Yes | No | `installed`, `provision`, `none`, `unknown`. |
| `crane_capacity` | Capacity | Number + unit | Public | Yes | No | Only when verified. |
| `road_width_value` | Estate/plot road width | Number | Public | Yes | No | Strong logistics filter. |
| `truck_access` | Truck/container access | Enum | Public | Yes | No | Practical marketplace field. |
| `loading_unloading_area` | Loading/unloading facility | Enum | Public | Yes | No | Approximate/verified. |
| `power_available` | Power access | Enum | Public | Yes | No | On-site/nearby/unknown. |
| `sanctioned_load` | Sanctioned electrical load | Number + unit | Public/Admin | Yes | No | High value for industrial buyers; source required. |
| `transformer_present` | Dedicated/shared transformer | Enum | Public | Yes | No | Source-backed. |
| `water_availability` | Water availability | Enum | Public | Yes | No | Do not promise industrial capacity unless documented. |
| `drainage_available` | Drainage access | Enum | Public | Yes | No | Particularly useful in estates. |
| `cetp_available` | CETP access | Enum | Public | Yes | No | Capture only where meaningful. |
| `etp_present` | ETP present | Boolean/enum | Public/Admin | Yes | No | Property feature; not full compliance. |
| `gas_available` | Gas access | Enum | Public | Yes | No | Source-backed. |
| `fire_noc_status` | Fire/NOC summary | Enum | Admin/public summary | No | No | Avoid compliance-system expansion. |
| `pollution_category` | Pollution category if relevant | Enum/text | Public/Admin | Yes | No | Only where officially applicable/verified. |
| `highway_distance_km` | Approx road distance to highway | Number | Public | Yes | No | Derived from map/route source; recalculate when routing source changes. |
| `rail_distance_km` | Approx distance to rail connection | Number | Public | Yes | No | Derived. |
| `port_distance_km` | Approx distance to relevant port | Number | Public | Yes | No | Future/region specific. |
| `airport_distance_km` | Approx distance to airport | Number | Public | Yes | No | Derived. |
| `logistics_notes` | Practical logistics summary | Text | Public | No | No | Editorial. |
| `industrial_ecosystem_notes` | Nearby industrial ecosystem | Text | Public | No | No | Useful for brokerage; not a regulatory field. |
| `labor_access_summary` | Labor access | Text/attribute | Public | Optional | No | Marketplace recommendation only. |

## 7.3 Do not overbuild the industrial model

UrbanEdge is brokering **land/property**, not running a factory compliance platform. V1 should not become a database for every environmental authorization, boiler certificate, labor registration, hazardous-material license, product-specific consent, factory-plan approval, or operational compliance item.

Capture only what changes a land transaction decision, site selection, due diligence scope, or brokerage conversation.

---

# 8. Area Unit Research

## 8.1 Authoritative strategy

The Government of India's land-data standards list hectares, ares, centi-ares, square metres, square yards, square feet, acres, cents, guntas, bigha and other land-record units, and explicitly show that conversion factors can be local. [S6]

This is exactly why UrbanEdge must **not** have a global `1_bigha = X` rule.

For metric/imperial units whose definitions are standardized, standard conversions may be used. The Indian legal metrology schedule reproduced in government material gives, among other conversions, 1 square foot = 0.09290304 m², 1 square yard = 0.83612736 m², and 1 acre ≈ 4046.8561 m². [S21]

## 8.2 Unit-by-unit policy

| Unit | Recommended label | Where used | Universal/standard conversion | Gujarat consideration | V1 support |
|---|---|---|---|---|---|
| Square metre | `sq_m` / m² | Government/planning/GIDC/urban | Yes | Preferred normalization unit | **Yes — primary normalized unit** |
| Square foot | `sq_ft` / sq ft | Marketplace and commercial listings | Yes | Common for buyer search | **Yes** |
| Square yard | `sq_yd` / sq yd | Residential/commercial marketplace | Yes | Often called “yard”/“var” colloquially | **Yes** |
| Var | `var` | Gujarat marketplace terminology | Treat as local/UI terminology unless source defines it | Retain only as marketplace/display terminology when supplied; do not infer a metric conversion without a verified source | **Yes, as display unit** |
| Guntha / Gunta | `guntha` | Gujarat/Western India agricultural/property use | Common regional convention may express 1/40 acre, but this must not be treated as a Gujarat-universal statutory conversion; DoLR standards emphasize local conversion frameworks | Store declared value + conversion-source region; do not silently standardize across India | **Yes — local-unit capable** |
| Acre | `acre` | Agricultural/industrial | Standard definition | Good normalized secondary unit | **Yes** |
| Hectare | `hectare` | Government/agricultural | 10,000 m² | Government-friendly | **Yes** |
| Bigha | `bigha` | Local agricultural marketplace | **Not globally fixed** | Must be jurisdiction/source scoped | **Yes — source/display only; no universal conversion** |
| Vigha | `vigha` | Gujarat marketplace/local usage | **Not safe to treat as universal** | Region/source dependent | **Yes — source/display only** |
| Cent | `cent` | Mainly other Indian regions | Local/state context | Not a primary Gujarat V1 unit | **Future / optional** |
| Are | `are` | Land records/metric | 100 m² | Useful in some government datasets | **Future or internal import** |
| Centi-are | `centiare` | Land-data exchange | 1 m² | Mostly integration, not customer UI | **Internal/import optional** |

### Gujarat-local unit caution

The DoLR data-standard documentation is explicit that land-record units include local units and that conversion factors are locally available. [S6] Historical Gujarat material also demonstrates that Bigha-related measures have varied across territories and settlements rather than functioning as one national unit. [S22]

Therefore:

- Never store only `area = 5 bigha` and then assume an automatic square-metre value.
- Store the declared unit and its **conversion provenance**.
- If the source record itself states a metric equivalent, prefer that source-derived metric value.
- If UrbanEdge receives a marketplace “vigha” value without a verified local conversion, preserve the display value and leave normalized `area_sqm` null or provisional.
- A conversion rule must be scoped by **jurisdiction/region + unit + effective/version date + source**.

## 8.3 Recommended software strategy

Use these conceptual fields:

- `area_display_value`
- `area_display_unit`
- `area_normalized_value`
- `area_normalized_unit = sqm`
- `area_conversion_rule_id`
- `area_conversion_status = authoritative | source_declared | provisional | unknown`
- `area_source`
- `area_source_date`

A listing can therefore say:

> **5 Vigha (owner-declared)**

without pretending the software knows the exact metric equivalent.

## 8.4 Exact V1 unit list

For public listing entry/search:

**sq ft, sq yd, sq m, var, guntha, acre, hectare, bigha, vigha.**

For internal data import/integration:

**are, centiare, cent, and future state-specific units** can be enabled without making them prominent in the public UI.

---

# 9. Price Data Model

## 9.1 Price concepts

Price must be modeled as numeric data, not as a formatted string.

### Core price fields

| Field | Purpose |
|---|---|
| `price_mode` | `exact`, `range`, `on_request` |
| `price_min` | Minimum total price, or exact price when exact |
| `price_max` | Maximum total price, or same as min for exact |
| `price_basis` | `total`, `per_unit` |
| `price_unit` | `sq_ft`, `sq_yd`, `sq_m`, `acre`, `guntha`, `bigha`, `vigha`, etc. |
| `currency` | INR at launch |
| `negotiable` | Boolean |
| `price_note` | Editorial/public note |
| `price_source` | Owner/broker/documented quote/internal |
| `price_as_of` | Date/time the price was received/confirmed |

### Rent/lease

Use a separate commercial rate concept:

- `lease_rent_amount`
- `lease_rent_currency`
- `lease_rent_period`
- `lease_rent_basis` (whole property / per unit)
- `security_deposit_amount`
- `rent_escalation_note` (admin or public where relevant)
- `lease_term_value`
- `lease_term_unit`
- `lease_start_availability_date`

## 9.2 Do not convert a price basis casually

A price of ₹X per “vigha” must not automatically become ₹Y per acre without a verified regional conversion. The same unit strategy used for area must be used for price.

## 9.3 Jantri is not market price

Gujarat Revenue Department exposes online document registration and Jantri services, while GIDC publishes its own allotment-price tables for GIDC estates. [S17][S11] These figures serve reference/administrative/allotment purposes and should not overwrite the owner's asking price or UrbanEdge market price.

Recommended separate fields:

- `government_reference_value_type`
- `government_reference_value`
- `government_reference_unit`
- `government_reference_source`
- `government_reference_as_of`

Do not put Jantri into the `price_min/price_max` fields.

---

# 10. Location Hierarchy

## 10.1 True hierarchy

The safest core hierarchy is:

**Country → State → District → Taluka/Subdistrict → Village/Town/City**

The Gujarat Land Revenue Code defines districts and talukas/villages within the revenue administrative structure. [S20]

For UrbanEdge, the normalized geographic entity should also support:

- locality / neighborhood
- ward
- PIN code
- city survey ward/office where relevant

## 10.2 Separate dimensions — do not nest them under village

These concepts should be separate relations/attributes:

- **Planning authority** — e.g. AUDA, GUDA or another authority.
- **Development Plan zone** — a planning designation.
- **Town Planning Scheme** — planning scheme reference.
- **OP / FP** — original/final plot references within a TP context when applicable.
- **GIDC estate** — industrial-estate dimension.
- **City Survey** — urban survey system/dimension.
- **Survey/block identifiers** — parcel/source identifiers.
- **Public/locality label** — marketplace geography.

Government city-survey forms illustrate that survey number, block number, TP scheme number, city survey number, area, property type and tenure can appear as separate fields on the same city-survey property record. [S9]

## 10.3 Recommended geography entities

### `country`

Use standardized country code/name. V1 = India.

### `state`

V1 = Gujarat.

### `district`

Use official district source data; do not manually hard-code only launch districts.

### `taluka_subdistrict`

Store a normalized official administrative name and source code when available.

### `locality`

Marketplace-friendly local place names. This can include urban locality, neighborhood, road corridor or well-known area.

### `village`

Revenue/census-style village identity. Keep official name and local display name separately when required.

### `ward`

Applicable to local urban administration/city-survey contexts. Not every parcel needs a ward.

### `pin_code`

Postal service relation or validated string.

### `planning_authority`

Entity such as AUDA/GUDA/other planning authority.

### `tp_scheme`

Planning entity with scheme number/name, status and associated villages/areas.

### `gidc_estate`

Industrial estate entity with GIDC estate name/code and geography relation.

### `survey_reference`

One-to-many relation where a property listing corresponds to multiple survey/block/plot references.

## 10.4 Import/source strategy

Do not manually enumerate every Gujarat village for V1.

Use a governed reference-data ingestion process:

1. Import official administrative geography from a government/standard source.
2. Keep source code, official name, alternate/local names and effective dates.
3. Maintain mappings when a village/taluka/district name changes.
4. Import planning-authority/TP/GIDC reference data separately.
5. Link property records to reference entities by stable codes wherever available.
6. Preserve source snapshots/versions so a historical listing does not silently change because a reference dataset was renamed.

This is especially important because Government of India land-record modernization is moving toward interoperable digital, geo-referenced land information and ULPIN/Bhu-Aadhaar. [S13][S14]

---

# 11. Ahmedabad + Gandhinagar V1

## 11.1 Ahmedabad

UrbanEdge should recognize that land can interact with multiple planning/local-government contexts, including Ahmedabad Municipal Corporation areas and AUDA/planning-authority areas. AUDA publishes TP scheme information and Development Plan material. [S4][S5]

V1 should therefore support:

- planning authority
- local body
- TP scheme
- development plan zone
- OP/FP references
- village/locality relationship
- city survey/property-card reference where applicable

## 11.2 Gandhinagar

Gandhinagar District's official website currently lists both a **District Urban Development Authority** and **City Survey Office** among its district-office functions. [S15] The official GUDA portal identifies Gandhinagar Urban Development Authority and exposes TP scheme and plot-search concepts. [S16]

Gandhinagar V1 should therefore not assume that “Gandhinagar” means only municipal city sectors. A property can be in a wider planning/revenue geography with village, planning-authority and land-record relationships.

## 11.3 Launch reference data

At minimum, V1 reference data should cover:

- Gujarat
- Ahmedabad district
- Gandhinagar district
- relevant talukas
- relevant villages/urban places
- planning authorities
- AUDA TP schemes as used by launch listings
- GUDA TP schemes as used by launch listings
- GIDC estates relevant to Ahmedabad/Gandhinagar
- PIN codes used by launch inventory

The initial dataset can be **on-demand expanded from official sources** rather than pre-populating every village in the UI.

---

# 12. Property Identification

## 12.1 Platform identifier

Use a platform identifier such as:

`UEL-AG-000001`

Recommended pattern:

`UEL-{CATEGORY}-{SEQUENCE}`

Where:

- `AG` = agricultural
- `NA` = non-agricultural
- `IN` = industrial

The platform identifier should remain unchanged if the property is edited, re-published, sold and later relisted as a historical record.

## 12.2 Government/revenue identifiers

Store separately:

- survey number
- hissa/subdivision number
- block number
- plot number
- city survey number
- property-card reference
- TP scheme number
- OP number
- FP number
- GIDC plot/shed number
- registered document reference
- Index-2 reference
- mutation entry reference
- future ULPIN/Bhu-Aadhaar reference where available

Gujarat city-survey formats themselves show survey number, block number, TP scheme number and city-survey number as distinct fields. [S9]

## 12.3 Public exposure policy

### Generally safe/public when verified

- Survey number (often useful to buyers).
- Block/plot number.
- TP/FP/OP identifiers where commercially useful.
- GIDC estate + plot number.

### Partially public / summary only

- Registration document number.
- Index-2 reference.
- Property-card reference.
- Mutation entry reference.

### Private

- Full owner identity documents.
- Sensitive personal identifiers.
- Uploaded legal documents.
- Reviewer notes.
- Private coordinates.
- Confidential negotiation/source notes.

The Gujarat Revenue Department exposes services for property-card copies, Index-2 copies and encumbrance certificates, which confirms these are distinct record/document concepts and should not be collapsed into “ownership document”. [S7]

---

# 13. Location Privacy Model

## 13.1 Three levels

### EXACT

Use when internal operations require parcel-accurate mapping.

### APPROXIMATE

Use when public users need area-level orientation but the exact parcel should not be exposed.

### HIDDEN

Use for sensitive parcels, owner privacy, off-market inventory, or when exact mapping is not appropriate.

## 13.2 Required data separation

**Private:**

- `private_latitude`
- `private_longitude`
- optional private polygon/parcel geometry
- internal location notes

**Public-safe:**

- `public_latitude`
- `public_longitude`
- `public_location_precision`
- `public_locality_label`
- `public_address`

### Critical rule

Never derive the public coordinate on the fly from the private coordinate in an API response. Store the public-safe coordinate as a separate persisted value or a controlled derived projection, and make the API contract incapable of returning the private fields.

This is a data-model requirement because privacy must hold even when the frontend changes, a search endpoint is added, or a future third-party integration reads the property table.

---

# 14. Media Model

## 14.1 Media entity

Use a separate media collection rather than multiple `image_1`, `image_2`, etc. columns.

| Field | Meaning | Type | Visibility |
|---|---|---|---|
| `media_id` | Unique media ID | Identifier | Admin/public relation |
| `property_id` | Associated property | Relation | Admin |
| `media_type` | Image / Video / Drone / Brochure / 360 / Map / Other | Enum | Admin/public |
| `source_type` | Upload / External URL / YouTube / Storage / Other | Enum | Admin |
| `storage_path` | Internal storage path | String | Admin/private |
| `external_url` | External media URL | URL | Public if approved |
| `sort_order` | Display order | Integer | Admin |
| `is_cover` | Cover image flag | Boolean | Admin/public derived |
| `alt_text` | Accessibility/SEO text | String | Public |
| `caption` | Human-readable caption | String | Public |
| `visibility` | Public / Private / Draft | Enum | Admin |
| `mime_type` | MIME type | String | Admin |
| `file_size_bytes` | File size | Integer | Admin |
| `width` | Pixel width | Integer | Admin |
| `height` | Pixel height | Integer | Admin |
| `uploaded_at` | Upload timestamp | Timestamp | Admin |
| `approved_at` | Publication approval time | Timestamp | Admin |
| `checksum` | Duplicate/file-integrity helper | String | Admin |

## 14.2 Media recommendations

### Images

Use a standard public image object with source, caption, alt text, sort order and visibility.

### YouTube/video

Store the external video ID/URL, not a copied video binary, where the business uses external hosting.

### Drone video

Treat as a video subtype; retain the same public/private review workflow.

### PDF brochure

Store as media only if it is a public marketing brochure. Legal evidence PDFs belong in the private-document model.

### 360 tour

Store URL/provider metadata as a media subtype.

---

# 15. Private Document Model

## 15.1 Principle

Uploaded owner/legal documents should never be implicitly public. They should live in a private storage location with metadata and access control.

## 15.2 Document categories

Recommended V1 categories:

- `ownership_record`
- `revenue_record_vf7`
- `revenue_record_vf8a`
- `mutation_vf6`
- `property_card`
- `registered_document`
- `index_2`
- `na_permission`
- `na_order`
- `tp_planning_document`
- `layout_approval`
- `gidc_allotment`
- `gidc_lease`
- `gidc_transfer`
- `survey_map`
- `site_measurement`
- `other_verification`

Do not make identity-document categories mandatory. Store owner identity proof only when the workflow/legal basis requires it.

## 15.3 Document metadata

| Field | Meaning |
|---|---|
| `document_id` | Internal document identifier |
| `property_id` | Linked property |
| `document_type` | Controlled category |
| `document_title` | Human-readable internal name |
| `file_name` | Original file name |
| `storage_path` | Private storage object path |
| `mime_type` | MIME type |
| `file_size_bytes` | File size |
| `document_date` | Date stated on document, if known |
| `source_authority` | Issuing/source authority |
| `reference_number` | Document/reference number where useful |
| `verification_status` | Pending/Accepted/Rejected/Superseded |
| `review_notes` | Internal notes |
| `uploaded_by` | User/admin actor |
| `uploaded_at` | Timestamp |
| `reviewed_by` | Reviewer |
| `reviewed_at` | Timestamp |
| `supersedes_document_id` | Version relation |

---

# 16. Verification Data Model

## 16.1 Separate verification from property facts

A property may have `survey_number = 123` as a property fact, while a verification record says:

> “Survey number 123 reviewed against VF-7 uploaded on date X; reviewer Y; accepted for publication.”

These are different objects.

## 16.2 Recommended entities

### Verification

- `verification_id`
- `property_id`
- `scope`
- `status`
- `started_at`
- `completed_at`
- `reviewer_id`
- `summary`
- `risk_level`

### Verification scope

Recommended controlled scopes:

- `identity`
- `ownership_revenue`
- `physical`
- `na`
- `industrial`
- `planning`
- `legal_review`

### Verification checklist item

- `check_item_id`
- `verification_id`
- `check_code`
- `question/description`
- `status`
- `result`
- `review_note`
- `completed_at`

### Verification evidence

- `evidence_id`
- `verification_id`
- `document_id` or source reference
- `evidence_type`
- `source_date`
- `supports_claim`
- `review_status`

## 16.3 Recommended statuses

Do not use only `verified = true`.

Use a small lifecycle:

- `not_started`
- `in_progress`
- `partially_reviewed`
- `reviewed`
- `passed_for_publication`
- `needs_clarification`
- `failed`
- `superseded`

## 16.4 Public verification summary

A separate derived object can expose:

- `verification_badge_level`
- `verified_on`
- `verified_scopes`
- `public_verification_note`

But it must never expose raw reviewer notes or private documents.

---

# 17. Listing Status Model

## 17.1 Publication lifecycle

Use:

`draft → under_review → published → unpublished → archived`

A draft can be edited indefinitely.

## 17.2 Availability lifecycle

Use:

`available → under_negotiation → sold/rented/leased/off_market`

A property can be **published but under negotiation**.

## 17.3 Additional useful state

`temporarily_unavailable` can be useful operationally, but do not add many micro-statuses.

Do not mix:

- “we have not published it”
- “owner does not currently want enquiries”
- “it is sold”
- “it is in legal review”

These are different state dimensions.

---

# 18. Owner Submission Model

## 18.1 Sell Your Land / Rent Your Land / Lease Your Land

The owner-submission form should be a **lead/intake object**, not the final property record.

### Required intake fields

| Field | Visibility | Required? | Transfer to property draft? |
|---|---|---|---|
| `submission_id` | Admin | Yes | Yes, relation |
| `owner_name` | Sensitive/Admin | Yes | Only into private source data |
| `owner_phone` | Sensitive/Admin | Yes | CRM/source only |
| `owner_email` | Sensitive/Admin | No | CRM/source only |
| `preferred_contact_method` | Admin | No | No |
| `transaction_intent` | Admin/Public after conversion | Yes | **Yes** |
| `land_category` | Admin | Yes | **Yes** |
| `location_text` | Admin/Public after review | Yes | **Yes** |
| `district` | Admin | Recommended | **Yes** |
| `taluka` | Admin | Recommended | **Yes** |
| `village/locality` | Admin | Recommended | **Yes** |
| `survey_number` | Sensitive/Admin | No | **Yes if provided** |
| `block_number` | Admin | No | **Yes if provided** |
| `area_display_value` | Admin | Yes | **Yes** |
| `area_display_unit` | Admin | Yes | **Yes** |
| `expected_price` | Admin | No | **Yes, as draft asking price** |
| `price_basis` | Admin | No | **Yes if known** |
| `notes` | Admin | No | Yes to internal notes; selected facts may be curated |
| `media` | Private/Admin initially | No | Selected media can move to public draft |
| `private_documents` | Private | No | Link as verification evidence, never public |
| `consent_to_contact` | Sensitive/Admin | Yes | No — retain as consent record |
| `submission_status` | Admin | Yes | No |

## 18.2 Submission workflow

Recommended flow:

`received → contacted → information_pending → draft_created → under_review → converted_to_property → closed`

The converted property should retain `source_submission_id` so the brokerage team can trace the origin.

---

# 19. Lead / CRM Data

The land property model should expose only the minimum relation points needed by the CRM.

## 19.1 Buyer requirement object

Recommended fields:

- `lead_id`
- `land_category`
- `transaction_intent`
- `location_preferences`
- `budget_min`
- `budget_max`
- `budget_basis`
- `area_min`
- `area_max`
- `area_unit`
- `preferred_land_use`
- `required_access_features`
- `required_utilities`
- `lead_source`
- `created_at`
- `status`

## 19.2 Property-to-lead relation

Use a separate match/shortlist relation rather than embedding buyer details in the property.

Possible fields:

- `lead_id`
- `property_id`
- `match_reason`
- `match_score`
- `presented_at`
- `interest_status`

Do not make the land-domain report the full CRM specification.

---

# 20. Search / Filter Field Matrix

The following is the conservative V1 matrix.

| Field | Agricultural | NA | Industrial | Public Display | Searchable | Filterable | Sortable |
|---|---:|---:|---:|---:|---:|---:|---:|
| Land category | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Transaction intent | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Availability status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| District | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Taluka | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Village/locality | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Planning authority | Optional | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| TP scheme | Optional | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| GIDC estate | No | Optional | ✓ | ✓ | ✓ | ✓ | No |
| Survey/block number | ✓ | ✓ | ✓ | Optional | ✓ | Optional | No |
| Area normalized sqm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Display area/unit | ✓ | ✓ | ✓ | ✓ | ✓ | No | No |
| Price total | ✓ | ✓ | ✓ | ✓ | No | ✓ | ✓ |
| Price unit basis | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| Negotiable | ✓ | ✓ | ✓ | ✓ | No | ✓ | No |
| Road touch | ✓ | ✓ | ✓ | ✓ | No | ✓ | No |
| Road width | ✓ | ✓ | ✓ | ✓ | No | ✓ | ✓ |
| Frontage | ✓ | ✓ | ✓ | ✓ | No | ✓ | ✓ |
| Irrigation | ✓ | No | No | ✓ | No | ✓ | No |
| Borewell | ✓ | No | No | ✓ | No | ✓ | No |
| Electricity | ✓ | ✓ | ✓ | ✓ | No | ✓ | No |
| Orchard | ✓ | No | No | ✓ | No | ✓ | No |
| Farmhouse/structure | ✓ | No | No | ✓ | No | ✓ | No |
| NA status | No | ✓ | Optional | ✓ | ✓ | ✓ | No |
| NA purpose | No | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| DP zone | No | ✓ | ✓ | ✓ | ✓ | ✓ | No |
| OP/FP | No | ✓ | Optional | ✓ | ✓ | No | No |
| Corner plot | No | ✓ | ✓ | ✓ | No | ✓ | No |
| FSI/FAR | No | ✓ | Optional | Summary | No | ✓ | ✓ |
| Layout approval | No | ✓ | Optional | Summary | No | ✓ | No |
| Industrial subtype | No | Optional | ✓ | ✓ | ✓ | ✓ | No |
| Lease tenure type | No | Optional | ✓ | ✓ | ✓ | ✓ | No |
| Lease end date | No | Optional | ✓ | ✓ | No | ✓ | ✓ |
| Existing shed | No | Optional | ✓ | ✓ | No | ✓ | No |
| Shed area | No | Optional | ✓ | ✓ | No | ✓ | ✓ |
| Truck access | No | Optional | ✓ | ✓ | No | ✓ | No |
| Power load | No | No | ✓ | ✓ | No | ✓ | ✓ |
| CETP/ETP | No | No | ✓ | ✓ | No | ✓ | No |
| Highway distance | ✓ | ✓ | ✓ | ✓ | No | ✓ | ✓ |
| Published date | ✓ | ✓ | ✓ | No/derived | No | Optional | ✓ |

### Index/search guidance

Likely high-value database/search indexes include:

- category + publication + availability
- geography references + category
- normalized area
- total price / price basis
- locality search text
- transaction intent
- industrial estate
- TP scheme / planning authority
- key boolean/enum attributes such as road touch, irrigation, corner plot, existing shed

Avoid indexing every flexible attribute blindly.

---

# 21. Required vs Optional

## 21.1 Agricultural — Minimum Draft Data

A draft should be creatable with:

- category
- transaction intent
- broad location
- approximate area + unit
- source/contact
- optional price
- optional media

## 21.2 Agricultural — Minimum Publishable Data

Recommended publish gate:

- valid category
- transaction intent
- district/taluka/village or safe locality
- area + declared unit
- public price mode
- availability status
- public-safe location behavior set
- at least one approved cover image or approved media where appropriate
- description
- owner/source relationship internally recorded
- required verification review started/completed according to UrbanEdge policy
- no unresolved high-risk internal flag that policy says blocks publication

### Strongly recommended agricultural publication facts

- survey/block where available
- road/access information
- irrigation summary where claimed
- key tenure status if UrbanEdge elects to show it
- verification date/summary

## 21.3 NA — Minimum Draft Data

- category
- transaction intent
- location
- area
- source
- optional price

## 21.4 NA — Minimum Publishable Data

- location
- area
- price or On Request
- NA status
- NA purpose where represented as NA
- planning context where available
- access/road summary
- public-safe location
- media
- verification state appropriate to the claim level

## 21.5 Industrial — Minimum Draft Data

- category
- subtype if known
- location
- area
- source/contact
- optional price

## 21.6 Industrial — Minimum Publishable Data

- industrial subtype
- estate/planning context where applicable
- area
- price/rent/lease terms
- access/road
- basic permitted use summary
- core industrial site features that are being advertised
- availability
- public-safe location
- approved media

## 21.7 Publish validation philosophy

A publish gate should answer:

> “Do we have enough information to publish this listing without misleading the customer or exposing private information?”

It should not try to answer:

> “Is this property legally perfect in every respect?”

That second question belongs to detailed professional due diligence.

---

# 22. Data Flexibility Strategy

## 22.1 Option comparison

| Architecture | Strength | Weakness | Recommendation |
|---|---|---|---|
| One wide table | Simple reads | Becomes sparse/rigid; category changes painful | **Not recommended** |
| Pure JSONB | Flexible | Weak filtering/integrity; harder analytics/search | **Not recommended as core model** |
| Pure EAV | Highly flexible | Difficult queries, validation and reporting | **Not recommended** |
| Hybrid | Strong core + flexible category extension | More deliberate schema design | **Recommended** |

## 22.2 Recommended hybrid

### Strong typed columns

Use typed columns for:

- property identity
- category
- transaction
- publication/availability
- geography relations
- area/pricing primitives
- core identifiers
- privacy coordinates
- commonly filtered physical facts
- GIDC/TP/planning relations
- timestamps

### Flexible category attributes

Use configurable attributes for things such as:

- soil subtypes
- crop types
- specialized industrial features
- unusual utility types
- future category-specific fields
- regional vocabulary

### Evidence/verification tables

Use separate relational data for:

- documents
- verification checks
- evidence
- reviewer actions
- source/version metadata

## 22.3 Why hybrid is the best fit

Land brokerage needs both **search performance** and **domain flexibility**. A customer expects queries like:

> “Show agricultural land in Gandhinagar district, under ₹X, above Y acres, road touch, with irrigation.”

Those are first-class typed predicates.

But the business may later want:

> “Has drip irrigation?”
> “Fruit orchard variety?”
> “Container truck turning radius?”
> “Specific industrial utility?”

Those are better handled by category attributes when they are not yet stable enough to justify permanent columns.

---

# 23. Future Gujarat / India Considerations

## 23.1 Gujarat Core

Fields/concepts that should exist in the Gujarat-enabled data model:

- VF-6
- VF-7 / “7/12” alias
- VF-8A
- property card/city survey
- survey/hissa/block
- Sarat/tenure attributes
- section 65/65A/65B references where applicable
- section 63/43/73AA-related workflow references where relevant to a property review
- TP scheme / OP / FP
- AUDA/GUDA/other planning authority
- GIDC estate
- Gujarat-specific local unit display support

These are Gujarat extension concepts; they should not become assumptions in the universal property table.

## 23.2 Region-Specific Extension

Other Indian states may use different:

- revenue form numbers
- survey/plot naming
- land tenure labels
- planning systems
- land measurement units
- registration-record terminology
- industrial-estate systems
- land-use-permission procedures

The model should therefore support:

`jurisdiction → record_system → record_type → source_reference`

rather than hard-coding every record type into the core property table.

## 23.3 ULPIN/Bhu-Aadhaar future-proofing

The Department of Land Resources describes ULPIN/Bhu-Aadhaar as a unique land-parcel identifier based on parcel geometry/coordinates and states Gujarat is among the states where ULPIN has been implemented. [S13]

UrbanEdge should reserve a field such as:

- `ulpin`
- `ulpin_source`
- `ulpin_status`

but should not make it a V1 publication requirement. Not every inventory source will provide it, and the marketplace should not manufacture it.

## 23.4 Current modernization direction

The Government of India's current DILRMP material emphasizes computerized RoRs, digitized cadastral maps, their linkage, registration integration and geo-referencing; DILRMP 3.0 operational guidelines are listed for 2026–2031. [S14][S23]

This supports keeping the architecture ready for:

- parcel geometry
- source-system IDs
- spatial data versioning
- record linkage
- future cross-state land-record integration

without making any single state's record format the universal database shape.

---

# 24. Terminology Glossary

| Term | Meaning / practical meaning | Product treatment |
|---|---|---|
| **7/12** | Common marketplace name for the rural land-record extract historically combining Form 7 and Form 12; Gujarat's current system separates Form 7 and Form 12. [S2] | Store `vf7` and crop/Form 12 separately; UI may say “7/12” for familiarity. |
| **VF-7** | Village Form 7; Gujarat revenue record containing survey/area/holder/tenure/rights-related information. [S2] | Core verification record type. |
| **Form 12** | Current separate crop/cultivation record covering season, crop, area, irrigation/tree information. [S2] | Optional agricultural details/evidence. |
| **VF-8A** | Revenue/land-record account/holding record exposed by e-Dhara as VF-8A. [S3] | Verification/reference; UI label may be “Khata details”. |
| **VF-6** | Mutation/entry register within the record-of-rights framework. [S2][S19] | Verification evidence/history reference. |
| **Mutation Entry** | Revenue-record entry reflecting an acquisition/change of rights or related event under the prescribed process. Gujarat Land Revenue Code contains sections 135C/135D governing reporting/entry workflow. [S19] | Track as an evidence/history relation; not merely a boolean. |
| **Survey Number** | Parcel identifier created/used in revenue survey records. [S18] | Core external identifier. |
| **Hissa / Subdivision** | Subdivision/share reference associated with a survey number where applicable. | Optional identifier relation. |
| **Block Number** | Another land/parcel identifier used in Gujarat contexts; also appears in city-survey/property-record formats. [S9] | Separate from survey number. |
| **Sarat / Tenure** | Conditions/classification governing land holding and transfers; Gujarat sources distinguish old/new/restricted tenure and related permissions/premiums. [S7][S8] | Structured attribute + evidence, not “freehold yes/no”. |
| **Juni Sarat** | “Old tenure” marketplace/administrative terminology referring to an older tenure condition. Gujarat sources distinguish old tenure from new/restricted tenure in revenue records and applications. [S7][S8] | Store normalized `old_tenure` only when source supports it. |
| **Navi Sarat** | “New tenure” terminology used in Gujarat revenue administration. New-tenure and indivisible-tenure permissions are explicitly represented in current iORA services. [S7] | Store as a source-backed tenure value; do not infer unrestricted transferability. |
| **Restricted tenure** | A tenure/holding condition subject to restrictions/permissions under applicable law/policy. [S7][S8] | Admin/verification attribute; never a simplistic public “not saleable” label. |
| **NA** | Non-agricultural use/status. Gujarat Revenue Department materials describe statutory permissions under section 65 and related provisions. [S8][S20] | Store status + purpose + permission evidence. |
| **Section 65** | Gujarat Land Revenue Code provision concerning uses by an occupant of land for agriculture and procedure for other purpose/NA permission. [S20] | Legal reference field; not legal-advice engine. |
| **Section 65A** | Procedure when an occupant wishes to change one non-agricultural purpose to another. [S20] | Verification/legal-context field. |
| **Section 65B** | Gujarat Land Revenue Code provision concerning use of certain lands for bona fide industrial purpose under specified conditions. [S20] | Industrial verification field where applicable. |
| **Section 43 (Tenancy Act context)** | Gujarat Revenue Department iORA lists applications for permission/premium under section 43 of the Gujarat tenancy law. [S7] | Store only when a reviewed workflow/document actually invokes it. |
| **Section 63** | Gujarat Revenue Department iORA lists permission for purchase of agricultural land under section 63 in relevant tenancy-law context. [S7] | Buyer-eligibility/legal workflow; not a universal property flag. |
| **Section 73AA** | Gujarat Land Revenue Code provision concerning restrictions on transfer of tribal occupancies to tribal/non-tribal persons. [S20] | High-sensitivity legal review area; do not make casual public claims. |
| **TP** | Town Planning scheme/planning context. AUDA provides TP scheme lists and data by scheme and area/village. [S4] | Separate planning dimension. |
| **OP** | Original Plot reference in a TP scheme context. | Structured planning identifier. |
| **FP** | Final Plot reference in a TP scheme context. | Structured planning identifier. |
| **FSI/FAR** | Development-control ratio relating floor area to plot area; exact permitted value is planning-source dependent. | Store source-backed value and effective date; do not promise development potential. |
| **Property Card** | Urban/city-survey land record; Gujarat sources use city-survey/property-card forms and registers. [S9] | Urban verification record type. |
| **City Survey** | Urban survey/recording system distinct from rural VF records. [S9][S18] | Separate record-system dimension. |
| **Index-2** | Registration-related record/copy available through Gujarat Revenue/iORA services. [S7] | Verification evidence; not the same entity as property card or VF-7. |
| **Mapni** | Measurement/survey activity; Gujarat's services include measurement applications for survey boundaries/hissa/parts. [S7] | Verification status/evidence. |
| **GIDC** | Gujarat Industrial Development Corporation. GIDC operates industrial-estate/allotment/transfer/planning/utility systems. [S10][S11] | Separate industrial authority/entity relation. |
| **GIDC leasehold** | GIDC FAQ states estate land is allotted on leasehold basis, with 99-year lease and potential renewal under the stated policy. [S10] | Industrial tenure attribute; exact transaction requires source review. |
| **ULPIN / Bhu-Aadhaar** | National unique land-parcel identifier based on parcel geometry/coordinates as described by DoLR. [S13] | Future-ready external identifier. |
| **Jantri** | Gujarat government reference-value/rate system associated with registration/revenue processes. | Store as separate government-reference valuation, never market price. |

---

# 25. Final Recommended Data Dictionary

## 25.1 Common Property

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `property_id` | Property ID | Identifier | Yes | Admin | Yes | Platform identifier. |
| `public_slug` | Public URL | String | Publish | Public | No | SEO. |
| `land_category` | Land Category | Enum | Yes | Public | Yes | AG/NA/IN. |
| `transaction_intent` | Transaction | Enum/set | Yes | Public | Yes | Buy/rent/lease. |
| `listing_title` | Listing Title | String | Publish | Public | No | Editorial. |
| `short_description` | Short Description | Text | Publish | Public | No | Editorial. |
| `description` | Description | Text | Publish | Public | No | Editorial. |
| `publication_status` | Publication | Enum | Yes | Admin | Yes | Lifecycle. |
| `availability_status` | Availability | Enum | Yes | Public/Admin | Yes | Commercial state. |
| `primary_location_id` | Location | Relation | Publish | Public/Admin | Yes | Normalized geography. |
| `locality_label` | Locality | String | Publish recommended | Public | Yes | Marketplace geography. |
| `public_address` | Public Location | Text | Publish | Public | No | Safe location only. |
| `location_precision` | Location Precision | Enum | Yes | Admin | Yes | Exact/Approx/Hidden. |
| `public_latitude` | Public Latitude | Decimal | No | Public | No | Separate from private coordinates. |
| `public_longitude` | Public Longitude | Decimal | No | Public | No | Separate from private coordinates. |
| `private_latitude` | Private Latitude | Decimal | No | Private | No | Never public API. |
| `private_longitude` | Private Longitude | Decimal | No | Private | No | Never public API. |
| `area_display_value` | Area | Decimal | Recommended | Public | Yes | User-facing declared area. |
| `area_display_unit` | Area Unit | Enum | Recommended | Public | Yes | Unit-aware. |
| `area_sqm` | Normalized Area | Decimal | No | Admin/derived public | Yes | Only authoritative conversion. |
| `area_conversion_status` | Area Conversion Status | Enum | No | Admin | No | authoritative/source_declared/provisional/unknown. |
| `area_source` | Area Source | Enum/text | No | Admin | No | Provenance. |
| `price_mode` | Price | Enum | Yes | Public | Yes | Exact/range/on-request. |
| `price_min` | Price Min | Money | Conditional | Public/Admin | Yes | Numeric. |
| `price_max` | Price Max | Money | Conditional | Public/Admin | Yes | Numeric. |
| `price_basis` | Price Basis | Enum | Conditional | Public | Yes | Total/per-unit. |
| `price_unit` | Price Unit | Enum | Conditional | Public | Yes | Used when per-unit. |
| `price_currency` | Currency | Currency | Yes | Public | No | INR at launch. |
| `price_negotiable` | Negotiable | Boolean | No | Public | Yes | Marketplace fact. |
| `lease_rent_amount` | Rent/Lease Amount | Money | Conditional | Public | Yes | Separate commercial rate. |
| `lease_rent_period` | Rent Period | Enum | Conditional | Public | Yes | Month/year/etc. |
| `security_deposit_amount` | Security Deposit | Money | No | Public/Admin | Yes | When relevant. |
| `road_touch` | Road Touch | Enum | No | Public | Yes | Direct/approach/etc. |
| `road_width_value` | Road Width | Decimal | No | Public | Yes | Source-backed. |
| `road_width_unit` | Road Width Unit | Enum | No | Public | No | Usually m/ft. |
| `frontage_value` | Frontage | Decimal | No | Public | Yes | Source-backed. |
| `frontage_unit` | Frontage Unit | Enum | No | Public | No | Usually m/ft. |
| `seo_title` | SEO Title | String | Publish recommended | Public | No | Editorial. |
| `seo_description` | SEO Description | String | No | Public | No | Editorial. |
| `created_at` | Created At | Timestamp | Yes | Admin | No | System. |
| `updated_at` | Updated At | Timestamp | Yes | Admin | No | System. |
| `published_at` | Published At | Timestamp | No | Admin | No | System. |
| `last_verified_at` | Last Verified | Timestamp | No | Admin/public summary | Yes | Derived from verification. |

## 25.2 Agricultural

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `survey_number` | Survey No. | String | Recommended | Public/Admin | Yes | Preserve source formatting. |
| `hissa_number` | Hissa No. | String | No | Public/Admin | Yes | Where applicable. |
| `block_number` | Block No. | String | No | Public/Admin | Yes | Where applicable. |
| `tenure_type` | Tenure | Enum | No | Admin/public summary | Yes | old/new/restricted/etc. only if source-backed. |
| `vf7_reference` | VF-7 Record | Relation/ref | No | Verification | No | Private evidence. |
| `vf8a_reference` | VF-8A Record | Relation/ref | No | Verification | No | Private evidence. |
| `vf6_entry_reference` | Mutation Entry | Relation/ref set | No | Verification | No | History/evidence. |
| `agricultural_use_status` | Agricultural Use | Enum | No | Public | Yes | Current/declared use. |
| `soil_type` | Soil Type | Flexible | No | Public | Yes | Source-backed. |
| `irrigation_status` | Irrigation | Enum | No | Public | Yes | Irrigated/rainfed/mixed. |
| `irrigation_source_type` | Water Source | Multi-select | No | Public | Yes | Borewell/well/canal/etc. |
| `borewell_count` | Borewells | Integer | No | Public/Admin | Yes | Only where relevant. |
| `well_count` | Wells | Integer | No | Public/Admin | Yes | Only where relevant. |
| `electricity_available` | Electricity | Enum | No | Public | Yes | On-site/nearby/unknown. |
| `current_crops` | Crops | Multi-select | No | Public | Yes | Marketing/cultivation info. |
| `orchard_present` | Orchard | Boolean | No | Public | Yes | High-value feature. |
| `orchard_type` | Orchard Type | Flexible | No | Public | Yes | Optional. |
| `fencing_status` | Fencing | Enum | No | Public | Yes | Physical only. |
| `topography` | Topography | Enum | No | Public | Yes | Physical descriptor. |
| `land_shape` | Land Shape | Enum | No | Public | Yes | Regular/irregular/etc. |
| `structure_present` | Existing Structure | Boolean | No | Public | Yes | Farmhouse/shed etc. |
| `structure_type` | Structure Type | Multi-select | No | Public | Yes | Optional. |
| `built_structure_area` | Structure Area | Decimal | No | Public/Admin | Yes | Source-backed. |
| `right_of_way_claim` | Access / ROW | Enum | No | Admin/public summary | Yes internally | Legal review required. |
| `boundary_summary` | Boundaries | Structured text | No | Public/Admin | No | Avoid unnecessary sensitive adjacency detail. |
| `survey_mapni_status` | Survey/Mapni Status | Enum | No | Admin/public summary | Yes internally | Measurement evidence. |

## 25.3 NA

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `na_status` | NA Status | Enum | Recommended | Public/Admin | Yes | Not NA/NA/applied/unknown. |
| `na_use_purpose` | NA Purpose | Enum | Conditional | Public | Yes | Residential/commercial/industrial/mixed/other. |
| `na_use_purpose_detail` | Permitted Use Detail | Flexible | No | Public/Admin | Yes | Source-backed. |
| `na_section_reference` | NA Section Reference | String | No | Admin/public summary | No | Legal source. |
| `na_order_number` | NA Order No. | String | No | Verification/Admin | No | Source reference. |
| `na_order_date` | NA Order Date | Date | No | Admin/public | Yes | Useful timeline. |
| `planning_authority_id` | Planning Authority | Relation | Recommended | Public | Yes | AUDA/GUDA/etc. |
| `development_plan_zone` | DP Zone | String/Enum | No | Public/Admin | Yes | Source-backed. |
| `tp_scheme_id` | TP Scheme | Relation | No | Public | Yes | Separate planning entity. |
| `op_number` | OP No. | String | No | Public/Admin | Yes | When applicable. |
| `fp_number` | FP No. | String | No | Public/Admin | Yes | When applicable. |
| `plot_number` | Plot No. | String | No | Public/Admin | Yes | Planning/property context. |
| `plot_length` | Plot Length | Decimal | No | Public | Yes | Source-backed. |
| `plot_width` | Plot Width | Decimal | No | Public | Yes | Source-backed. |
| `plot_dimension_unit` | Dimension Unit | Enum | No | Public | No | m/ft. |
| `corner_plot` | Corner Plot | Boolean | No | Public | Yes | Useful filter. |
| `fsi_far_claim` | FSI/FAR | Decimal/text | No | Admin/public summary | Yes | Effective/source date needed. |
| `layout_approval_status` | Layout Approval | Enum | No | Public/Admin | Yes | Source-backed. |
| `water_available` | Water | Enum | No | Public | Yes | Site/nearby/unknown. |
| `drainage_available` | Drainage | Enum | No | Public | Yes | Practical feature. |
| `electricity_available` | Electricity | Enum | No | Public | Yes | Practical feature. |
| `development_restrictions_summary` | Development Restrictions | Text | No | Public summary/Admin | No | High care required. |

## 25.4 Industrial

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `industrial_land_subtype` | Industrial Type | Enum | Recommended | Public | Yes | GIDC/private estate/private etc. |
| `gidc_estate_id` | GIDC Estate | Relation | GIDC only | Public | Yes | GIDC-specific. |
| `gidc_plot_number` | GIDC Plot/Shed No. | String | GIDC only | Public/Admin | Yes | Distinct from survey number. |
| `industrial_tenure_type` | Industrial Tenure | Enum | Recommended | Public | Yes | Leasehold/freehold/etc. |
| `lease_start_date` | Lease Start | Date | Conditional | Admin/public summary | Yes | Contract fact. |
| `lease_end_date` | Lease End | Date | Conditional | Public/Admin | Yes | Contract fact. |
| `transfer_status` | Transfer Status | Enum | No | Admin/public summary | Yes | Permission workflow may apply. |
| `allotment_status` | Allotment Status | Enum | No | Public/Admin | Yes | GIDC/estate context. |
| `permitted_industrial_use` | Permitted Industrial Use | Text/Enum | Recommended | Public | Yes | Source-backed. |
| `zoning_designation` | Zoning | String/Enum | No | Public/Admin | Yes | Planning source. |
| `existing_shed_present` | Existing Shed | Boolean | No | Public | Yes | Strong filter. |
| `shed_built_up_area` | Shed Area | Decimal | No | Public | Yes | Unit-aware. |
| `open_yard_area` | Open Yard Area | Decimal | No | Public | Yes | Unit-aware. |
| `shed_height` | Shed Height | Decimal | No | Public | Yes | Include height definition. |
| `shed_height_type` | Height Type | Enum | No | Public | No | Clear/eaves/ridge. |
| `crane_provision` | Crane | Enum | No | Public | Yes | Installed/provision/none. |
| `road_width_value` | Road Width | Decimal | No | Public | Yes | Logistics feature. |
| `truck_access` | Truck Access | Enum | No | Public | Yes | Logistics feature. |
| `loading_unloading_area` | Loading/Unloading | Enum | No | Public | Yes | Logistics feature. |
| `power_available` | Power | Enum | No | Public | Yes | Source-backed. |
| `sanctioned_load` | Sanctioned Load | Decimal | No | Public/Admin | Yes | High-value industrial field. |
| `transformer_present` | Transformer | Enum | No | Public | Yes | Dedicated/shared/none. |
| `water_availability` | Water | Enum | No | Public | Yes | Practical feature. |
| `drainage_available` | Drainage | Enum | No | Public | Yes | Practical feature. |
| `cetp_available` | CETP | Enum | No | Public | Yes | Only where relevant. |
| `etp_present` | ETP | Enum | No | Public/Admin | Yes | Property feature, not compliance system. |
| `gas_available` | Gas | Enum | No | Public | Yes | Practical feature. |
| `pollution_category` | Pollution Category | Enum/Text | No | Public/Admin | Yes | Only where applicable. |
| `highway_distance_km` | Highway Distance | Decimal | No | Public | Yes | Derived. |
| `rail_distance_km` | Rail Distance | Decimal | No | Public | Yes | Derived. |
| `port_distance_km` | Port Distance | Decimal | No | Public | Yes | Derived where relevant. |
| `airport_distance_km` | Airport Distance | Decimal | No | Public | Yes | Derived. |

## 25.5 Pricing

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `price_mode` | Price Mode | Enum | Yes | Public | Yes | Exact/range/on-request. |
| `price_min` | Minimum Price | Money | Conditional | Public/Admin | Yes | Numeric. |
| `price_max` | Maximum Price | Money | Conditional | Public/Admin | Yes | Numeric. |
| `price_basis` | Price Basis | Enum | Conditional | Public | Yes | Total/per-unit. |
| `price_unit` | Pricing Unit | Enum | Conditional | Public | Yes | Must have unit when per-unit. |
| `price_currency` | Currency | Enum | Yes | Public | No | INR launch. |
| `price_negotiable` | Negotiable | Boolean | No | Public | Yes | Optional. |
| `price_source` | Price Source | Enum | No | Admin | No | Provenance. |
| `price_as_of` | Price As Of | Date | No | Admin | Yes | Useful operationally. |
| `government_reference_value` | Government Reference Value | Money | No | Admin | Yes | Separate from asking price. |
| `government_reference_value_unit` | Government Reference Unit | Enum | No | Admin | Yes | Unit-aware. |
| `government_reference_source` | Government Reference Source | String | No | Admin | No | Jantri/GIDC etc. |
| `government_reference_as_of` | Reference Date | Date | No | Admin | Yes | Version/date. |
| `lease_rent_amount` | Rent/Lease Amount | Money | Conditional | Public | Yes | Separate from sale price. |
| `lease_rent_period` | Rent Period | Enum | Conditional | Public | Yes | Month/year/etc. |
| `security_deposit_amount` | Security Deposit | Money | No | Public/Admin | Yes | Where relevant. |

## 25.6 Geography

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `country_id` | Country | Relation | Yes | Public | Yes | India launch. |
| `state_id` | State | Relation | Yes | Public | Yes | Gujarat launch. |
| `district_id` | District | Relation | Yes | Public | Yes | Official ref data. |
| `taluka_id` | Taluka/Subdistrict | Relation | Recommended | Public | Yes | Revenue/admin dimension. |
| `village_id` | Village/Town/City | Relation | Recommended | Public | Yes | Administrative/reference geography. |
| `locality_id` | Locality | Relation | No | Public | Yes | Marketplace geography. |
| `ward_id` | Ward | Relation | No | Public/Admin | Yes | Where applicable. |
| `pin_code` | PIN Code | String/relation | Recommended | Public | Yes | Postal dimension. |
| `planning_authority_id` | Planning Authority | Relation | No | Public | Yes | Separate hierarchy. |
| `tp_scheme_id` | TP Scheme | Relation | No | Public | Yes | Separate dimension. |
| `gidc_estate_id` | GIDC Estate | Relation | No | Public | Yes | Industrial dimension. |
| `city_survey_number` | City Survey No. | String | No | Admin/public | Yes | Urban property-card context. |
| `survey_number` | Survey No. | String | No | Admin/public | Yes | Parcel identifier. |
| `block_number` | Block No. | String | No | Admin/public | Yes | Parcel identifier. |
| `op_number` | OP No. | String | No | Public/Admin | Yes | TP context. |
| `fp_number` | FP No. | String | No | Public/Admin | Yes | TP context. |
| `ulpin` | ULPIN/Bhu-Aadhaar | String | Future | Admin/public summary | Yes | External national ID, when available. |

## 25.7 Media

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `media_id` | Media ID | Identifier | Yes | Admin | No | Separate entity. |
| `media_type` | Media Type | Enum | Yes | Public/Admin | Yes | Image/video/drone/brochure/360. |
| `source_type` | Source | Enum | Yes | Admin | No | Upload/external/etc. |
| `storage_path` | Storage Path | String | No | Private/Admin | No | Not public. |
| `external_url` | External URL | URL | No | Public | No | Only approved URLs. |
| `sort_order` | Sort Order | Integer | Yes | Admin | No | Presentation. |
| `is_cover` | Cover | Boolean | No | Admin/public derived | No | One cover. |
| `alt_text` | Alt Text | String | Recommended | Public | No | Accessibility/SEO. |
| `caption` | Caption | String | No | Public | No | Editorial. |
| `visibility` | Visibility | Enum | Yes | Admin | Yes | Public/private/draft. |
| `uploaded_at` | Uploaded At | Timestamp | Yes | Admin | No | System. |

## 25.8 Verification

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `verification_id` | Verification ID | Identifier | Yes | Admin | No | Separate entity. |
| `verification_scope` | Verification Scope | Enum | Yes | Admin/public summary | Yes | Identity/ownership/physical/NA/industrial/planning/legal. |
| `verification_status` | Verification Status | Enum | Yes | Admin/public summary | Yes | Not-started to passed/fail. |
| `reviewer_id` | Reviewer | Relation | No | Admin | No | Never public. |
| `reviewed_at` | Reviewed At | Timestamp | No | Admin/public summary | Yes | Summary only. |
| `risk_level` | Risk Level | Enum | No | Admin | Yes | Internal triage. |
| `public_verification_note` | Verification Summary | Text | No | Public | No | Curated. |
| `evidence_id` | Evidence | Relation | No | Verification evidence | No | Private. |
| `evidence_type` | Evidence Type | Enum | No | Admin | No | Record/document/map/etc. |
| `review_notes` | Reviewer Notes | Text | No | Admin | No | Sensitive operational data. |

## 25.9 Owner Submission

| Machine name | Display label | Type | Required | Visibility | Filterable | Notes |
|---|---|---|---|---|---|---|
| `submission_id` | Submission ID | Identifier | Yes | Admin | No | Intake object. |
| `owner_name` | Owner Name | String | Yes | Private/Admin | No | Not public by default. |
| `owner_phone` | Phone | String | Yes | Private/Admin | No | CRM source data. |
| `owner_email` | Email | String | No | Private/Admin | No | Optional. |
| `transaction_intent` | Intent | Enum | Yes | Admin | Yes | Buy/rent/lease. |
| `land_category` | Land Category | Enum | Yes | Admin | Yes | Category. |
| `location_text` | Location | Text | Yes | Admin/public after conversion | Yes | Draft source value. |
| `area_display_value` | Area | Decimal | Yes | Admin | Yes | Owner-declared. |
| `area_display_unit` | Unit | Enum | Yes | Admin | Yes | Owner-declared. |
| `expected_price` | Expected Price | Money | No | Admin | Yes | Draft. |
| `notes` | Owner Notes | Text | No | Private/Admin | No | May contain sensitive content. |
| `consent_to_contact` | Contact Consent | Boolean/timestamp | Yes | Admin | No | Store evidence/time. |
| `submission_status` | Submission Status | Enum | Yes | Admin | Yes | Workflow. |
| `source_submission_id` | Source Submission | Relation | No | Admin | No | Traceability on conversion. |

## 25.10 Internal/Admin

| Machine name | Display label | Type | Required | Visibility | Notes |
|---|---|---|---|---|---|
| `source_type` | Source Type | Enum | Yes | Admin | Owner/broker/developer/institutional/internal. |
| `assigned_broker_id` | Assigned Broker | Relation | No | Admin | Brokerage workflow. |
| `lead_source` | Lead Source | Enum/text | No | Admin | CRM integration. |
| `internal_notes` | Internal Notes | Text | No | Admin | Never public. |
| `internal_risk_flags` | Risk Flags | Set | No | Admin | Triage only. |
| `publication_checklist_status` | Publication Checklist | Enum | No | Admin | Derived from validations. |
| `created_by` | Created By | Relation | Yes | Admin | Audit. |
| `updated_by` | Updated By | Relation | Yes | Admin | Audit. |
| `archived_at` | Archived At | Timestamp | No | Admin | System. |

---

# 26. Fields Not to Collect

The following should **not** become default V1 property fields merely because they appear in government documents or due-diligence workflows.

## 26.1 Unnecessary or excessive owner identity data

Do not routinely collect:

- Aadhaar number.
- Passport details.
- Full copies of identity documents unless a defined workflow/legal requirement exists.
- Family member identity details.
- Bank-account numbers.
- Tax identifiers unless an actual transaction/compliance workflow needs them.

Store the minimum evidence needed for the business process, with appropriate access control.

## 26.2 Private operational information that does not improve discovery

Do not expose or index publicly:

- owner personal phone/email
- broker commission notes
- source-agent names
- confidential negotiation notes
- internal valuation notes
- private map coordinates
- internal risk scoring
- legal reviewer comments

## 26.3 Derived fields that should not be manually maintained

Prefer deriving:

- canonical URL
- display currency symbol
- price display formatting
- normalized sqm area when conversion is authoritative
- distance to highway/airport/rail where calculated from a known routing source
- “featured” ordering where it is purely editorial
- `last_verified_at` from verification records

## 26.4 Misleading fields to avoid

Avoid generic fields such as:

- `legal = true`
- `clear_title = true`
- `freehold = true` for all private land
- `approved = true` without defining what approval means
- `developable = true`
- `bank_loan_possible = true`
- `NA = true` based only on a marketing claim

Instead, use scoped statuses and source-backed evidence.

## 26.5 Compliance information out of V1 scope

Do not turn UrbanEdge Land Space V1 into a factory/building compliance platform. Detailed fire safety, pollution compliance, labour registrations, equipment certifications and similar operational permits belong in a future specialist module when a business requirement justifies them.

## 26.6 Government-document bloat

Do not mirror every field from VF-7, property cards, GIDC forms or planning documents. Store the **source document itself + key structured facts needed by the product + verification outcome**.

This preserves evidence without importing an entire government record schema into the marketplace.

---

# 27. FINAL SOFTWARE HANDOFF

# RECOMMENDED URBANEDGE LAND SPACE DATA MODEL — V1

## 27.1 Universal typed core

Every listing should have:

- platform property ID
- land category
- transaction intent
- publication status
- availability status
- normalized geography relation
- public-safe location strategy
- area value + declared unit
- normalized sqm where authoritative
- price mode + numeric price fields
- transaction/rent/lease terms
- public title/description
- media relation
- source relation
- timestamps

## 27.2 Agricultural core

Add:

- survey/hissa/block
- tenure category/status
- VF-7/VF-8A/VF-6 references
- agricultural-use status
- irrigation/source
- borewell/well/canal where material
- electricity
- crops/orchard
- fencing
- topography
- land shape
- structures
- access/road-touch
- survey/mapni verification status

## 27.3 NA core

Add:

- NA status
- NA purpose
- section/order reference where applicable
- survey/block/plot
- planning authority
- DP zone
- TP/OP/FP
- plot dimensions
- frontage/road width
- corner plot
- FSI/FAR source-backed field
- layout approval status
- water/electricity/drainage
- restriction summary

## 27.4 Industrial core

Add:

- industrial subtype
- GIDC estate relation where applicable
- GIDC plot/shed number
- industrial tenure
- lease dates where applicable
- allotment/possession/transfer status
- permitted industrial use
- zoning
- existing shed
- shed/open area
- height
- crane provision
- road/truck/loading
- power/sanctioned load/transformer
- water/drainage/CETP/ETP/gas
- selected environmental/approval summaries where useful
- highway/rail/port/airport distances

## 27.5 Units

Primary normalized unit:

**square metre**

Public V1 units:

**sq ft, sq yd, sq m, var, guntha, acre, hectare, bigha, vigha**

Local-unit conversion must be region/source controlled.

## 27.6 Geography

Core:

**country → state → district → taluka/subdistrict → village/town/city**

Separate:

**locality, ward, planning authority, TP scheme, OP/FP, GIDC estate, survey/block/city-survey references**

## 27.7 Flexible attributes

Use category-specific configurable attributes for:

- specialized agricultural features
- specialized industrial features
- local marketplace terminology
- emerging buyer-request fields
- future state-specific fields that are not yet stable

## 27.8 Private data

Keep separately:

- owner contact information
- exact coordinates
- private source notes
- private documents
- legal/reviewer notes
- internal commercial notes

## 27.9 Verification separation

Use separate verification entities for:

- scope
- checklist
- evidence
- reviewer
- review date
- status
- risk
- public summary

Never collapse the entire property into a single `verified` boolean.

## 27.10 Expansion principles

1. Gujarat-specific concepts must be namespace/jurisdiction aware.
2. Source-record identifiers must remain source-specific.
3. Government reference values must be versioned/date-stamped.
4. Unit conversion rules must be regional/source-specific when not universal.
5. Exact geometry must remain private unless deliberately published.
6. Planning authority and revenue geography must remain separate dimensions.
7. Property marketing data must remain separate from evidence and verification.
8. Strongly typed searchable facts belong in core columns; volatile category fields belong in a flexible attribute system.
9. All external facts should carry source/provenance where practical.
10. The model should support multiple parcels per listing when a commercial offering combines adjoining survey/plot references.

---

# Recommended Relationship Map (Conceptual — Not SQL)

```text
PROPERTY
  ├── CATEGORY (Agricultural / NA / Industrial)
  ├── TRANSACTION / PRICING
  ├── GEOGRAPHY
  │     ├── Country
  │     ├── State
  │     ├── District
  │     ├── Taluka/Subdistrict
  │     ├── Village/Town/City
  │     └── Locality / PIN / Ward
  ├── PLANNING
  │     ├── Planning Authority
  │     ├── Development Plan Zone
  │     ├── TP Scheme
  │     ├── OP
  │     └── FP
  ├── PARCEL IDENTIFIERS
  │     ├── Survey/Hissa
  │     ├── Block
  │     ├── City Survey
  │     ├── Property Card Reference
  │     ├── GIDC Plot/Shed
  │     └── ULPIN (future/when available)
  ├── CATEGORY ATTRIBUTES
  │     ├── Agricultural
  │     ├── NA
  │     └── Industrial
  ├── MEDIA
  ├── PRIVATE DOCUMENTS
  ├── VERIFICATION
  │     ├── Checklists
  │     └── Evidence
  ├── OWNER / SOURCE
  ├── OWNER SUBMISSION
  └── CRM RELATIONS
```

This structure keeps the public listing experience simple while giving the brokerage team enough domain structure for serious land transactions.

---

# 28. Research Sources

| ID | Authority / Organization | Source | URL | Updated / Published indication | Used for |
|---|---|---|---|---|---|
| **S1** | Government of Gujarat — Revenue Department | Gujarat Land Revenue Code, 1879 | https://revenuedepartment.gujarat.gov.in/downloads/act_BLRC_1879_n.pdf | Official consolidated PDF, modified to 21 Apr 2017 | Sections 65, 65A, 65B, 73AA, survey, boundaries, record of rights. |
| **S2** | Government of Gujarat — Revenue Department | Collector Manual / land-record chapters | https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf | Crawled 2026 | VF-7, Form 12, VF-6, record-of-rights, tenure/NA administration. |
| **S3** | Gujarat Informatics Limited / Government of Gujarat | e-Dhara — Land Records Online | https://gil.gujarat.gov.in/edhara | Current page crawled 2026 | VF-6, VF-7/7-12, VF-8A, e-Dhara, e-Jamin. |
| **S4** | AUDA | TP Scheme | https://www.auda.org.in/TPScheme.aspx | Page current/crawled 2026 | TP schemes, village/area relationship, planning context. |
| **S5** | Gujarat government / GIDC-hosted official CGDCR material | Comprehensive General Development Control Regulations 2017 | https://gidc.gujarat.gov.in/pdf/Circular/Circular-%20ATP%20dtd%2022.12.2017.pdf | Official notification/document | Planning authorities, development-control structure. |
| **S6** | Government of India — Department of Land Resources | API Setu metadata/data standards — area units | https://docs.apisetu.gov.in/document-central/mdds/Annexure.html | Current web documentation | Area units and local conversion principle. |
| **S7** | Government of Gujarat — Revenue Department | iORA Service | https://revenuedepartment.gujarat.gov.in/iora-service | Page current/crawled 2026 | Current revenue service/permission terminology including sections 43, 63, 65, 65A, 65B, 73AA and property-card/Index-2/EC services. |
| **S8** | Government of Gujarat — Revenue Department | Collector Manual — Chapter 16, NA Permission | https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf | Crawled 2026 | NA permission and tenure-control checks. |
| **S9** | Government of Gujarat — Revenue Department | City Survey notification/forms | https://revenuedepartment.gujarat.gov.in/downloads/notification-09052017-n.pdf | Official notification | Property Card / City Survey forms, survey/block/TP/area/property/tenure fields. |
| **S10** | GIDC | FAQs | https://gidc.gujarat.gov.in/Pages/Contents/faqs | Current page crawled 2026 | Leasehold, 99-year lease, transfer, FSI/ground coverage and services. |
| **S11** | GIDC | Allotment Price | https://gidc.gujarat.gov.in/allotmentprice | FY 2026-27 page current in 2026 | GIDC estate reference pricing/allotment context. |
| **S12** | GIDC | Applications / services | https://gidc.gujarat.gov.in/Pages/Contents/application-guiedline | Current page crawled 2026 | Transfer, plan approval, lease deed, amalgamation, subdivision, sublet/surrender workflows. |
| **S13** | Government of India — Department of Land Resources | Bhu-Aadhaar / ULPIN | https://dolr.gov.in/%E0%A4%AD%E0%A5%82-%E0%A4%86%E0%A4%A7%E0%A4%BE%E0%A4%B0-%E0%A4%B5%E0%A4%BF%E0%A4%B6%E0%A4%BF%E0%A4%B7%E0%A5%8D%E0%A4%9F-%E0%A4%AD%E0%A5%82-%E0%A4%AA%E0%A4%BE%E0%A4%B0%E0%A5%8D/ | Current page crawled 2026 | ULPIN/Bhu-Aadhaar. |
| **S14** | Government of India — Department of Land Resources | DILRMP | https://dolr.gov.in/en/programmes-schemes/dilrmp-2/ | Current page crawled 2026 | National land-record modernization, RoR, cadastral-map linkage, integration. |
| **S15** | District Gandhinagar — Government of Gujarat | Departments | https://gandhinagar.nic.in/departments/ | Last updated Jun 3, 2026 | Current Gandhinagar district authority/office context. |
| **S16** | Gandhinagar Urban Development Authority | Official GUDA property search portal | https://gudasampada.disgenservices.in/PropertySearch.aspx | Current 2026 | GUDA, TP scheme and plot-search context. |
| **S17** | Government of Gujarat — Revenue Department | Online services / document registration and Jantri context | https://revenuedepartment.gujarat.gov.in/ | Current department portal | Jantri/registration as a separate reference domain. |
| **S18** | Government of Gujarat — Revenue Department | Gujarat land records / resurvey project document | https://revenuedepartment.gujarat.gov.in/downloads/tender_guj_state_resurvey_prj_2013-14_new.pdf | Official project material | Rural/urban land records, survey numbers, maps, Tippans, Property Cards. |
| **S19** | Government of Gujarat — Revenue Department | Gujarat Land Revenue Code — Record of Rights section | https://revenuedepartment.gujarat.gov.in/downloads/act_BLRC_1879_n.pdf | Official consolidated PDF | Sections 135B–135D, mutation/record-of-rights framework. |
| **S20** | Government of Gujarat — Legislative & Parliamentary Affairs / Revenue | Gujarat Land Revenue Code section index/text | https://revenuedepartment.gujarat.gov.in/downloads/act_BLRC_1879_n.pdf | Official consolidated PDF | Legal section references used in glossary. |
| **S21** | Government legal metrology material | Metric conversions / area definitions reproduced in government revenue manual context | https://www.py.gov.in/sites/default/files/revenuemanual3part1acts.pdf | Government-hosted manual | Standard square-foot/square-yard/acre conversions. |
| **S22** | Government/archival historical land-administration material | Historical Gujarat land-measure discussion | https://ignca.gov.in/Asi_data/17325.pdf | Historical source | Caution against assuming one universal historical Gujarat Bigha. |
| **S23** | Government of India — Department of Land Resources | DILRMP 3.0 Operational Guidelines 2026–2031 | https://dolr.gov.in/en/document/operational-guidelines-for-dilrmp-3-0-2026-2031/ | Current 2026 | Future-proofing for national land-data modernization. |

---

# 29. Final Implementation Guidance for the Coding Agent

1. Build the **Property** entity around stable commercial/product facts, not around a copy of a government form.
2. Make **geography, parcel identifiers, planning, GIDC, media, documents and verification** separate related concepts.
3. Treat **area and price as unit-aware numeric structures**, never formatted strings.
4. Treat **source/provenance as first-class metadata** for important externally sourced facts.
5. Keep **exact coordinates and private documents outside public API projections**.
6. Make **publication and availability** independent state machines.
7. Do not make **legal eligibility/developability/title-clear** booleans part of the core model.
8. Store **regional/local measurement conversions as rules with scope and source**, not universal constants.
9. Use **strong typed columns for stable filters** and **configurable attributes for category-specific evolution**.
10. Keep the common model India-compatible by placing Gujarat-only concepts behind **jurisdiction/category-specific extensions**.
11. Permit a single marketplace listing to reference **multiple underlying parcel identifiers** where an offering combines land parcels.
12. Preserve historical/source records rather than overwriting them when new documents or planning data arrive.
13. Let the public page display a **curated buyer-friendly view**; let the internal system retain the richer evidence model.

---

## Final Recommendation

For UrbanEdge Land Space V1, the best production architecture is a **hybrid relational land-property model** with:

- a universal typed property core;
- category-specific typed extensions for Agricultural, NA and Industrial land;
- a normalized geography system;
- separate planning and GIDC dimensions;
- unit-aware numeric area/pricing;
- private document/evidence storage;
- a structured verification workflow;
- a separate owner-submission intake entity;
- CRM relations kept intentionally thin;
- configurable attributes for future fields;
- jurisdiction-aware support for Gujarat now and other Indian states later.

That model is detailed enough for a software architect to translate into PostgreSQL/Supabase entities and API contracts without forcing government-record schemas directly into the public property model.

