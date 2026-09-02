# URBANEDGE LAND SPACE
# LEGAL_VERIFICATION_REPORT.md

**Research date:** 29 August 2026  
**Geographic scope:** Ahmedabad and Gandhinagar, Gujarat, with a framework designed to extend across Gujarat and, later, India.  
**Use:** Product/workflow design, operational due diligence, and lawyer-review preparation.  
**Status:** Research-based framework — **not legal advice and not a legal opinion**.

---

## 0. LEGAL / OPERATIONAL DISCLAIMER

This report is a research document for software, brokerage workflow, listing operations, and verification-design purposes. It is **not a substitute for advice or a title opinion from a Gujarat-qualified property lawyer**.

Land transactions can depend on facts that are not visible from a listing, online record, single certificate, scan, or one government search. Different property types, tenures, locations, authorities, ownership structures, transaction forms, and planning regimes can create different documentation and permission requirements.

Rules, forms, portals, authority practices, planning schemes, and data sources may change. UrbanEdge should therefore treat this report as a controlled research baseline, not a permanently correct legal rulebook.

Before UrbanEdge publicly represents that a property is "verified", "title reviewed", "legally reviewed", "NA", "industrial permitted", "RERA compliant", "survey verified", or similar, the final terminology, evidence threshold, disclaimer, and workflow should be reviewed and approved by a **qualified Gujarat property lawyer**. Where this report identifies uncertainty, the correct operational outcome is:

> **Requires review by a qualified Gujarat property lawyer**

and the system should preserve the reason for the referral.

---

# 1. RESEARCH STANDARD AND EVIDENCE TAXONOMY

UrbanEdge should distinguish four evidence classes throughout the product.

| Class | Meaning | Example | Product treatment |
|---|---|---|---|
| **Legal / Official Requirement** | Directly supported by an Act, Rule, Gazette notification, binding government instrument, or official authority statement. | Registration of specified instruments under the Registration Act; statutory conditions in GLRC provisions. | Can drive mandatory workflow rules, subject to current-law validation. |
| **Official Administrative Practice** | Government service, workflow, document checklist, portal, manual, or administrative process. | GARVI/IORA certified Index-2 or EC service; Gujarat Revenue online mutation/record services; GIDC transfer workflow. | Can drive document/source checks but should not be described as a legal conclusion. |
| **Common Due-Diligence Practice** | Professional/lawyer/industry practice that is prudent but is not itself a universal statutory rule. | Reviewing the title chain, court searches, authority documents, access rights, and original deeds. | Treat as conditional controls / professional review guidance. |
| **UrbanEdge Operational Recommendation** | Product policy proposed here to reduce risk and make verification auditable. | Scoped badges; evidence-per-check; public/internal separation; automatic lawyer referral. | Explicitly label as UrbanEdge policy, not law. |

### Source hierarchy

1. Current official Gujarat legislation / government notifications / authority portals.
2. India Code and central-government legislation for central Acts.
3. Official authority manuals and service pages.
4. Secondary legal commentary only to explain terminology where official sources are incomplete.
5. Never allow a blog, broker statement, property portal, AI summary, or lawyer marketing page to silently override a current official source.

### Important research limitation

Official portals sometimes expose a service or document but do not publish a complete plain-language explanation of its legal evidentiary effect. In those cases this report deliberately says **what the source establishes** and separately says **what UrbanEdge should not infer**.

---

# 2. EXECUTIVE CONCLUSION

UrbanEdge should **not build one monolithic `verified` flag**. Land verification is multi-dimensional. A property can have a record reviewed but unresolved tenure restrictions; a site can be visited but legal access can remain unproven; an NA order can exist while development permission is still required; a GIDC plot can have an allotment/lease structure that is not equivalent to ordinary freehold ownership; and a court/public search can reduce risk without proving that no dispute exists anywhere.

The recommended production model is:

**Property identity → ownership/record evidence → transaction history → encumbrance/registration search → tenure/restriction checks → land-use/NA status → planning/TP/zoning → site/survey/access → category-specific checks → litigation/government-claim screening → professional review triggers → scoped public disclosure → periodic recheck.**

The strongest public statement should not be "Verified". It should be a **set of scoped statements** such as:

- `Documents Reviewed`
- `Revenue Records Reviewed`
- `Registration Records Reviewed`
- `Location Checked`
- `Site Visit Completed`
- `Survey/Mapni Evidence Reviewed`
- `Planning/Zoning Check Completed`
- `GIDC Records Reviewed`
- `Legal Review Completed — Scoped`

Each should have a defined evidence threshold and date.

A lawyer-reviewed property still should not receive a universal "Clear Title" or "Government Approved" badge unless counsel has expressly approved the exact claim and evidence scope. Even then, public copy should describe the **scope and date of the opinion**, not imply a government certification.

---

# 3. PRIMARY OFFICIAL SYSTEMS RELEVANT TO URBANEDGE

## 3.1 Gujarat Revenue / land-record ecosystem

Gujarat's e-Dhara project is the computerized land-record framework. Gujarat Informatics Limited describes e-Dhara as covering computerized land records and identifies statewide access to Record of Rights (RoR), including VF6, 7/12 and VF8A through e-Dhara/e-Gram channels. It also describes integration between registration and mutation workflows.

Official sources:

- Revenue Department: https://revenuedepartment.gujarat.gov.in/
- Gujarat Informatics Ltd — e-Dhara: https://gil.gujarat.gov.in/edhara
- Gujarat e-Gram land record services: https://gil.gujarat.gov.in/eGram
- IORA Revenue services: https://revenuedepartment.gujarat.gov.in/iora-service

**Operational implication:** Use official/current records as evidence inputs, not as an automatic legal-title conclusion.

## 3.2 GARVI / Inspector General of Registration

GARVI 2.0 is the Gujarat registration, valuation and indexing platform. The official portal states that it provides registration-related services and enables property search, Index-2, document-copy access, Jantri information, stamp-duty/registration-fee information, and market-value functions. The portal also exposes **certified Index-2** and **certified EC** services through IORA.

Official source:

- GARVI 2.0: https://garvi.gujarat.gov.in/

The portal was showing a last-updated date of 27 August 2026 at research time.

**Operational implication:** Store the exact source/service used, date of access, document/certificate number, and whether the item was certified or merely viewed.

## 3.3 Gujarat Revenue Department online service catalogue

The Revenue Department IORA service catalogue explicitly lists applications/services for digitally signed village forms, survey-number boundary/part measurement, property-card copies, Index-2 copies and EC certificates, alongside several tenure/premium/NA applications.

Official source:

- https://revenuedepartment.gujarat.gov.in/iora-service

---

# 4. OVERALL LAND DUE-DILIGENCE FRAMEWORK

The research supports the following improved order for UrbanEdge:

1. **Property identity** — survey/block/city survey/property-card identifiers, village/ward, extent, plot identity, location.
2. **Seller/offeror identity and authority** — person/entity and authority to offer/sell/lease.
3. **Primary revenue / property records** — applicable 7/12, 8A, mutation/VF6, property card and related entries.
4. **Title-chain evidence** — underlying registered deeds, inheritance/partition/gift/other transfers and supporting orders.
5. **Registration and encumbrance search** — registered instruments, certified Index-2, certified EC/search, mortgage/charge indicators.
6. **Tenure and statutory restrictions** — old/new/restricted tenure, tenancy restrictions, premium, tribal/restricted categories, grant/government-land conditions, fragmentation issues where relevant.
7. **Land-use status** — agricultural / NA / industrial-purpose status and source order where applicable.
8. **Planning and development control** — Development Plan, zoning, TP scheme, OP/FP, reservations, roads, permitted use, development controls, applicable GDCR, FSI/buildability.
9. **Physical/site verification** — location, boundaries, occupation, approach road/access, visible land use, utilities where relevant.
10. **Survey/mapni reconciliation** — record identity versus physical parcel, survey/block and boundary evidence.
11. **Category-specific checks** — agricultural, NA, industrial, GIDC, plotted development/RERA, leasehold, etc.
12. **Dispute / acquisition / government-claim screening** — court/revenue records and authority notices as appropriate.
13. **Professional referral** — lawyer, surveyor, planner/architect, engineer, or other specialist depending on the issue.
14. **Scoped publication** — only evidence-supported public labels.
15. **Recheck / audit trail** — preserve date, reviewer, source and changed status.

This ordering is a **workflow recommendation**, not a statutory sequence.

---

# 5. VILLAGE FORM 7/12

## 5.1 What it is

Gujarat's e-Dhara / RoR framework identifies 7/12 as part of the Record of Rights service. The Collector Manual and Revenue administrative material use the village record system as a source for landholder/occupancy, land-use and tenure-related information, alongside VF6 and VF8A.

Official sources:

- e-Dhara: https://gil.gujarat.gov.in/edhara
- Revenue Department: https://revenuedepartment.gujarat.gov.in/
- Collector Manual: https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf

## 5.2 What UrbanEdge may use it for

A 7/12 record can be a key source for:

- survey/block identity;
- recorded holder/occupancy information as reflected in the record;
- area and other land-record fields;
- agricultural land context;
- tenure/restriction annotations where present;
- correlation with mutation entries and 8A;
- identifying possible mismatches requiring deeper review.

## 5.3 What it does not automatically prove

UrbanEdge should **not** state that a 7/12 record alone proves:

- indefeasible legal title;
- absence of all prior claims;
- absence of all mortgages/charges;
- absence of litigation;
- unrestricted transferability;
- unrestricted construction/development rights;
- authenticity of every underlying deed;
- absence of boundary disputes.

A revenue record is evidence within a broader title/land-status analysis. A title opinion is a different professional product.

## 5.4 UrbanEdge status

Recommended internal evidence fields:

`record_type = VF7_12`  
`source_system = eDhara/AnyRoR/etc.`  
`record_date`  
`survey_or_block_no`  
`holder_as_recorded`  
`area_as_recorded`  
`tenure_flag`  
`notes`  
`reviewer`  
`reviewed_at`

Public label: **Revenue Record Reviewed** or **7/12 Reviewed**.

Avoid **Title Verified** based on this record alone.

---

# 6. VILLAGE FORM 8A

## 6.1 Role

Gujarat's e-Dhara system explicitly lists VF8A with VF6 and 7/12 as Record of Rights services. VF8A should therefore be treated as a complementary landholding/account-level revenue record, not as an independent title certificate.

Official source:

- https://gil.gujarat.gov.in/edhara

## 6.2 Practical due diligence

UrbanEdge should use 8A to cross-check relevant holdings/account details against:

- 7/12;
- VF6 mutation history;
- survey/block/holding details;
- recorded names and shares where shown;
- property identity and extent.

## 6.3 Limitation

A matching 7/12 and 8A combination is stronger than relying on one record, but it still does not eliminate the need for underlying deed/title review where a transaction requires title diligence.

Public label: **Revenue Records Reviewed (7/12/8A)** where both were actually checked.

---

# 7. MUTATION / VF6

## 7.1 Official significance

Gujarat revenue administration uses Village Form 6 for mutation entries. The Collector Manual states that mutation entries should be based on certified documents received from the Sub-Registrar under the prescribed procedure and that orders should be considered in original form when mutations are made based on orders.

Official source:

- Collector Manual: https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf

## 7.2 Typical mutation events

The operational review may need to distinguish, depending on the case:

- registered sale;
- gift;
- inheritance/succession;
- partition;
- court or revenue order;
- other legally relevant acquisition/change-of-right events.

## 7.3 UrbanEdge rule

A mutation entry should be treated as **a change-of-record evidence item**, not as a substitute for the source instrument/order.

Recommended status labels:

- `Mutation Entry Found`
- `Mutation Certified / Official Record Obtained`
- `Mutation Source Document Reviewed`
- `Mutation Conflict — Legal Review Required`

Do not display `Current Owner Verified` unless the complete evidence threshold defined by counsel has actually been met.

---

# 8. OWNERSHIP / TITLE CHAIN

## 8.1 Core concept

For material transactions, the ownership question is not simply "whose name is on today's record?" It is generally a **chain-of-title problem**: what document or legally operative event transferred the right from the earlier holder to the current holder, and are there gaps, restrictions, conflicting claims, or unresolved conditions?

Relevant central law includes the Transfer of Property Act, 1882, the Registration Act, 1908, and the Specific Relief Act, 1963, among other laws that may apply by facts.

Official sources:

- Transfer of Property Act, 1882: https://www.indiacode.nic.in/handle/123456789/2338
- Registration Act, 1908: https://www.indiacode.nic.in/bitstream/123456789/19013/1/the_registration_act%2C_1908.pdf
- Specific Relief Act, 1963: https://www.indiacode.nic.in/handle/123456789/12938

## 8.2 Documents commonly reviewed in professional practice

Depending on facts, the review may involve:

- current and prior registered sale/conveyance deeds;
- gift deeds;
- partition instruments/orders;
- succession/inheritance evidence;
- probate or relevant testamentary/court material where applicable;
- release/relinquishment documents;
- development agreements or relevant authority instruments;
- registered leases;
- powers of attorney;
- company/entity authority documents;
- GIDC allotment/lease/transfer records for GIDC property;
- revenue orders concerning tenure/permission/premium;
- prior TP/land-use/planning orders where they materially affect the land.

## 8.3 UrbanEdge boundary

**Document review** and **formal legal title opinion** are different deliverables.

UrbanEdge can record:

> "UrbanEdge reviewed the documents listed in the verification panel as of [date]."

UrbanEdge should not silently convert that into:

> "UrbanEdge confirms good and marketable title."

That second statement is legal-opinion territory and should require explicit qualified counsel involvement.

---

# 9. INDEX-2

GARVI 2.0 officially provides online certified Index-2 services and states that Index-2 / document-copy services are available for registered documents.

Official source:

- https://garvi.gujarat.gov.in/

## 9.1 Operational use

Index-2 should be used to identify and cross-check registered-document particulars, for example:

- parties;
- registration details;
- property identifiers;
- transaction nature;
- registration date / document metadata as shown by the system.

## 9.2 Limitation

Index-2 is **not a substitute for the underlying registered instrument** when substantive clauses, boundaries, consideration, conditions, rights, easements, powers, recitals, or other deed terms matter.

Recommended internal rule:

> Index-2 can trigger and corroborate a title/registration review, but the underlying deed should be obtained for material conclusions.

Public label: **Registration Record Reviewed** or **Index-2 Reviewed**.

---

# 10. ENCUMBRANCE / EC / REGISTERED CHARGES

GARVI 2.0 exposes a certified EC service through IORA and the official Revenue IORA catalogue includes an EC certificate service.

Official sources:

- GARVI: https://garvi.gujarat.gov.in/
- Revenue IORA: https://revenuedepartment.gujarat.gov.in/iora-service

## 10.1 What an EC/search is useful for

Depending on the particular search scope and system, a registered-property search can help identify registered transactions/encumbrances in the relevant registration record set.

## 10.2 What it may not prove

UrbanEdge should not say that an EC or registration search proves the absence of:

- every unregistered arrangement;
- every equitable claim;
- every litigation claim;
- every revenue proceeding;
- every government reservation/acquisition issue;
- every possession dispute;
- every fraud/forgery issue.

## 10.3 Mortgage / charge workflow

Where a property appears to be mortgaged, charged, subject to a bank/security interest, or subject to a registered encumbrance, the listing should move to:

`ENCUMBRANCE IDENTIFIED → DOCUMENTS/RELEASE EVIDENCE REQUIRED → LAWYER REVIEW IF MATERIAL → PUBLIC CLAIM SUPPRESSED UNTIL RESOLVED`

For companies, separate corporate charge searches can also be relevant where the owner/entity and facts warrant it; a property registration search is not a universal substitute for all entity-level creditor checks.

---

# 11. PROPERTY CARD

## 11.1 Urban property records

The Gujarat Revenue ecosystem separately provides property-card services. The IORA service catalogue includes an application for a property-card copy, and Revenue Department online services explicitly expose property-card viewing.

Official sources:

- https://revenuedepartment.gujarat.gov.in/iora-service
- https://revenuedepartment.gujarat.gov.in/

The Revenue Department's City Survey documentation also contains City Survey Form/Property Card structures and fields linking city-survey, TP/FP and holder/entitlement information.

Official example source:

- https://revenuedepartment.gujarat.gov.in/downloads/notification-09052017-n.pdf

## 11.2 Role versus 7/12

Do not assume a single record applies uniformly to rural and urban land. Urban land may be represented through city survey/property-card records and associated planning identifiers rather than the same rural-record workflow.

UrbanEdge should determine the applicable primary record based on the property's jurisdiction and record system.

## 11.3 Public label

`Property Card Reviewed` is appropriate when a current property card has actually been reviewed.

Do not use `Urban Title Verified` solely because a property card exists.

---

# 12. SURVEY / MAPNI / BOUNDARIES

The Revenue IORA catalogue explicitly includes applications for measurement of survey-number boundaries, shares or sub-parts. The Revenue Department identifies survey/settlement and city survey as an administrative function.

Official sources:

- https://revenuedepartment.gujarat.gov.in/iora-service
- https://revenuedepartment.gujarat.gov.in/branch/h-branch

## 12.1 What to verify

- survey/block/city-survey number;
- area;
- parcel shape/boundaries where evidence exists;
- map reference;
- correspondence between record and physical location;
- subdivision/part details;
- visible possession/occupation;
- boundary markers where present.

## 12.2 Physical observation vs legal survey

A field representative can check:

> "The site visited appears to correspond to the listing coordinates/location."

That is not the same as:

> "The legal boundary has been surveyed and confirmed."

### Recommended language

**Survey/Mapni Evidence Reviewed** — safe where official survey/mapni documentation was actually reviewed.

**Survey Verified** — use only under a lawyer-approved or surveyor-approved evidence definition that specifies what was verified, by whom, against which source, and when.

For a normal brokerage V1, the safer default is **Survey/Mapni Evidence Reviewed**.

---

# 13. ROAD ACCESS / RIGHT OF WAY

Physical access and legal access are distinct questions.

A road visible from a map or site visit does not necessarily establish a legally enforceable right of way. The Indian Easements Act, 1882 expressly addresses easements, including easements of necessity, direction of a way of necessity, prescription, and related rights.

Official source:

- Indian Easements Act, 1882: https://www.indiacode.nic.in/handle/123456789/2349

## 13.1 UrbanEdge should record

- road/approach visibly present: yes/no;
- apparent public/private status: observed / document-supported / unknown;
- recorded access/right of way evidence: yes/no/not reviewed;
- road width evidence: source and date;
- landlocked risk: yes/no/uncertain;
- access-related legal document/easement: evidence reference;
- professional review required: yes/no.

## 13.2 Public wording

Prefer:

> "Approach road observed during site visit. Legal right-of-way was not independently certified unless expressly stated in the verification details."

Avoid:

> "Guaranteed road access"

unless the underlying legal evidence and counsel-approved claim support it.

---

# 14. AGRICULTURAL LAND — GUJARAT-SPECIFIC LEGAL CHECKS

Agricultural land in Gujarat can engage multiple statutory controls beyond ordinary title review. Relevant areas include purchaser eligibility, tenancy-law restrictions, tenure conditions, premium, tribal/restricted land, fragmentation, conversion to non-agricultural use, and acquisition/reservation.

Key official sources:

- Gujarat Tenancy and Agricultural Lands Act, 1948: https://www.indiacode.nic.in/bitstream/123456789/3208/2/tenancyandagriculturalland.pdf
- Gujarat Land Revenue Code, 1879: https://www.indiacode.nic.in/handle/123456789/3215
- Gujarat Revenue IORA services: https://revenuedepartment.gujarat.gov.in/iora-service
- Section 73A / 73AA resources: https://revenuedepartment.gujarat.gov.in/land-revenue-code-section-73a-73aa
- Fragmentation legislation: https://www.indiacode.nic.in/bitstream/123456789/4608/1/preventionoffragmentationact.pdf

## 14.1 Purchaser eligibility

Agricultural-land transfers can be restricted by tenancy/agricultural-land law and purchaser eligibility. The Gujarat Tenancy and Agricultural Lands Act contains restrictions concerning transfers and purchaser status, with specific exceptions/amendments and different treatment for different categories/facts.

UrbanEdge should therefore never implement:

`agricultural_land = available_to_every_buyer`

as a universal assumption.

Instead record:

- stated purchaser eligibility basis;
- supporting evidence where relevant;
- whether a statutory exception is claimed;
- whether permission is required;
- whether lawyer review is required.

### Public rule

Do not advertise agricultural land as universally purchasable simply because it appears for sale.

## 14.2 Tenancy restrictions / section 63-type issues

The Gujarat Tenancy and Agricultural Lands Act contains restrictions on transfers and provisions dealing with transfers to non-agriculturists, including consequences where a transfer is held invalid. Exact applicability depends on the transaction, land category, amendments and exceptions.

**Requires review by a qualified Gujarat property lawyer** whenever purchaser eligibility or an exception is material to the transaction.

## 14.3 New tenure / restricted tenure / premium

The Gujarat Revenue IORA service catalogue expressly includes applications concerning new and indivisible/restricted tenure land and premium for agricultural and non-agricultural purposes.

Official source:

- https://revenuedepartment.gujarat.gov.in/iora-service

The Collector Manual also instructs officers to check whether land is new tenure/restricted tenure and whether premium is relevant.

**Product rule:** Never normalize `new tenure`, `navi sharat`, `restricted`, `prohibited`, `premium applicable`, or similar fields into a single simple yes/no freehold field. Preserve the original designation and source.

## 14.4 Tribal / section 73AA considerations

The Revenue Department maintains a specific section 73A/73AA information resource, indicating dedicated administrative treatment of these provisions.

Official source:

- https://revenuedepartment.gujarat.gov.in/land-revenue-code-section-73a-73aa

Where section 73AA/restricted tribal land is implicated, the listing should automatically enter **LEGAL REVIEW REQUIRED** status before publication of a transfer-oriented claim.

## 14.5 Fragmentation

The applicable fragmentation legislation restricts transfer/partition in circumstances that create or involve prohibited fragments. The official Act text includes restrictions on transfer/lease of fragments and a prohibition on creating fragments.

Official source:

- https://www.indiacode.nic.in/bitstream/123456789/4608/1/preventionoffragmentationact.pdf

For agricultural parcels near minimum/standard-area issues, subdivision, family partition, or small-packet sale, UrbanEdge should flag fragmentation review rather than assuming the parcel can be split or sold as represented.

## 14.6 Ceiling / acquisition / reservation

These are fact-dependent and must be checked against applicable current law, land records and authority records. Do not create a universal `No acquisition risk` flag merely from a clean 7/12.

---

# 15. SARAT / TENURE TERMINOLOGY

Brokerage usage can be inconsistent. UrbanEdge should not treat the following as interchangeable:

- Juni Sarat / old tenure;
- Navi Sarat / new tenure;
- restricted tenure;
- prohibited/restricted categories;
- land subject to premium;
- government-granted land with conditions.

Official Gujarat Revenue materials use distinct procedures and applications relating to conversion of new/restricted tenure and premium.

Official source:

- https://revenuedepartment.gujarat.gov.in/iora-service
- https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf

### Recommended data model

Store:

`tenure_class_as_recorded`  
`restriction_text_as_recorded`  
`premium_status`  
`permission_required`  
`permission_source`  
`review_notes`

Do not store only `old_tenure=true` / `new_tenure=true` without preserving the evidence and exact source language.

### Public wording

Prefer:

> "Tenure classification reviewed — see verification details."

or

> "Restricted/new-tenure status identified; transaction subject to required permissions/premium and legal review."

Avoid simplified statements such as:

> "Old tenure = completely unrestricted."

because property-specific conditions can still matter.

---

# 16. NON-AGRICULTURAL (NA) PERMISSION

This is one of the most important product distinctions.

The Gujarat Revenue Department Collector Manual states that NA permission for relevant agricultural land is governed under provisions including sections 65, 65A and 65B of the Gujarat Land Revenue Code, and describes checks concerning legal occupancy, government controls such as new/restricted tenure, and title disputes. It also separately states that in city areas NA permission and construction/development permission are different.

Official sources:

- Gujarat Land Revenue Code: https://www.indiacode.nic.in/handle/123456789/3215
- Gujarat Land Revenue Code official PDF source: https://upload.indiacode.nic.in/showfile?actid=AC_GJ_66_229_00001_00001_1538202660452&filename=landrevenuecode.pdf&type=actfile
- Gujarat Collector Manual: https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf
- NA procedure: https://revenuedepartment.gujarat.gov.in/downloads/gr_01072008_k_eng.pdf
- IORA services: https://revenuedepartment.gujarat.gov.in/iora-service

## 16.1 What NA means in workflow

A listing should distinguish at least:

- agricultural land;
- NA permission applied for;
- NA permission granted;
- NA use actually recorded/implemented where applicable;
- permitted NA purpose;
- conditions attached to the order;
- planning/zoning status;
- development/construction permission.

## 16.2 NA is not zoning or building permission

The Collector Manual explicitly describes the segregation of NA permission and building/development permission: after section 65 NA permission, development/construction permission is obtained from the competent planning/local authority as applicable.

Therefore:

> **NA permission ≠ unrestricted construction permission**

and

> **NA land ≠ automatically permitted for every non-agricultural use**

## 16.3 Public labels

Safe:

- `NA Order Reviewed`
- `NA Permission Document Reviewed`
- `NA Purpose: [specified purpose]`

Use only with a precise evidence standard:

- `NA Status Verified`

Avoid:

- `Guaranteed NA`
- `Fully Approved for Any Development`

---

# 17. SECTION 65 / 65A / 65B

The official Gujarat Land Revenue Code source includes sections 65A and 65B. Section 65B addresses use of certain land for bona fide industrial purpose subject to statutory conditions, including title and planning/reservation/acquisition-related conditions specified in the provision.

Official source:

- https://upload.indiacode.nic.in/showfile?actid=AC_GJ_66_229_00001_00001_1538202660452&filename=landrevenuecode.pdf&type=actfile

The Revenue Department IORA catalogue currently includes distinct online applications for:

- section 65 NA permission;
- section 65(a) change of NA purpose;
- section 65(b) bona fide industrial purpose;
- related permission/premium workflows.

Official source:

- https://revenuedepartment.gujarat.gov.in/iora-service

### UrbanEdge rule

Never reduce section 65/65A/65B into a single boolean `na_approved`. Store:

`legal_section`  
`purpose`  
`order_no`  
`order_date`  
`authority`  
`conditions`  
`current_use_checked`  
`planning_check_separate`  
`review_date`

---

# 18. INDUSTRIAL LAND

Industrial land has multiple possible legal/administrative structures:

1. privately owned industrial land;
2. privately owned land with industrial-use permissions;
3. land in a private industrial estate;
4. GIDC estate land;
5. leasehold/allotted land with conditions;
6. industrial project/plotting context that may trigger other regulatory requirements.

Do not treat these as equivalent.

Relevant official sources:

- GIDC Acts/Rules/Regulations: https://gidc.gujarat.gov.in/Pages/Contents/Regulations
- GIDC Rules: https://gidc.gujarat.gov.in/Pages/Contents/Rules
- GIDC allotment: https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties
- GIDC post-operation services: https://gidc.gujarat.gov.in/Pages/Contents/post-operation
- GIDC application guidelines: https://gidc.gujarat.gov.in/Pages/Contents/application-guiedline

---

# 19. GIDC DUE DILIGENCE

## 19.1 GIDC tenure structure

The official GIDC allotment page states that GIDC land is allotted on a lease basis, with the current page describing 99-year lease tenure renewable for another 99 years. GIDC's separate lease-tenure communication also describes long-term lease arrangements and the application of GIDC laws/regulations/policies.

Official sources:

- https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties
- https://gidc.gujarat.gov.in/pdf/Information-pertaining-to-lease-tenure.pdf

Therefore:

> **A GIDC plot should not be represented as ordinary freehold ownership merely because a seller calls it “owned”.**

## 19.2 GIDC records to check

Depending on transaction type and current GIDC workflow:

- offer-cum-allotment / allotment letter;
- lease deed / licence or related agreement;
- possession receipt;
- latest transfer order if transferred;
- dues status;
- usage/industrial activity conditions;
- transfer permission/status;
- subletting status;
- mortgage permission where applicable;
- sub-division/amalgamation status;
- plot utilization / compliance status;
- building/plan approvals where relevant;
- estate-specific restrictions.

GIDC's current portal exposes post-operation services for lease deed, mortgage permission, transfer, subdivision, amalgamation, surrender, sub-letting, right of use and dues.

Official source:

- https://gidc.gujarat.gov.in/Pages/Contents/post-operation

## 19.3 GIDC transfer

GIDC publishes a specific transfer workflow and document requirements. Its transfer documentation demonstrates that the transfer process can involve the lease deed, possession receipt, identity/authority documents and entity-specific documents.

Official source:

- https://gidc.gujarat.gov.in/pdf/Application/Transfer.pdf

Its 2024 land-allotment policy also specifically addresses allotment, utilization and transfer of GIDC plots.

Official source:

- https://gidc.gujarat.gov.in/Document/LinkManagment/Circulars/pre-alt-1718102024013709.pdf

### Product rule

For GIDC properties, verification should have a separate namespace:

`GIDC_ALLOTMENT_REVIEW`  
`GIDC_LEASE_REVIEW`  
`GIDC_TRANSFER_REVIEW`  
`GIDC_DUES_REVIEW`  
`GIDC_USE_COMPLIANCE_REVIEW`

A public label such as `GIDC Records Reviewed` is materially safer than `GIDC Ownership Verified`.

---

# 20. TP / OP / FP — TOWN PLANNING

The Gujarat Town Planning and Urban Development Act framework defines the concept of a **final plot** as a plot reconstituted from an original plot and allotted in a town planning scheme as a final plot.

Official source:

- India Code / Gujarat town-planning legislation: https://www.indiacode.nic.in/bitstream/123456789/4658/1/tpudact.pdf

## 20.1 Why it matters

In a TP scheme area, the original survey/plot identity can change through land readjustment/reconstitution. A listing that only shows the original survey number can therefore be misleading if the applicable scheme has produced a final plot, reservation, road, deduction or other reconstitution.

## 20.2 UrbanEdge should check

- scheme number;
- draft/preliminary/final status where applicable;
- OP number;
- FP number;
- original survey/block reference;
- land deduction/readjustment context;
- reservations;
- road proposals/alignments;
- final plot dimensions/area where official records establish them;
- authority and scheme date.

## 20.3 Public wording

Use:

> `TP / OP-FP Record Reviewed`

or

> `Planning Scheme Information Reviewed`

Do not say:

> `No TP Impact`

unless a current authoritative check actually supports that scope.

---

# 21. DEVELOPMENT PLAN / ZONING — AHMEDABAD & GANDHINAGAR

Planning status is an independent layer from revenue title.

### Ahmedabad / AUDA

AUDA publishes Development Plan material, zoning information, TP-scheme information and development-control resources. Its development page shows multiple land-use zones and active TP-scheme preparation, illustrating why parcel-specific planning checks are required.

Official sources:

- AUDA Development Plan: https://www.auda.org.in/rdp/
- AUDA Development information: https://www.auda.org.in/Content/development-46

### Gujarat-wide development control

Gujarat's Comprehensive General Development Control Regulations (CGDCR) are an important planning/development-control reference. The official government/GIDC-hosted notification identifies different authority classes and references AUDA, GUDA and other development authorities.

Official source:

- CGDCR official notification: https://gidc.gujarat.gov.in/pdf/Circular/Circular-%20ATP%20dtd%2022.12.2017.pdf

### Gandhinagar

The applicable authority should be determined from the property's jurisdiction (for example, GUDA, municipal/local authority, or another planning authority) and current planning documents. UrbanEdge should not assume that an address containing "Gandhinagar" automatically falls under one planning dataset.

**Requires review by a qualified Gujarat planner/architect or property lawyer** where zoning, TP, reservation, road alignment or development rights materially affect marketability or buyer-use claims.

---

# 22. FSI / DEVELOPMENT RIGHTS

FSI/FAR/buildability is a **planning question**, not simply a title question.

Relevant factors can include:

- zoning/land use;
- road width;
- plot size and shape;
- applicable GDCR;
- authority classification;
- TP scheme deductions/reconstituted plot;
- special overlays or reservations;
- intended use;
- building/fire/environment/infrastructure requirements;
- date/version of applicable regulation.

AUDA publishes development-control materials, and the CGDCR framework confirms that planning/development controls are governed by applicable authority/category regulations.

Official sources:

- https://www.auda.org.in/rdp/
- https://gidc.gujarat.gov.in/pdf/Circular/Circular-%20ATP%20dtd%2022.12.2017.pdf

### UrbanEdge rule

Do not display a seller-supplied `buildable_area = X sq ft` as a verified fact unless the evidence is defined and checked by an appropriate professional.

Public label:

> `Development Potential — Seller Stated / Planning Check Required`

or, after appropriate professional review:

> `Buildability / FSI Reviewed — Scope and date shown`

Avoid `Guaranteed Construction Potential`.

---

# 23. RERA / GUJRERA

The Real Estate (Regulation and Development) Act, 2016 expressly covers certain real-estate projects and defines a promoter to include a person who develops land into a project for selling plots. Section 3 generally requires registration of a real-estate project before advertising, marketing, booking or offering plots/apartments/buildings for sale, subject to statutory exemptions.

Official sources:

- RERA Act overview: https://www.indiacode.nic.in/handle/123456789/2158
- Section 3: https://www.indiacode.nic.in/show-data?actid=AC_CEN_17_19_00033_201616_1517807328405&orderno=3&sectionId=8627&sectionno=3
- Full Act: https://www.indiacode.nic.in/indiacode/bitstream/123456789/2158/1/A201616.pdf
- Gujarat RERA portal: https://gujrera.gujarat.gov.in/

## 23.1 Important distinction

A normal individual resale of a parcel by its owner is not automatically the same regulatory scenario as a promoter's plotted real-estate project.

UrbanEdge should ask:

- Is this an individual land resale?
- Is the seller a promoter/developer?
- Is land being developed/divided and marketed as a plotted project?
- Is there a registered project?
- Does a statutory exemption apply?
- Is the property itself part of a registered project?

## 23.2 RERA project search

Where RERA applicability is plausible, UrbanEdge should record:

`rera_applicability_status`  
`project_name`  
`rera_registration_no`  
`authority_source`  
`registration_status`  
`checked_at`

Public label:

`RERA Project Record Reviewed`

Do not display `RERA Approved` unless lawyer-approved terminology defines exactly what is meant.

## 23.3 Real-estate agent implications

The RERA Act also regulates registration of real estate agents in the context specified by the Act, including agents facilitating sale/purchase of plots/apartments/buildings in registered real-estate projects. UrbanEdge should obtain counsel's view on the platform's exact business role, geography, and activity before assuming whether/when RERA agent registration applies.

---

# 24. REGISTRATION / STAMP DUTY CONTEXT

The Registration Act, 1908 contains compulsory-registration provisions for specified instruments concerning immovable property. The Transfer of Property Act also governs important concepts such as sale, mortgage and lease.

Official sources:

- Registration Act: https://www.indiacode.nic.in/bitstream/123456789/19013/1/the_registration_act%2C_1908.pdf
- Transfer of Property Act: https://www.indiacode.nic.in/handle/123456789/2338
- GARVI: https://garvi.gujarat.gov.in/

UrbanEdge should not attempt to provide transaction-tax/legal-fee conclusions merely from listing inputs. The workflow should instead surface:

- whether the transaction instrument is expected to be registered;
- where registration is expected to occur;
- relevant registered-document evidence;
- current official stamp/registration information source;
- lawyer/accountant referral where transaction structuring is material.

---

# 25. JANTRI

GARVI 2.0 provides a Jantri rate function and related market-value/stamp-duty information tools.

Official source:

- https://garvi.gujarat.gov.in/

## 25.1 Purpose

Jantri is a government valuation/reference mechanism relevant to registration/stamp-duty processes and is not the same thing as market asking price.

## 25.2 UrbanEdge rule

Store:

`jantri_source`  
`jantri_version_or_date`  
`location_inputs_used`  
`rate_shown`  
`retrieved_at`

Do not hard-code rates into the application without an authoritative update process.

Do not represent Jantri as an independent statement of market value.

Public label:

`Jantri Reference Available`

rather than

`True Market Value`.

---

# 26. LITIGATION / DISPUTES / GOVERNMENT CLAIMS

No single search proves the absence of every legal dispute.

## 26.1 Civil litigation

eCourts provides public search facilities including party-name, CNR, case-number, filing-number and Act-based case status search. Its own site carries an explicit caution that online information should be cross-checked and is not intended by itself to serve as legal evidence.

Official source:

- https://ecourts.gov.in/ecourts2.0/

UrbanEdge should therefore record:

- search scope;
- names searched;
- identifiers searched;
- courts/jurisdictions searched;
- date/time;
- results;
- false-positive handling;
- unresolved matches.

## 26.2 Revenue disputes

Where a property has revenue cases/orders/appeals or contested mutation/tenure issues, a relevant Gujarat Revenue Department record should be reviewed. The Revenue Department exposes revenue-case related information as part of its online service ecosystem.

Official source:

- https://revenuedepartment.gujarat.gov.in/

## 26.3 Acquisition / reservation / road proposals

These can arise from planning and land-acquisition frameworks even when title records look normal. Gujarat has official materials under the land-acquisition and development-plan frameworks.

Relevant official source:

- Gujarat land acquisition rules: https://revenuedepartment.gujarat.gov.in/downloads/act_13102017.pdf

### Public wording

Use:

> `Litigation / authority searches completed for the stated scope as of [date]. This does not guarantee absence of every dispute or claim.`

Avoid:

> `Dispute Free`

---

# 27. POWER OF ATTORNEY (PoA)

A PoA arrangement can create a significant authority-to-transact issue. UrbanEdge should not rely on the statement:

> "I have power of attorney from the owner."

as proof of authority.

## Operational checklist

- identify the principal and attorney;
- obtain the PoA instrument;
- check whether it is registered/notarized where relevant to the claimed authority;
- check exact powers: sell, lease, receive consideration, execute documents, represent before authorities;
- check revocation/cancellation information where available;
- confirm principal's identity and title separately;
- check whether the transaction is within the scope and period of authority;
- review related title/registration records;
- obtain legal review before presenting a title/authority claim.

### Product status

`POA_PRESENT — LEGAL REVIEW REQUIRED`

until the defined counsel-approved threshold is met.

---

# 28. ENTITY-OWNED PROPERTY

## 28.1 Company

Where a company owns property, UrbanEdge should separately verify:

- legal owner entity name;
- corporate identity;
- authority of the signatory;
- board/shareholder approvals where legally or constitutionally required;
- underlying property documents;
- entity-level charges/encumbrances where relevant;
- whether related-party or other corporate restrictions may apply.

The Companies Act contains provisions concerning property transactions and board powers/approvals, including sections that become relevant depending on the transaction structure.

Official source:

- Companies Act, 2013: https://www.indiacode.nic.in/handle/123456789/2114

## 28.2 LLP / partnership

For a partnership, the Partnership Act states that a partner's implied authority does not ordinarily extend to transfer of immovable property belonging to the firm unless authority is established through the partnership structure/contract or otherwise.

Official source:

- Indian Partnership Act, 1932: https://www.indiacode.nic.in/handle/123456789/2394

For an LLP, constitutional documents and authority rules should be checked separately.

## 28.3 Trust / society

Authority and restrictions can be structure-specific and may involve trust deeds, registration, governing-body resolutions, statutory approvals, and use restrictions.

### UrbanEdge rule

Do not create one generic `entity_verified` flag. Store:

`entity_type`  
`owner_entity_name`  
`authority_document`  
`signatory_role`  
`approval_document`  
`professional_review_status`

---

# 29. DOCUMENT AUTHENTICITY

**Uploaded scan ≠ authenticated document.**

A PDF/image can be:

- owner-supplied;
- broker-supplied;
- downloaded from an unknown source;
- digitally signed;
- government-certified;
- a plain scan of an original;
- a copy of a copy;
- altered or incomplete.

UrbanEdge should therefore distinguish:

### Level A — Document Received
File was supplied.

### Level B — Document Reviewed
Human reviewer inspected legibility/content.

### Level C — Source Verified
Document was cross-checked against the official issuing system/source or an appropriate certified original.

### Level D — Professional Reviewed
Qualified lawyer/surveyor/planner reviewed it for the defined issue.

Public label recommendation: **Document Reviewed** or **Source Verified**, not "Authentic" unless the evidence and counsel-approved process establish what that term means.

---

# 30. SAFE PUBLIC VERIFICATION LEVEL MODEL

The exact hierarchy should be lawyer-approved, but this five-level model is suitable for product architecture.

| Level | Internal meaning | Minimum evidence | Public label | Public limitation |
|---|---|---|---|---|
| **0** | Seller/owner/broker information only | Listing submission | Information Provided | Not independently checked. |
| **1** | UrbanEdge inspected listing data | Identity/listing fields reviewed | Information Reviewed | Does not establish document validity or title. |
| **2** | Specific documents were inspected | Named documents + reviewer + date | Documents Reviewed | Only the listed documents were reviewed. |
| **3** | Specific location/site check completed | Site visit evidence / official location evidence | Location / Site Checked | Does not establish legal title, boundaries or development rights. |
| **4** | Defined record/planning/survey checks completed | Named official sources + dates + evidence | Records Reviewed / Checks Completed | Only stated checks and dates are covered. |
| **5** | Qualified professional reviewed a defined scope | Lawyer/surveyor/planner identity, scope and date | Professional Review Completed — Scoped | Opinion is limited to the stated scope; not a blanket government certification. |

### Important

Level 5 must **not** automatically become `Clear Title`.

A lawyer's opinion may be limited, conditional, time-bound, based on supplied documents, or subject to exceptions.

---

# 31. PUBLIC BADGE LANGUAGE

## 31.1 Safe / recommended

| Label | Recommended condition |
|---|---|
| **Documents Received** | One or more files supplied. |
| **Documents Reviewed** | Human review completed for named documents. |
| **Source Verified** | Document/source cross-checked against an appropriate official source/process. |
| **Location Checked** | Location/site correspondence checked. |
| **Site Visit Completed** | Physical visit completed; scope shown. |
| **Revenue Records Reviewed** | Applicable record set checked. |
| **Registration Records Reviewed** | Registration/Index-2/EC search performed. |
| **Planning/Zoning Check Completed** | Specific planning source checked. |
| **GIDC Records Reviewed** | GIDC evidence checked for a GIDC property. |
| **Legal Review Completed — Scoped** | Qualified lawyer reviewed defined materials/issues. |

## 31.2 Use only under defined conditions

- **UrbanEdge Verified** — only if the badge always expands into its exact checks and counsel approves the term.
- **Survey Verified** — only after an explicit survey evidence standard is implemented.
- **Title Reviewed** — preferably only when a defined title-document scope was actually reviewed.
- **RERA Record Verified** — only as a scope-limited record statement, not as a broad legality certificate.

## 31.3 Avoid

- `Clear Title`
- `100% Clear Title`
- `Legally Verified`
- `Government Approved`
- `Fully Verified`
- `Dispute Free`
- `Guaranteed NA`
- `Guaranteed Construction`
- `Risk Free`
- `No Legal Issues`

These phrases may imply a much broader conclusion than UrbanEdge's evidence can safely support.

---

# 32. WHAT “VERIFIED” MAY LEGALLY IMPLY

India's consumer-protection framework gives CCPA authority concerning false or misleading advertisements. The Department of Consumer Affairs publishes the Consumer Protection Act, 2019 and the 2022 Guidelines for Prevention of Misleading Advertisements and Endorsements.

Official sources:

- Consumer Protection Act / materials: https://consumeraffairs.nic.in/acts-and-rules/consumer-protection/consumer-protection
- Misleading advertisement guidelines: https://consumeraffairs.nic.in/latestnews/guidelines-prevention-misleading-advertisements-and-endorsements-misleading
- Consumer-affairs FAQ: https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/FAQ.pdf

The official FAQ describes a misleading advertisement as one that can falsely describe a product/service, give a false guarantee, or mislead consumers, among other circumstances.

For UrbanEdge this means the word **verified** should be treated as a claim whose meaning a reasonable consumer can rely on. The safest approach is therefore to define verification as a **finite, auditable set of checks**.

### Mandatory design principle

Never show a badge without a drill-down explanation of:

- what was checked;
- what was not checked;
- evidence source;
- reviewer/role;
- date;
- any unresolved exception;
- whether seller-provided information was relied upon.

---

# 33. PUBLIC DISCLAIMER — DRAFT FOR LAWYER/CLIENT REVIEW

> **DRAFT FOR LAWYER/CLIENT REVIEW — NOT FINAL LEGAL TEXT**
>
> **About UrbanEdge property verification**  
> Any verification indicator shown on this website refers only to the specific checks and evidence described in the property's verification details, as of the stated review date. A verification indicator is **not a government certification, title guarantee, legal opinion, or guarantee that the property is free from disputes, encumbrances, restrictions, defects, claims, acquisition, planning limitations or other legal issues**.
>
> Information may include information supplied by owners, brokers or other third parties and may also include information obtained from public/official records. Availability or review of a document does not by itself confirm its authenticity, completeness, enforceability or legal effect.
>
> Verification checks can become outdated because ownership, encumbrances, permissions, planning status, litigation, availability and other circumstances may change. Buyers, lessees and other users should independently verify the property and obtain appropriate professional advice, including legal, survey, planning, engineering or financial advice as applicable, before entering into any transaction or making payment.
>
> Where a legal review is stated, it is limited to the scope expressly identified in the verification details and is not a representation that all possible legal issues have been reviewed or resolved.

**Do not publish this text unchanged. Obtain lawyer/client approval first.**

---

# 34. PROPERTY-SPECIFIC VERIFICATION DISCLOSURE

Each listing should expose a **Checks Completed** panel rather than a single green "Verified" badge.

Recommended display:

| Check | Status | Date | Scope |
|---|---|---|---|
| Documents received | ✓ | 29-Aug-2026 | Named files |
| Documents reviewed | ✓ | 29-Aug-2026 | Named files |
| Revenue records reviewed | ✓ | 29-Aug-2026 | 7/12 + 8A |
| Mutation reviewed | ✓ | 29-Aug-2026 | VF6 entries listed |
| Registration records reviewed | ✓ | 29-Aug-2026 | Index-2 / EC scope |
| Site visit | ✓ | 28-Aug-2026 | Location only |
| Survey / mapni | — | — | Not reviewed |
| Zoning / TP | ✓ | 29-Aug-2026 | Specific planning source |
| NA order | — | — | Agricultural land |
| GIDC transfer | N/A | — | Not a GIDC plot |
| Litigation search | Conditional | 29-Aug-2026 | Stated jurisdictions only |
| Legal opinion | — | — | Not obtained |

This structure materially reduces the risk that the UI communicates more than the evidence supports.

---

# 35. INTERNAL VERIFICATION CHECKLIST — AGRICULTURAL LAND

| Check | Why | Evidence | Responsible Role | Publicly Disclosed? | Mandatory/Conditional |
|---|---|---|---|---|---|
| Property identity | Prevent wrong-parcel review | 7/12, survey/block data, map | Admin | Yes, scope-limited | Mandatory |
| Seller identity | Match offeror to claimed owner | ID + owner record | Admin | Limited | Mandatory |
| 7/12 | Primary revenue evidence | Current official record | Admin | Yes | Mandatory |
| 8A | Cross-check holding/account | Current official record | Admin | Yes where reviewed | Conditional by jurisdiction |
| VF6/mutation | Trace changes | Certified mutation entries + source instruments | Admin | Status only | Mandatory for material transfer |
| Title chain | Establish transfer history | Registered deeds/orders | Lawyer/admin depending V1 | Yes, at high level | Conditional; lawyer triggers |
| Index-2 | Cross-check registered instruments | Certified Index-2 | Admin | Yes | Mandatory for sale-type due diligence where available |
| EC/encumbrance | Identify registered encumbrances | Certified EC/search | Admin/lawyer | Status only | Mandatory for sale/lease where appropriate |
| Tenure | Identify restrictions | 7/12 + orders | Admin/lawyer | Yes, exact class | Mandatory |
| Premium | Identify payable/paid issues | Government order/receipt | Admin/lawyer | Limited | Conditional |
| Agriculturist/purchaser eligibility | Avoid invalid transfer assumptions | Evidence + legal basis | Lawyer | Yes only as scoped status | Conditional / high-risk |
| Section 73AA etc. | Restricted categories | Official record/order | Lawyer | Status | Conditional |
| Fragmentation | Avoid prohibited division/transfer | Survey/area + applicable Act review | Lawyer/surveyor | Status | Conditional |
| NA conversion | Correct land-use claim | NA order/application | Admin/lawyer | Yes | Conditional |
| Planning | Intended use compatibility | DP/zoning/TP source | Planner/lawyer | Yes | Conditional |
| Access | Physical + legal access | Site + deed/easement evidence | Admin/lawyer | Yes, scope-limited | Mandatory for listing quality; legal access conditional |
| Boundary | Match parcel on ground | mapni/survey/site evidence | Surveyor/admin | Yes only if defined | Conditional |
| Litigation | Screen known disputes | eCourts/revenue searches | Admin/lawyer | Search status only | Conditional/high-value |
| Acquisition/reservation | Detect government/planning risk | official authority source | Lawyer/planner | Status | Conditional |
| Final approval | Publish only supported claims | checklist complete | Authorized admin | Yes | Mandatory |

---

# 36. INTERNAL VERIFICATION CHECKLIST — NA LAND

| Check | Why | Evidence | Responsible Role | Publicly Disclosed? | Mandatory/Conditional |
|---|---|---|---|---|---|
| Property identity | Correct parcel | Property card / 7/12 / survey data | Admin | Yes | Mandatory |
| Current holder | Seller authority | Record + title docs | Admin/lawyer | Limited | Mandatory |
| Underlying title chain | Ownership basis | Registered deeds/orders | Lawyer/admin | Scoped | Conditional based on claim |
| NA order | Confirm conversion basis | Original/certified order | Admin | Yes | Mandatory for NA claim |
| NA purpose | Check permitted purpose | NA order | Admin | Yes | Mandatory |
| Conditions | Identify restrictions | NA order/related records | Admin/lawyer | Status | Mandatory |
| 65/65A/65B basis | Correct statutory path | Authority order | Lawyer/admin | Internal | Conditional |
| Planning zoning | NA does not equal zoning | DP/TP/zoning | Planner/admin | Yes | Mandatory for use claims |
| Building/development permission | Separate from NA | Local authority approval | Planner/admin | Yes | Conditional by claim |
| FSI/buildability | Avoid unsupported promise | Current GDCR + professional assessment | Planner/architect | Scoped | Conditional |
| Encumbrance | Identify registered claims | EC/search | Admin/lawyer | Status | Mandatory for material sale |
| Litigation | Identify disputes | eCourts/revenue | Admin/lawyer | Status | Conditional/high value |
| Access | Legal/physical | Site + easement evidence | Admin/lawyer | Scoped | Mandatory listing quality |

---

# 37. INTERNAL VERIFICATION CHECKLIST — INDUSTRIAL LAND

| Check | Why | Evidence | Responsible Role | Publicly Disclosed? | Mandatory/Conditional |
|---|---|---|---|---|---|
| Property identity | Correct plot | Survey/plot/site plan | Admin | Yes | Mandatory |
| Ownership/lease structure | Determine rights | Title/lease/allotment | Lawyer/admin | Yes, scoped | Mandatory |
| Industrial designation | Confirm claimed use | DP/TP/zoning/order | Planner/admin | Yes | Mandatory |
| Section 65/65B | Determine NA/industrial path | Official order / current statutory path | Lawyer/admin | Yes, scope-limited | Conditional |
| GIDC status | Identify GIDC regime | GIDC official records | Admin | Yes | Conditional |
| GIDC allotment | Establish allotment basis | OCA/allotment letter | Admin | Limited | Conditional |
| Lease deed | Identify tenure/conditions | GIDC lease deed | Admin/lawyer | Scope only | Conditional |
| GIDC transfer | Ensure transfer permitted | Transfer order/application/status | Admin/lawyer | Status | Mandatory for GIDC transfers |
| GIDC dues | Financial/administrative risk | Official dues record | Admin | Limited | Mandatory for transfer workflow |
| GIDC usage compliance | Avoid misuse | GIDC records/site | Admin/GIDC liaison | Status | Conditional |
| Subletting | Avoid unauthorized occupation | GIDC approval | Admin/lawyer | Status | Conditional |
| Mortgage permission | Financing compliance | GIDC 2(r)/2(s) record where applicable | Admin/lawyer | Status | Conditional |
| TP/FP / reservation | Planning risk | TP/authority record | Planner | Yes | Conditional |
| Access/utilities | Industrial feasibility | site + authority evidence | Admin/engineer | Yes, scoped | Conditional |
| Building/plan approval | Construction claim | authority approval | Planner/architect | Yes | Conditional |
| Environmental/sector permissions | Use-specific | relevant permits | Specialist | Status | Conditional |
| Litigation | Disputes | court/authority search | Lawyer | Status | Conditional/high-value |

For GIDC-specific workflows, the checklist must follow the **current GIDC policy and portal requirements**, not a static third-party checklist.

---

# 38. OWNER SUBMISSION DOCUMENTS

UrbanEdge should request only what is necessary for the verification objective.

## 38.1 Common

- property identification details;
- owner/contact information required for the service;
- applicable revenue/property-card records;
- relevant registered deed(s);
- mutation evidence where applicable;
- Index-2/registration details;
- EC/search result where appropriate;
- photographs/site location;
- authority letter where the submitter is not the owner.

## 38.2 Agricultural

- current 7/12;
- 8A;
- relevant VF6 mutation entries;
- title-chain documents;
- tenure/restriction/premium documents;
- relevant permission/order documents;
- agriculturist/purchaser eligibility evidence where legally necessary;
- inheritance/partition documents where applicable;
- map/survey evidence where boundaries are material.

## 38.3 NA

- NA order/permission;
- conditions/annexures;
- underlying title documents;
- planning/zoning evidence;
- development/building approvals where represented;
- relevant plan/map.

## 38.4 Industrial

- title / lease / allotment documents;
- industrial-use permission/order where applicable;
- GIDC OCA/allotment letter;
- GIDC lease/licence;
- possession receipt;
- transfer order;
- dues record;
- relevant mortgage/subletting/surrender/other permissions.

## 38.5 Conditional

- PoA;
- company/LLP/partnership authority documents;
- trust/society documents;
- inheritance/probate materials;
- court orders;
- release/NOC documents;
- acquisition/reservation material;
- specialist reports.

### Privacy principle

Do **not** routinely require Aadhaar/PAN scans merely because they are convenient. Request the minimum identity information/document needed for the specific task, and consult counsel on lawful basis, retention and access.

---

# 39. DATA PROTECTION / PRIVACY

India's Digital Personal Data Protection Act, 2023 establishes a framework for processing digital personal data. MeitY published the **Digital Personal Data Protection Rules, 2025** on 14 November 2025 and a corrigendum on 16 December 2025. The official notification contains staged commencement dates rather than making every rule operative on publication.

Official sources:

- DPDP Act, India Code: https://www.indiacode.nic.in/indiacode/handle/123456789/22037
- DPDP Act PDF: https://www.indiacode.nic.in/bitstream/123456789/22037/1/a2023-22.pdf
- MeitY DPDP Rules 2025: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
- Official Gazette notification: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

## 39.1 Commencement status matters

The 13 November 2025 Gazette notification states, among other things, that rules 1, 2 and 17–21 came into force on publication; rule 4 is scheduled for one year after publication; and rules 3, 5–16, 22 and 23 are scheduled for eighteen months after publication.

Therefore, as of 29 August 2026, UrbanEdge should **not assume that every requirement described in the 2025 Rules is already fully operative**.

**Requires review by privacy counsel / qualified counsel for a current implementation-date matrix.**

## 39.2 Data categories to treat carefully

- owner name;
- phone;
- email;
- identity documents;
- property documents containing personal details;
- bank/financial information if ever received;
- signatures;
- GPS/location information tied to identifiable persons;
- internal verification notes.

## 39.3 Recommended safeguards

At policy level:

- private storage for non-public documents;
- admin-only or role-based access;
- short-lived signed access where technically appropriate;
- audit logs for document access/download;
- defined retention period;
- deletion workflow;
- prohibition on public document URLs;
- avoid placing personal document contents into analytics events or ordinary application logs;
- redact documents before broader internal sharing where practical;
- separate public listing data from internal evidence vault.

These are **UrbanEdge operational recommendations**, not a statement of automatic legal compliance.

---

# 40. STORAGE / ACCESS POLICY

Recommended internal classification:

| Classification | Example | Default visibility |
|---|---|---|
| Public | Listing photos, public description, public verification summary | Public |
| Internal | Review notes, source links, checklist | Admin/reviewer |
| Confidential | Owner-uploaded deeds, EC, 7/12 scans, company docs | Restricted admin/legal |
| Highly sensitive | Identity documents, bank information, signatures | Minimal access / avoid unless necessary |

### Rules

1. No public document URL for internal evidence.
2. Verification page should show a summary, not expose raw documents by default.
3. Every evidence item should have an owner, source, reviewer and access history.
4. Replaced documents should remain in controlled history where retention is justified.
5. Deleted/revoked documents should no longer satisfy verification automatically.

---

# 41. TRANSACTION-TYPE DIFFERENCES

## Sale

Highest need for title/ownership/encumbrance/transfer restriction diligence.

Core checks:

- owner/title chain;
- registration history;
- EC/encumbrance;
- tenure restrictions;
- land-use/planning;
- access/boundaries;
- litigation/acquisition where material;
- category-specific permissions.

## Rent

Typically more focused on:

- authority to let;
- identity of lessor;
- premises/plot identity;
- permitted use;
- lease duration and conditions;
- existing encumbrance/ownership issues relevant to landlord authority;
- site condition/possession;
- local licensing/industrial use where applicable.

Do not require the full sale-title workflow for every simple short-term rental without a risk basis.

## Lease

The Transfer of Property Act defines a lease as a transfer of the right to enjoy immovable property for a certain time or in perpetuity for consideration. The Act also provides registration rules for certain long-duration leases, including leases from year to year or for terms exceeding one year.

Official source:

- https://www.indiacode.nic.in/bitstream/123456789/14648/1/tpa.pdf

For GIDC/industrial leases, the governing lease/allotment framework and authority conditions can be more important than generic residential/rental assumptions.

### UrbanEdge rule

Store `transaction_type` at the verification layer and use a **risk-adjusted checklist** rather than one identical checklist for every transaction.

---

# 42. RED FLAGS

This is intentionally non-exhaustive.

## Ownership / records

- Seller name does not match record.
- Mutation unresolved or disputed.
- Missing source deed.
- Conflicting area/parcel identifiers.
- Old and new documents do not reconcile.
- Inheritance not documented.
- Co-owner consent/authority unclear.

## Tenure / legal restrictions

- New/restricted tenure.
- Premium indicated but no supporting payment/permission evidence.
- Section 73AA or other restricted category.
- Agricultural buyer-eligibility issue.
- Fragmentation concern.
- Government/grant land restrictions.

## Land use / planning

- "NA" claim with no NA order.
- NA order purpose differs from advertised use.
- Zoning inconsistent with intended use.
- TP reservation/road/land deduction risk.
- OP/FP mismatch.
- Development rights claimed without supporting planning evidence.

## Encumbrance / disputes

- Mortgage/charge identified.
- Release document absent.
- Litigation match in eCourts or revenue proceedings.
- Acquisition/reservation notice.
- Disputed possession.

## Industrial/GIDC

- Seller calls leasehold land "freehold".
- Transfer not approved.
- GIDC dues unresolved.
- Subletting without authority.
- Usage not compliant.
- OCA/lease/possession records inconsistent.

## Identity / documents

- Blurry scans only.
- Missing pages.
- Mismatched names/spellings without explanation.
- Signatory lacks authority.
- PoA scope unclear.
- Company/partnership authority absent.

### System behaviour

Any **material red flag** should be able to move a listing to:

`VERIFICATION_BLOCKED`

or

`LEGAL_REVIEW_REQUIRED`

rather than merely showing a warning icon.

---

# 43. WHEN URBANEDGE MUST REFER TO A LAWYER

The following should be treated as lawyer-referral triggers unless counsel-approved policies explicitly say otherwise:

1. Ownership chain uncertainty.
2. Conflicting revenue and registered-document records.
3. Inheritance/succession without a clean documentary chain.
4. Partition/co-ownership disputes.
5. PoA-based offering/transaction.
6. New/restricted tenure or premium issue.
7. Section 73AA / tribal/restricted land issue.
8. Agricultural purchaser-eligibility question.
9. Fragmentation or subdivision legality question.
10. Title-related litigation.
11. Revenue proceedings materially affecting title/possession.
12. Mortgage/charge/release ambiguity.
13. Company/LLP/partnership/trust ownership where authority is unclear.
14. GIDC transfer/lease/subletting/compliance issue.
15. Unclear NA status or NA-purpose mismatch.
16. Zoning/TP/reservation issue that materially affects use/value.
17. Government acquisition concern.
18. High-value or otherwise high-risk transaction.
19. Buyer requests a title opinion or legal certification.
20. Any proposed use of the words `clear title`, `legally verified`, `government approved`, `dispute free`, or similar guarantee language.

Product outcome:

> **LEGAL REVIEW REQUIRED — [reason]**

The system should permit publishing the listing without a misleading verification badge if business chooses, but it should not allow an incompatible badge to be shown.

---

# 44. WHEN A SURVEYOR / PLANNER / ENGINEER IS NEEDED

## Surveyor / mapni specialist

- boundary dispute;
- survey-number mismatch;
- subdivision/part ambiguity;
- area mismatch;
- physical parcel not clearly identifiable;
- legal boundary needs physical measurement.

## Planner / architect

- zoning/land-use interpretation;
- TP/OP/FP interpretation;
- FSI/buildability;
- road-width/building-control questions;
- development permission;
- plotted layout/development potential.

## Engineer / specialist

- infrastructure feasibility;
- industrial utilities;
- access/road design;
- drainage/flood considerations where relevant;
- building/structural/industrial technical questions.

UrbanEdge should preserve role separation:

**lawyer = legal rights/title/permissions**  
**surveyor = physical parcel/boundary measurement**  
**planner/architect = planning/buildability**  
**engineer = technical feasibility**

---

# 45. WHAT THE WEBSITE MUST NEVER CLAIM

The following should be **blacklisted by default**:

- "100% Clear Title"
- "Clear Title Guaranteed"
- "Government Approved" (unless the exact approval and scope are named)
- "Guaranteed Legal"
- "Fully Verified"
- "Dispute Free"
- "No Legal Issues"
- "Guaranteed NA"
- "Guaranteed Construction"
- "Guaranteed FSI"
- "Risk Free Property"
- "All Permissions Complete"
- "No Encumbrances" without a defined and current professional evidence scope
- "Title Certified by UrbanEdge" unless a lawyer-approved process actually exists and the wording is specifically approved.

### Safer replacements

| Avoid | Prefer |
|---|---|
| Clear Title | Documents/Title Records Reviewed — scope shown |
| Legally Verified | Legal Review Completed — defined scope/date |
| Government Approved | [Specific approval] reviewed |
| Fully Verified | Checks Completed — see verification details |
| Dispute Free | Litigation/authority searches completed for stated scope |
| Guaranteed NA | NA Order Reviewed |
| Guaranteed Construction | Planning/buildability information reviewed |

---

# 46. VERIFICATION DATABASE REQUIREMENTS (NO SQL)

The future system should record at least:

### Property-level

- `property_id`
- `property_type`
- `transaction_type`
- `location`
- `survey_no`
- `block_no`
- `city_survey_no`
- `plot_no`
- `tp_scheme_no`
- `op_no`
- `fp_no`
- `authority`

### Verification-level

- `verification_area`
- `check_type`
- `status`
- `source_authority`
- `source_url`
- `source_reference_no`
- `evidence_document_id`
- `evidence_type`
- `reviewer_id`
- `reviewer_role`
- `reviewed_at`
- `recheck_at`
- `notes`
- `exceptions`
- `public_label`
- `public_visibility`
- `confidence` (internal only, not a substitute for legal status)
- `legal_review_required`
- `legal_review_status`
- `professional_scope`

### Crucial separation

`internal_evidence` must be richer than `public_summary`.

The public interface should never expose internal legal notes, private documents, personal IDs, or sensitive reviewer commentary merely because a verification check exists.

---

# 47. RECHECK / EXPIRATION

Verification data becomes stale at different speeds.

## High-change / recheck-priority data

- current ownership / record status;
- EC / registered encumbrances;
- mutation status;
- project/RERA status;
- GIDC transfer/dues/status;
- listing availability;
- permissions that may be amended/revoked;
- planning notifications;
- acquisition/reservation status;
- litigation status.

## Suggested fields

`verified_at`  
`recheck_at`  
`superseded_at`  
`recheck_reason`

Do not invent statutory expiry periods. Use a business-risk recheck schedule unless a specific law/permit establishes a validity period.

### Suggested V1 policy

- listing availability: frequent/current business check;
- official records: recheck before high-value transaction or material buyer request;
- legal review: treat as scoped to opinion date unless counsel states otherwise;
- planning/buildability: recheck when buyer relies on it for a proposed development.

---

# 48. AUDIT TRAIL

Every meaningful verification event should be immutable/history-preserving:

- verification status changed;
- evidence added;
- evidence replaced;
- evidence deleted/revoked;
- reviewer changed;
- legal review requested;
- legal review completed;
- listing published/unpublished;
- public badge changed;
- exception resolved.

Recommended history event structure conceptually:

`WHO → DID WHAT → TO WHICH PROPERTY/CHECK → USING WHICH EVIDENCE → WHEN → RESULT → WHY`

This is an **UrbanEdge operational control**, not a claim that a specific law mandates this exact schema.

---

# 49. PRODUCTION WORKFLOW

## Stage A — Owner submission

Owner/broker submits:

- property details;
- claimed land type;
- claimed tenure/use;
- transaction type;
- documents;
- contact/authority information.

Status:

`SUBMITTED`

## Stage B — Identity check

Confirm basic parcel and location identity.

Status:

`IDENTITY_REVIEW`

## Stage C — Evidence collection

Collect applicable revenue/property/registration/title/planning/GIDC evidence.

Status:

`DOCUMENTS_PENDING` / `DOCUMENTS_READY`

## Stage D — Record checks

Perform defined official source checks.

Status:

`RECORD_CHECK_IN_PROGRESS`

## Stage E — Land-type checks

Agricultural / NA / industrial / GIDC / plotted-development logic.

Status:

`CATEGORY_CHECK_IN_PROGRESS`

## Stage F — Physical/site checks

Location, site observations, access and survey evidence where needed.

Status:

`SITE_CHECKED`

## Stage G — Specialist review

Lawyer / surveyor / planner / engineer as triggered.

Status:

`LEGAL_REVIEW_REQUIRED` / `SURVEY_REVIEW_REQUIRED` / `PLANNING_REVIEW_REQUIRED`

## Stage H — Internal approval

Authorized reviewer confirms that public labels match evidence.

Status:

`APPROVED_FOR_SCOPED_PUBLIC_DISCLOSURE`

## Stage I — Public listing

Show only approved labels with date/scope/disclaimer.

Status:

`PUBLISHED`

## Stage J — Recheck

Recheck when evidence is stale, transaction progresses, seller updates information, or a material event occurs.

Status:

`RECHECK_DUE`

---

# 50. V1 VS ADVANCED VERIFICATION

## V1 — UrbanEdge Internal Verification

Designed for one admin/small team.

### V1 should realistically support

- property identity;
- owner-provided document intake;
- 7/12 / 8A / property-card checks where applicable;
- mutation/VF6 review where available;
- certified Index-2/EC evidence where relevant;
- NA-order review;
- planning/TP/zoning source capture;
- site/location check;
- GIDC records for GIDC property;
- a small, explicit lawyer-referral decision tree;
- scoped public badges;
- audit history;
- recheck dates;
- private evidence vault.

### V1 should not attempt

- automated legal title opinions;
- universal litigation clearance;
- automatic interpretation of every tenure exception;
- automated FSI/buildability guarantees;
- broad legal certifications;
- universal "verified" scoring that hides exceptions.

## Future professional verification service

A separate service can later support:

- partner property-lawyer review;
- surveyor certification;
- planning/FSI reports;
- professional report upload;
- case-specific legal opinion scope;
- lawyer identity/firm metadata;
- renewal/review workflows;
- paid due-diligence reports.

The future service should be architecturally separate from UrbanEdge's ordinary listing-verification workflow so a professional opinion cannot be confused with an admin check.

---

# 51. SOURCE MATRIX

| Document / Check | Authority | Agricultural | NA | Industrial | Purpose | Limitation |
|---|---|---:|---:|---:|---|---|
| 7/12 | Gujarat Revenue / e-Dhara | ✓ | Sometimes historical/context | Sometimes | Revenue record | Not stand-alone title opinion |
| 8A | Gujarat Revenue / e-Dhara | ✓ | Conditional | Conditional | Holding/account cross-check | Not stand-alone title opinion |
| VF6 mutation | Gujarat Revenue | ✓ | ✓ where relevant | ✓ where relevant | Change-of-right history | Underlying source documents still matter |
| Property Card | City Survey / Revenue | Conditional | ✓ | ✓ | Urban property record | Jurisdiction-specific |
| Index-2 | IGR/GARVI | ✓ | ✓ | ✓ | Registered transaction metadata | Not substitute for full deed |
| EC | IGR/GARVI/IORA | ✓ | ✓ | ✓ | Registered encumbrance/search | Not proof of absence of every claim |
| Registered deed | Registration framework | ✓ | ✓ | ✓ | Underlying title/rights instrument | Needs legal interpretation where issues arise |
| NA order | Revenue authority | Conditional | ✓ | Conditional | Land-use conversion | Does not by itself confer unrestricted development rights |
| Tenure/premium order | Revenue authority | ✓ | ✓ | ✓ | Transfer/use restrictions | Conditions are fact-specific |
| Mapni/survey | Revenue survey authority | ✓ | ✓ | ✓ | Boundary/measurement | Physical/legal conclusions may require surveyor |
| TP/OP/FP | Town planning authority | ✓ | ✓ | ✓ | Reconstitution/planning | Scheme status must be current |
| DP/zoning | Planning authority | ✓ | ✓ | ✓ | Permitted land use | Does not by itself prove title |
| GIDC allotment/lease | GIDC | — | — | ✓ | Lease/allotment rights | GIDC regime differs from ordinary freehold |
| GIDC transfer | GIDC | — | — | ✓ | Transfer permission | Policy/workflow can change |
| RERA registration | GujRERA | Conditional | Conditional | Conditional | Project/regulatory status | Not every private land sale is a project |
| eCourts | eCourts/NIC | ✓ | ✓ | ✓ | Court-search screening | Online data not complete legal evidence |
| Revenue cases | Gujarat Revenue | ✓ | ✓ | ✓ | Revenue dispute screening | Scope-specific |
| Jantri | IGR/GARVI | ✓ | ✓ | ✓ | Government valuation reference | Not market-price guarantee |

---

# 52. RECOMMENDED FINAL PUBLIC VERIFICATION MODEL

## 52.1 Public badges

Use scoped badges:

- **Information Provided**
- **Documents Reviewed**
- **Source Verified**
- **Location Checked**
- **Site Visit Completed**
- **Revenue Records Reviewed**
- **Registration Records Reviewed**
- **Planning/Zoning Check Completed**
- **GIDC Records Reviewed**
- **Legal Review Completed — Scoped**

## 52.2 Internal statuses

Recommended controlled statuses:

`SUBMITTED`  
`IDENTITY_REVIEW`  
`DOCUMENTS_PENDING`  
`DOCUMENTS_REVIEWED`  
`RECORD_CHECK_IN_PROGRESS`  
`CATEGORY_CHECK_IN_PROGRESS`  
`SITE_CHECKED`  
`LEGAL_REVIEW_REQUIRED`  
`SURVEY_REVIEW_REQUIRED`  
`PLANNING_REVIEW_REQUIRED`  
`VERIFICATION_BLOCKED`  
`APPROVED_FOR_SCOPED_PUBLIC_DISCLOSURE`  
`PUBLISHED`  
`RECHECK_DUE`  
`SUSPENDED`

## 52.3 Evidence requirements

Every public check must have:

- evidence source;
- evidence type;
- reviewer;
- review date;
- exact scope;
- unresolved exceptions;
- recheck date where appropriate.

## 52.4 Lawyer-required conditions

A legal review flag is mandatory where the evidence set contains material uncertainty or where the public claim itself could reasonably be understood as a legal conclusion.

## 52.5 Never to claim

No blanket:

- clear title;
- guaranteed legal;
- dispute free;
- government approved;
- guaranteed construction;
- fully verified.

---

# 53. URBANEDGE LAND SPACE — LEGAL/VERIFICATION IMPLEMENTATION RULES

These rules should be treated as **hard product constraints** unless a qualified lawyer intentionally approves a change.

1. **Never represent `verification_complete=true` as “clear title”.**
2. Verification must be **scoped by check type**.
3. A property can be verified for one dimension and unresolved for another.
4. A 7/12 record is not, by itself, a title guarantee.
5. An 8A record is complementary evidence, not a stand-alone title certificate.
6. A VF6 mutation entry is a record of change; preserve and, where material, inspect the underlying source document/order.
7. Index-2 is not a substitute for the underlying registered deed where deed content matters.
8. EC/search results do not prove absence of every possible legal claim.
9. Uploaded documents must be marked as **owner/broker supplied** unless independently source-verified.
10. `DOCUMENT REVIEWED` and `SOURCE VERIFIED` must be different statuses.
11. NA permission and development/building permission must be separate fields/checks.
12. Never convert `NA = yes` into `construction_allowed = yes`.
13. Never convert `industrial = yes` into unrestricted development rights.
14. GIDC property must record lease/allotment structure separately from ordinary ownership assumptions.
15. GIDC transfer/subletting/mortgage/dues checks must use current GIDC workflow/evidence.
16. TP/OP/FP must be captured where applicable; do not rely only on the original survey identity in TP areas.
17. Zoning/planning checks must be independent of title checks.
18. FSI/buildability claims require current planning evidence and, where material, professional review.
19. Agricultural purchaser-eligibility issues must be treated as conditional and escalated when uncertain.
20. New/restricted tenure, premium, tribal/restricted land, fragmentation and government-grant conditions must never be flattened into a simple “clear” flag.
21. PoA-based authority must trigger explicit authority review.
22. Entity-owned property must have authority/signatory evidence.
23. Court/revenue searches must record their scope and search date.
24. No search result may be described as proof that “no dispute exists”.
25. Private evidence documents must never be publicly accessible by default.
26. Verification documents should not be copied into analytics/logging payloads.
27. Every verification result must be attributable to a reviewer/role and date.
28. Replaced evidence must not silently erase prior verification history.
29. Public badges must link to a clear “what was checked / what was not checked” explanation.
30. Public verification language must not imply government certification unless the exact government certification exists and is accurately described.
31. Legal-review status must be distinct from ordinary admin-review status.
32. Professional review must record professional role, scope, date and evidence reviewed.
33. Lawyer-review status does not automatically become a universal “clear title” status.
34. Recheck dates are risk-control dates, not invented statutory expiry dates.
35. The source authority and URL should be recordable for every important check.
36. Current official source data should outrank cached or user-supplied legal summaries.
37. If official sources conflict or are incomplete, the property must move to **REVIEW REQUIRED**, not to an optimistic interpretation.
38. Seller-supplied claims such as “NA”, “old tenure”, “industrial approved”, “RERA”, “road touch”, “TP final plot”, or “clear title” must be treated as **claims to verify**, not as verified facts.
39. Any proposed use of `verified`, `legal`, `clear title`, `government approved`, or equivalent high-confidence language must be reviewed by counsel before production release.
40. The final system must preserve the distinction among **law**, **official administrative practice**, **professional due diligence**, and **UrbanEdge policy**.

---

# 54. CURRENT RESEARCH NOTES / IMPORTANT AMBIGUITIES

## 54.1 Gujarat online records are broad but not self-executing legal opinions

The official Gujarat portal ecosystem provides extensive access to revenue records, property cards, Index-2, EC and related services. That creates a strong foundation for a verification workflow but does not eliminate legal interpretation.

## 54.2 Official manuals may be older than current policy

The Revenue Collector Manual and some procedural documents are useful operational references, but UrbanEdge should check whether a newer Government Resolution, notification, statutory amendment or digital workflow has superseded a particular procedural detail before hard-coding it.

## 54.3 DPDP implementation is staged

The 2025 Rules have staged commencement. Product counsel should maintain a current effective-date matrix rather than treating all rules as operative immediately.

## 54.4 RERA applicability is fact-specific

Do not implement “all plotted land = RERA” or “all land sales = outside RERA”. Determine whether the facts fit a real-estate project/promoter model and check the applicable exemptions/rules/current Gujarat practice.

## 54.5 Planning status is location-specific

Ahmedabad and Gandhinagar can involve different authorities, plans, schemes, and jurisdictional boundaries. The listing address is not enough to pick a planning regime.

---

# 55. RESEARCH-BASED OPERATIONAL MINIMUM FOR V1

For a practical single-admin V1 in Ahmedabad/Gandhinagar, the minimum defensible verification package should normally be:

### Identity

- survey/block/city survey/property-card identifier;
- map/location;
- claimed land type;
- transaction type.

### Seller / authority

- seller/offeror identity;
- evidence of authority to offer property;
- PoA/entity issues flagged.

### Records

- applicable 7/12 / property card;
- 8A where relevant;
- VF6/mutation where material;
- Index-2 / registered-document evidence;
- EC/search where appropriate.

### Land-use / planning

- tenure/restriction;
- NA order if claimed;
- industrial/GIDC evidence if claimed;
- zoning/TP/OP/FP where relevant.

### Physical

- location check;
- site visit for higher-confidence badges;
- legal access risk recorded.

### Risk

- red-flag screen;
- litigation/referral trigger;
- lawyer referral where needed.

### Public

- no generic green “verified” badge;
- checks-completed panel;
- date/scope/disclaimer;
- seller-provided vs independently verified evidence distinction.

This is operationally achievable without pretending UrbanEdge is a title-certification institution.

---

# 56. SOURCES — DETAILED SOURCE TABLE

**Research access date for the table below:** 29 August 2026, unless a source itself states another update/effective date.

| ID | Authority | Document / Page | URL | Legal / Administrative Role | Date / status | Used for |
|---|---|---|---|---|---|---|
| S1 | Government of Gujarat — Revenue Department | Revenue Department home / online services | https://revenuedepartment.gujarat.gov.in/ | Primary state revenue authority | Portal present at research date | General revenue, online records, cases, property cards |
| S2 | Gujarat Informatics Ltd. / Gujarat Govt. | e-Dhara | https://gil.gujarat.gov.in/edhara | Official land-record system description | Crawled Aug-2026 | 7/12, 8A, VF6, computerized records |
| S3 | Gujarat Informatics Ltd. / Gujarat Govt. | e-Gram land-record services | https://gil.gujarat.gov.in/eGram | Official service delivery | Crawled Aug-2026 | RoR service availability |
| S4 | Gujarat Revenue Department | IORA Service | https://revenuedepartment.gujarat.gov.in/iora-service | Official revenue application/service catalogue | Updated page 2025 / current portal | Property card, Index-2, EC, survey, tenure, premium, NA |
| S5 | Inspector General of Registration / Govt. Gujarat | GARVI 2.0 | https://garvi.gujarat.gov.in/ | Registration, valuation, indexing, search and certified-document ecosystem | **Last updated 27-Aug-2026** on portal | Index-2, EC, document copy, Jantri, registration |
| S6 | Gujarat Revenue Department | Collector Manual | https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf | Official administrative manual | Published/updated portal record 2025; use with current-law check | NA, tenure, mutation, planning/development distinction |
| S7 | Gujarat Revenue Department | NA permission procedure | https://revenuedepartment.gujarat.gov.in/downloads/gr_01072008_k_eng.pdf | Official administrative procedure | Government procedural document | Section 65 application workflow |
| S8 | Government of India / India Code | Gujarat Land Revenue Code, 1879 | https://www.indiacode.nic.in/handle/123456789/3215 | State statute indexed by India Code | Official consolidated source, update caveat | Sections 65, 65A, 65B, etc. |
| S9 | Government of India / India Code upload | Gujarat Land Revenue Code PDF | https://upload.indiacode.nic.in/showfile?actid=AC_GJ_66_229_00001_00001_1538202660452&filename=landrevenuecode.pdf&type=actfile | Statutory text | PDF source accessed Aug-2026 | 65/65A/65B, land-use provisions |
| S10 | Gujarat Revenue Department | Section 73A / 73AA resource | https://revenuedepartment.gujarat.gov.in/land-revenue-code-section-73a-73aa | Official subject-specific government resource | Current portal resource | Restricted/tribal land issues |
| S11 | Government of India / India Code | Gujarat Tenancy and Agricultural Lands Act, 1948 | https://www.indiacode.nic.in/bitstream/123456789/3208/2/tenancyandagriculturalland.pdf | Primary statutory text | Official source | Agricultural transfer restrictions / purchaser issues |
| S12 | Government of India / India Code | Bombay/Gujarat Fragmentation Act text | https://www.indiacode.nic.in/bitstream/123456789/4608/1/preventionoffragmentationact.pdf | Primary statutory text applicable as law | Official source | Fragmentation / transfer restrictions |
| S13 | Government of India / India Code | Registration Act, 1908 | https://www.indiacode.nic.in/bitstream/123456789/19013/1/the_registration_act%2C_1908.pdf | Central registration statute | Official source | Registration / registered instruments |
| S14 | Government of India / India Code | Transfer of Property Act, 1882 | https://www.indiacode.nic.in/handle/123456789/2338 | Central property-transfer statute | Official source | Sale, mortgage, lease, transfer concepts |
| S15 | Government of India / India Code | Transfer of Property Act PDF | https://www.indiacode.nic.in/bitstream/123456789/14648/1/tpa.pdf | Central statutory text | Official source | Lease / registration of long leases |
| S16 | Government of India / India Code | Indian Easements Act, 1882 | https://www.indiacode.nic.in/handle/123456789/2349 | Central easements statute | Official source | Right of way / easements |
| S17 | Government of India / India Code | Specific Relief Act, 1963 | https://www.indiacode.nic.in/handle/123456789/12938 | Central civil-remedy statute | Official source | Title/contract dispute context |
| S18 | Gujarat Revenue Department | City Survey / property-card notification material | https://revenuedepartment.gujarat.gov.in/downloads/notification-09052017-n.pdf | Official city-survey/property-card structure | Government notification | Property-card fields, urban records |
| S19 | Gujarat Revenue Department | H Branch | https://revenuedepartment.gujarat.gov.in/branch/h-branch | Official departmental functions | Current portal | Survey, settlement, city survey |
| S20 | AUDA | Revised Development Plan 2021 / planning resources | https://www.auda.org.in/rdp/ | Official development-plan and GDCR resource | Page last updated 03-Apr-2024; verify latest scheme/plan separately | Ahmedabad planning |
| S21 | AUDA | Development / land-use / TP information | https://www.auda.org.in/Content/development-46 | Official planning information | Current page accessed Aug-2026 | Zoning, TP schemes, land-use |
| S22 | Government of Gujarat / GIDC | CGDCR 2017 notification | https://gidc.gujarat.gov.in/pdf/Circular/Circular-%20ATP%20dtd%2022.12.2017.pdf | Official development-control regulation notification | Government notification | GDCR / planning controls |
| S23 | GIDC | Regulations | https://gidc.gujarat.gov.in/Pages/Contents/Regulations | Official GIDC regulatory source | **Site updated Aug-2026** | GIDC regulations |
| S24 | GIDC | Rules | https://gidc.gujarat.gov.in/Pages/Contents/rules | Official GIDC rules page | **Last updated 27-Aug-2026** on site | GIDC Rules 1963 |
| S25 | GIDC | Allotment of properties | https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties | Official current allotment process | Current page accessed Aug-2026 | Lease tenure, allotment, possession |
| S26 | GIDC | Post-operation services | https://gidc.gujarat.gov.in/Pages/Contents/post-operation | Official current service list | Current page accessed Aug-2026 | Lease, transfer, mortgage, subletting, dues |
| S27 | GIDC | Application guidelines | https://gidc.gujarat.gov.in/Pages/Contents/application-guiedline | Official current workflow/checklists | Current page accessed Aug-2026 | Transfer, lease, sublet etc. |
| S28 | GIDC | Transfer application documents | https://gidc.gujarat.gov.in/pdf/Application/Transfer.pdf | Official transfer checklist | Current linked official document | GIDC transfer |
| S29 | GIDC | Lease tenure information | https://gidc.gujarat.gov.in/pdf/Information-pertaining-to-lease-tenure.pdf | Official GIDC policy communication | 2020 document, still official; recheck current policy | GIDC long-term lease structure |
| S30 | GIDC | 2024 land allotment/utilization/transfer policy | https://gidc.gujarat.gov.in/Document/LinkManagment/Circulars/pre-alt-1718102024013709.pdf | Official GIDC policy | **18-Oct-2024** | Current-policy baseline for transfer/allotment, subject to later amendments |
| S31 | Government of India / India Code | RERA Act 2016 | https://www.indiacode.nic.in/handle/123456789/2158 | Central real-estate statute | Official source | RERA applicability / agents / plotted projects |
| S32 | Government of India / India Code | RERA Section 3 | https://www.indiacode.nic.in/show-data?actid=AC_CEN_17_19_00033_201616_1517807328405&orderno=3&sectionId=8627&sectionno=3 | Statutory registration requirement | Official source | Plot-project registration |
| S33 | Gujarat RERA | Official Gujarat RERA portal | https://gujrera.gujarat.gov.in/ | State RERA authority portal | Current portal accessed Aug-2026 | Project / promoter checks |
| S34 | Government of India / MeitY | DPDP Act 2023 | https://www.indiacode.nic.in/indiacode/handle/123456789/22037 | Central privacy law | Official source | Privacy framework |
| S35 | MeitY | DPDP Rules 2025 | https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa | Official rules + enforcement timeline | Published 14-Nov-2025 | Current staged commencement |
| S36 | Gazette of India / MeitY | DPDP Rules 2025 notification | https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf | Official Gazette | **13-Nov-2025** | Commencement timing |
| S37 | Department of Consumer Affairs | Consumer Protection Act / rules | https://consumeraffairs.nic.in/acts-and-rules/consumer-protection/consumer-protection | Official consumer-law source | Page last updated 16-Jun-2025 | Misleading representations / advertising |
| S38 | Department of Consumer Affairs | Misleading Advertisement Guidelines 2022 | https://consumeraffairs.nic.in/latestnews/guidelines-prevention-misleading-advertisements-and-endorsements-misleading | Official CCPA guideline source | **09-Jun-2022** publication | Risk of misleading verification claims |
| S39 | eCourts / NIC | eCourts public search / help | https://ecourts.gov.in/ecourts2.0/ | Official court information service | Current page last updated 11-Apr-2026 | Litigation searches |
| S40 | Government of India / India Code | Companies Act 2013 | https://www.indiacode.nic.in/handle/123456789/2114 | Central corporate statute | Official source | Company-owned property authority |
| S41 | Government of India / India Code | Indian Partnership Act 1932 | https://www.indiacode.nic.in/handle/123456789/2394 | Central partnership statute | Official source | Partnership authority/property |
| S42 | Gujarat Revenue Department | Land acquisition rules, 2017 | https://revenuedepartment.gujarat.gov.in/downloads/act_13102017.pdf | Official Gujarat land-acquisition rule source | Government notification/rules | Acquisition risk |
| S43 | India Code | Gujarat Town Planning and Urban Development Act text | https://www.indiacode.nic.in/bitstream/123456789/4658/1/tpudact.pdf | Statutory planning framework | Official source | OP/FP, planning scheme terminology |

### Secondary sources used

This report intentionally minimizes secondary-source dependence. The main research conclusions are anchored in official Gujarat/India sources above. Secondary legal commentary was not treated as the controlling source for statutory conclusions.

---

# 57. FINAL RECOMMENDATION

UrbanEdge Land Space should position its verification product as a **transparent evidence-and-review system**, not as a digital title-certification service.

The safest product promise is:

> **We show what was checked, what evidence was reviewed, when it was checked, and what remains outside the scope of that review.**

That positioning is stronger operationally than an overbroad "Verified" badge because it is auditable, explainable, scalable across Ahmedabad/Gandhinagar, and capable of incorporating lawyers, surveyors and planning professionals without making UrbanEdge itself pretend to be one of them.

**Any production launch of public legal/verification badges should be preceded by review from a qualified Gujarat property lawyer, with written approval of the badge vocabulary, disclosure text, legal-referral rules and V1 evidence thresholds.**

---

**End of report.**
