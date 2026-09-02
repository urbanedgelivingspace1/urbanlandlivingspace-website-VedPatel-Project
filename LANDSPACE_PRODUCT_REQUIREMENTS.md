# URBANEDGE LAND SPACE — PRODUCT & BUSINESS REQUIREMENTS

**Document:** `LANDSPACE_PRODUCT_REQUIREMENTS.md`  
**Product:** UrbanEdge Land Space  
**Document type:** Business + Product Requirements / Coding-Agent Handoff  
**V1 geography:** Ahmedabad + Gandhinagar, Gujarat  
**Research date:** 29 August 2026  
**Status:** V1 authoritative scope unless a later client decision explicitly supersedes it

---

## 0. Executive Summary

UrbanEdge Land Space is a **brokerage-led land discovery and lead-management product** for Ahmedabad and Gandhinagar. It is a separate product from UrbanEdge Living Space and is intentionally limited to land rather than built residential/commercial inventory.

The V1 inventory model is:

- Agricultural Land
- Non-Agricultural / NA Land
- Industrial Land

The supported business intents are:

- Buy
- Rent
- Lease
- Sell Your Land

The key product distinction is that **Buy / Rent / Lease are discovery workflows**, while **Sell Your Land is an owner submission and lead-generation workflow**. Owners cannot instantly publish inventory to the public site. Their submission enters an UrbanEdge review queue and can be converted into a public listing only after the brokerage decides to publish it.

This model fits the way land brokerage differs from a general open classifieds marketplace: parcel information is often incomplete, location can be sensitive, ownership/title and land-use details matter, and a human brokerage layer is valuable.

Government research confirms that Gujarat has separate public systems for land records, registration, property cards, Jantri/rate information, and other revenue services. e-Dhara supports Rural Record of Rights including VF6, 7/12 and VF8A; the Gujarat registration/stamps department separately exposes document registration, property search, Jantri, market-value calculation, EC, Index-2 and certified-copy services. These systems should be treated as **authoritative external references**, not silently replaced by a proprietary UrbanEdge “verified” flag. [Gujarat Informatics / e-Dhara](https://gil.gujarat.gov.in/edhara/); [Gujarat Revenue Department iORA](https://revenuedepartment.gujarat.gov.in/iora-service); [Inspector General of Registration & Superintendent of Stamps](https://stampsregistration.gujarat.gov.in/).

UrbanEdge Land Space should therefore compete primarily on:

1. **Curated land inventory**
2. **Better land-specific structured information**
3. **Local Ahmedabad/Gandhinagar knowledge**
4. **Fast human enquiry handling**
5. **Transparent, scoped verification signals**
6. **Site-visit coordination**
7. **A simple internal CRM that ties inquiries to properties and outcomes**
8. **Strong location/category SEO without publishing unsafe or low-quality thin pages**

It should **not** attempt to become a land-record authority, title-insurance product, legal due-diligence firm, public agent marketplace, payment platform, or full self-service transaction/registration platform in V1.

---

# 1. Product Definition

## 1.1 What UrbanEdge Land Space is

UrbanEdge Land Space is a **curated land brokerage + property discovery + lead-management platform** operated by UrbanEdge.

The public website helps people discover land and start a conversation with UrbanEdge. The internal system manages:

- inventory
- owner submissions
- inquiries
- buyer requirements
- qualification
- site visits
- negotiation follow-up
- property verification evidence
- publishing
- content
- basic analytics

The product is designed around the assumption that the actual transaction remains a human-assisted brokerage process.

### Core proposition

> Find suitable land faster, understand the important parcel information more clearly, and connect with UrbanEdge for qualification, site visits and transaction assistance.

The product should be positioned as **curated brokerage inventory**, not “every property in the market.”

---

## 1.2 Separation from UrbanEdge Living Space

UrbanEdge Land Space is intentionally separate from:

**UrbanEdge Living Space**  
Existing site: https://www.urbanedgelivingspace.com/

UrbanEdge Living Space focuses on built residential and commercial real estate.

**UrbanEdge Land Space** focuses only on land:

- Agricultural
- NA
- Industrial

The products may eventually share business infrastructure, analytics conventions, design language or CRM technology, but the public positioning, data model and discovery UX should remain land-specific.

---

## 1.3 V1 Geographic Scope

### Included

- Ahmedabad
- Gandhinagar

The system should store geography hierarchically so that later expansion does not require redesign:

`State → District → Taluka → Village/Locality → optional micro-location`

For V1, Gujarat is the state boundary and Ahmedabad/Gandhinagar are the active districts/markets.

### Future

Phase 2:

- broader Gujarat

Phase 3:

- selected Indian states/cities

The data model should not hard-code Ahmedabad and Gandhinagar as the only possible districts.

---

# 2. Business Model

## 2.1 Brokerage Model

UrbanEdge is the intermediary.

The site is intended to:

1. attract potential buyers/lessees
2. present curated inventory
3. capture high-intent inquiries
4. qualify the requirement
5. coordinate communication
6. arrange site visits
7. support negotiation
8. help progress the transaction offline

The website is therefore a **conversion engine for brokerage**, not the transaction itself.

---

## 2.2 Public vs Internal Information

### Public

Appropriate public listing information can include:

- Property ID
- land category
- transaction type
- broad location
- area
- price display mode
- road/frontage information where approved for publication
- land-use/zone information where supported by evidence
- selected verification badges with exact definitions
- photos
- selected video/360/PDF assets
- connectivity
- inquiry/WhatsApp/call/site-visit CTAs

### Internal

Keep private:

- owner personal information
- owner phone/email where not intentionally public
- full title-chain documents
- internal legal comments
- document copies
- internal verification notes
- broker source/contact
- negotiation notes
- confidential exact parcel coordinates unless intentionally published
- bypass-risk notes
- private commission information
- internal rejection reason where appropriate

---

# 3. Target Users

Only personas that materially affect the V1 product are included.

## 3.1 Individual Land Buyer / Investor

### Goal

Find a land parcel that fits:

- location
- size
- budget
- land type
- intended use
- road access
- development context
- investment objective

### Information needed

- parcel size
- usable/displayed unit
- exact or approximate location
- road access
- land classification
- development/zone information where available
- price or price-on-request
- ownership/availability signal
- photos
- proximity to important roads/landmarks
- verification status

### Trust concern

“Is the property actually available and is the information reliable?”

### Primary conversion

Inquiry / WhatsApp / Call / Site Visit.

---

## 3.2 Farmer / Agricultural Buyer

### Goal

Acquire agricultural land for cultivation, farm use or another permitted purpose.

### Information needed

- village/taluka
- area
- soil information if reliably available
- irrigation/water
- road access
- electricity where relevant
- present agricultural use
- land tenure/status when known
- asking price
- document/record review status

### Trust concern

Land status, ownership, access and agricultural-land transfer restrictions can materially affect the transaction.

### Primary conversion

Inquiry followed by human qualification.

**Important:** Do not let the UI suggest that every visitor is legally eligible to purchase agricultural land. Gujarat agricultural land transfer restrictions can apply. The Gujarat Tenancy and Agricultural Lands Act contains restrictions relating to transfers to non-agriculturists and provides for permissions in specified circumstances. Any buyer eligibility statement must be reviewed against the applicable current law and facts.

---

## 3.3 Developer / Builder

### Goal

Find larger parcels with development potential.

### Information needed

- total land area
- survey/block/TP/FP identifiers where appropriate and approved
- zone/use information
- road width/frontage
- surrounding development
- planning authority
- access
- parcel configuration
- title/document review status
- seller intent
- price expectation
- potential for aggregation

### Trust concern

Whether the land-use claims and development assumptions are supported by actual planning/revenue documents.

### Primary conversion

Call / inquiry / site visit / requirement registration.

---

## 3.4 Industrial Business / Manufacturer / Logistics Operator

### Goal

Find land suitable for a specific industrial or logistics use.

### Information needed

- industrial classification / estate
- authority
- area
- road access
- road width/frontage
- power
- water
- gas where relevant
- drainage
- connectivity to highways / logistics nodes
- GIDC status where relevant
- development permissions / infrastructure
- price or lease economics

### Trust concern

Industrial land is not interchangeable: regulatory status, infrastructure and permitted use matter.

GIDC's official materials show that GIDC estates have structured allotment mechanisms, estate categories, infrastructure and specific land/allotment policies. Current GIDC information also publishes FY 2026–27 allotment prices by estate, showing the practical importance of distinguishing GIDC inventory from privately marketed industrial land. [GIDC Allotment of Properties](https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties); [GIDC Allotment Price](https://gidc.gujarat.gov.in/allotmentprice/).

### Primary conversion

Qualified industrial inquiry / site visit / requirement brief.

---

## 3.5 Landowner / Seller

### Goal

Find a serious buyer or lessee.

### Problems

- does not know what information a broker needs
- may not want exact location publicly disclosed
- may not know how to present documents
- may receive low-quality leads
- may fear broker bypass

### Primary conversion

Submit Sell Your Land form.

---

## 3.6 NRI / Remote Investor

Included only as a secondary segment in V1.

They need:

- clear location
- transparent photos/video
- document checklist
- human contact
- remote site-visit coordination
- structured follow-up

Do not build a separate NRI product in V1.

---

# 4. Land Category Model

## 4.1 Agricultural Land

Agricultural land is land represented for agricultural use or agricultural classification in the applicable records/context.

The product should capture:

- land category = Agricultural
- district
- taluka
- village
- area
- local unit if needed
- standardized area
- land tenure/status when known
- survey/block identifiers internally
- water/irrigation
- road access
- electricity if relevant
- soil information only when supported by owner/site information
- cultivation/current-use notes
- fencing/boundary
- nearby connectivity
- price model
- media
- verification status

### Product warning

Agricultural ownership and transfer eligibility can involve Gujarat-specific legal restrictions. Avoid claims such as:

- “Anyone can buy”
- “100% clear”
- “No permission required”
- “Suitable for conversion”

unless a legally qualified professional has confirmed the specific facts.

---

# 4.2 NA Land

“NA” should be treated as a **land-status/use classification signal**, not automatically as “anything can be built here.”

Relevant UI data can include:

- NA status
- approved use/category if supported
- zone/use designation
- local planning authority
- access
- road width
- development context
- document/status evidence
- survey/TP/FP/plot references
- price model

Gujarat government material states that non-agricultural permission is governed through the Gujarat Land Revenue Code and related processes, and that local planning/development permissions can be relevant. The Collector Manual specifically discusses NA permission and checking issues including legal occupancy, new/restricted tenure, premium and disputes. [Gujarat Revenue Department Collector Manual, Chapter 16](https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf); [Gujarat Land Revenue Code](https://revenuedepartment.gujarat.gov.in/downloads/act_BLRC_1879_n.pdf).

### Product principle

Never equate:

`NA = development guaranteed`

Instead:

`NA = stated land-use/status information, subject to document and authority review`

---

# 4.3 Industrial Land

Industrial land requires a deeper structure because private industrial land and authority-controlled industrial estate land are different commercial products.

V1 should capture:

- industrial category
- estate / industrial park name
- authority
- GIDC / non-GIDC
- area
- dimensions
- road frontage
- road width
- power availability
- water
- drainage
- gas where relevant
- logistics connectivity
- permitted/indicated use where documented
- land-use status
- price / lease economics
- infrastructure notes
- site visit availability

GIDC's official site states that its estates are industrially planned and provides details about allotment, infrastructure and estate status. It also states that GIDC land is classified as non-agricultural for its estates and describes its own allotment and transfer framework. UrbanEdge should not extend those GIDC statements to privately owned industrial land. [GIDC — Advantage of being in GIDC Estate](https://gidc.gujarat.gov.in/Pages/Contents/Advantage%20of%20being%20in%20GIDC%20Estate); [GIDC — Allotment of Properties](https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties).

---

# 5. Shared vs Category-Specific Data

## 5.1 Shared core fields

All property records should support:

- Property ID
- listing title
- transaction type
- land category
- listing status
- availability status
- district
- taluka
- village/locality
- broad address
- location mode
- coordinates if available
- land area
- standardized area
- local area value/unit
- price mode
- price
- description
- road access
- verification signals
- media
- nearby connectivity
- internal owner relationship
- public/private notes
- publish date
- updated date
- archive date

## 5.2 Agricultural-only / agricultural-priority fields

- irrigation
- water source
- soil type
- cultivation status
- crop/current use
- fencing
- farm access
- agricultural tenure/status notes
- agricultural eligibility review note

## 5.3 NA-only / NA-priority fields

- NA status
- NA purpose/use
- zone
- planning authority
- TP/FP/OP details where relevant
- development permission status
- road reservation / planning notes where relevant

## 5.4 Industrial-only / industrial-priority fields

- GIDC status
- industrial estate
- industrial use/category
- plot/shed type
- infrastructure
- power
- water
- drainage
- gas
- road width
- loading/logistics context
- authority
- environmental/approval notes where supplied
- industrial lease/allotment information where applicable

---

# 6. Transaction Types

## 6.1 BUY

Public discovery intent.

Users can:

- search
- filter
- open detail
- inquire
- WhatsApp
- call
- request site visit

Internal lifecycle:

`Inquiry → Qualification → Site Visit → Negotiation → Closed Won/Lost`

---

## 6.2 RENT

Use primarily for shorter-term possession/occupation arrangements where marketed as rent.

The UI should not force legal terminology.

A listing can show:

- Rent
- amount per month/year where applicable
- deposit/other commercial terms where intentionally published
- minimum term where known

The public product should not label a property as “rent” solely based on a broker assumption where the owner is really offering a lease.

---

## 6.3 LEASE

Lease should be a separate searchable transaction type because it is commercially common in land/industrial contexts and can involve a defined term and contractual rights.

The Transfer of Property Act defines a lease as transfer of a right to enjoy immovable property for a certain time in consideration of value. The Registration Act requires registration for leases from year to year, for a term exceeding one year, or reserving yearly rent, subject to statutory provisions. This is legal context, not a substitute for drafting/review of the individual contract. [India Code — Transfer of Property Act, 1882](https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse); [Registration Act, 1908 — Section 17](https://indiacode.ecourtsindia.com/registration-act/section/17/).

### Product recommendation

Treat Rent and Lease as separate **commercial filters**, but allow admin to select one or both based on owner wording.

Do not encode a simplistic rule that “rent always means X years” or “lease always means Y years.”

---

# 7. SELL YOUR LAND

## 7.1 UX distinction

**Buy / Rent / Lease** = “I am looking for land.”

**Sell Your Land** = “I have land and want UrbanEdge to market/help transact it.”

The Sell Your Land page must not imply instant publication.

Expected message:

> Submit your land details. Our team will review the information and contact you before the property is listed.

---

## 7.2 Owner Submission Form — V1

### Step 1 — Intent

- Sell
- Lease
- Rent

Optional:
- Sell/lease both
- Best offer

### Step 2 — Land Type

- Agricultural
- NA
- Industrial

### Step 3 — Owner

Required:

- full name
- mobile
- email optional
- preferred contact method
- ownership relationship:
  - Owner
  - Co-owner
  - Authorized representative
  - Broker/intermediary
  - Other

### Step 4 — Location

- district
- taluka
- village/locality
- broad address
- survey/block number optional in public-facing form but required internally where available
- map pin
- location visibility preference:
  - exact
  - approximate
  - hidden

### Step 5 — Land Area

Capture:

- numeric area
- original/local unit
- standardized square feet
- standardized square yard
- standardized square metre
- standardized acre/hectare where applicable

Keep the source value; do not silently overwrite the owner's original unit.

### Step 6 — Commercials

- asking price
- price display preference
- total price
- per unit price
- negotiable?
- rent/lease amount where applicable
- preferred deal terms
- minimum acceptable price (internal/private)

### Step 7 — Property Data

Category-specific fields.

### Step 8 — Media

- photos
- video URL
- drone video URL
- brochure PDF
- 360° link

### Step 9 — Documents

Allow owner to provide documents for internal review.

Suggested examples:

- land record / RoR
- sale deed / title document
- property card where relevant
- NA order where relevant
- tax/assessment evidence where applicable
- survey/map/sketch
- authority approvals where applicable
- GIDC/allotment documents where applicable

Do not present this list as a legally complete due-diligence checklist.

### Step 10 — Consent

Required:

- permission for UrbanEdge to contact the owner
- declaration that provided information is submitted for review
- privacy consent
- acknowledgement that publication is subject to UrbanEdge review
- acknowledgement that document submission does not equal legal certification

---

# 8. Owner Submission Internal Workflow

Recommended V1 workflow:

`Submitted`
→ `Contacted`
→ `Documents Requested`
→ `Under Review`
→ `Verification In Progress`
→ `Approved for Listing`
→ `Published`
→ `On Hold`
→ `Rejected`
→ `Closed`

### Definitions

**Submitted**  
Form received; no human review completed.

**Contacted**  
UrbanEdge has attempted/contacted the owner.

**Documents Requested**  
Additional records needed before review can proceed.

**Under Review**  
UrbanEdge is checking the submission, inventory quality and supporting information.

**Verification In Progress**  
Specific evidence checks are being performed.

**Approved for Listing**  
UrbanEdge has decided the property can be represented publicly with the current information and disclaimers.

**Published**  
Public listing is live.

**On Hold**  
Temporarily not marketable due to owner instruction, documentation gap, price update, availability uncertainty or other operational reason.

**Rejected**  
UrbanEdge will not publish it.

**Closed**  
Submission no longer active.

---

# 9. Property Status Model

V1 needs separate **listing status** and **availability status**.

## Listing status

- Draft
- Review
- Published
- Archived

## Availability

- Available
- Temporarily unavailable
- Under negotiation
- Sold
- Leased
- Rented
- Withdrawn

This separation prevents confusion such as a property being “Published” but no longer available.

---

# 10. Property ID

Every public listing must receive a stable unique Property ID.

Recommended display style:

`UE-LS-000001`

or category-prefixed later:

`UE-AG-000001`  
`UE-NA-000001`  
`UE-IN-000001`

### V1 recommendation

Use one sequential UrbanEdge Land Space identifier:

`UE-LS-000001`

The category should be a separate field, not embedded as the only meaning of the ID.

Reasons:

- easier search
- easier CRM association
- easier WhatsApp communication
- easy verbal reference
- future category changes do not require changing the ID

Property IDs must never be reused after archival.

---

# 11. Homepage

## Must Have

Homepage should immediately communicate:

- UrbanEdge Land Space
- Ahmedabad + Gandhinagar
- Agricultural / NA / Industrial
- Buy / Rent / Lease
- curated brokerage model
- search
- Sell Your Land CTA
- enquiry CTA
- featured/new inventory
- trust/verification philosophy
- location/category navigation
- concise guides section

### Suggested hero structure

**Headline**

> Land opportunities, curated by UrbanEdge.

**Supporting line**

> Agricultural, NA and industrial land across Ahmedabad and Gandhinagar, with local guidance from enquiry to site visit.

Primary CTA:
`Explore Land`

Secondary CTA:
`Sell Your Land`

---

# 12. Category Pages

Create:

- Agricultural Land
- NA Land
- Industrial Land

Each page should explain:

- what the category means in UrbanEdge inventory
- common search criteria
- available inventory
- category-specific filters
- relevant guide links
- enquiry CTA

Do not create a category page solely to generate SEO URLs if there is not enough useful inventory/content.

---

# 13. Search & Discovery

## 13.1 Primary Search Inputs

Priority order:

1. district
2. taluka
3. village/locality
4. land category
5. transaction type
6. budget
7. area
8. Property ID
9. free text
10. map

### Recommended default

Large, simple search:

`Looking for land in Ahmedabad / Gandhinagar`

With quick chips:

- Agricultural
- NA
- Industrial
- Buy
- Rent
- Lease

---

# 14. Primary Filters

V1 should not overwhelm the customer.

## All categories

- Location
- Land Type
- Transaction
- Budget
- Area
- Availability
- Property ID
- Road access
- Price on Request / Listed Price

## Agricultural

Additional:

- irrigation/water
- road access
- soil
- fenced
- village/taluka

## NA

Additional:

- NA status
- intended/approved use where documented
- zone
- planning authority
- road width

## Industrial

Additional:

- GIDC / non-GIDC
- industrial estate
- road width
- power
- water
- gas
- logistics/highway connectivity
- authority

---

# 15. Advanced Filters

Advanced filters can be collapsed.

Potential fields:

- ownership type
- survey/block
- TP/FP/OP
- frontage
- dimensions
- corner
- boundary
- title/document review status
- site visited
- drone available
- 360 available
- brochure available

Do not place all fields on the initial mobile filter screen.

---

# 16. Search Results

Each result card should show:

- Property ID
- category
- transaction
- short title
- broad locality
- area
- price mode
- price if published
- road / key feature
- verification status chips
- cover image
- Updated date
- WhatsApp CTA
- View Property

### Do not

- show owner phone by default
- publish internal documents
- show exact coordinates by default
- claim “legally verified” without evidence
- fabricate missing fields

---

# 17. No Results Workflow

A search with no matching inventory must not end with a dead page.

Show:

> No matching land is currently listed.

Then offer:

### Primary

`Tell UrbanEdge what you are looking for`

Capture generic buyer requirement:

- name
- mobile
- land type
- buy/rent/lease
- preferred district
- taluka/localities
- budget
- minimum/maximum area
- intended use
- timing
- additional notes

### Secondary

- broaden location
- broaden budget
- broaden area
- contact UrbanEdge

This requirement must enter the same central CRM as listing-specific inquiries.

---

# 18. Property Detail Page

The property detail page is a major conversion asset.

## Above the fold

- Property ID
- category
- transaction
- title
- area
- broad location
- price mode
- primary image
- inquiry CTA
- WhatsApp CTA
- Call CTA
- Site Visit CTA

## Main information blocks

1. Overview
2. Location
3. Land characteristics
4. Infrastructure/connectivity
5. Verification
6. Media
7. Documents/brochure
8. Inquiry form
9. Disclaimer

---

# 19. Maps and Location Privacy

Location is one of the most important land-product decisions.

## 19.1 Three modes

### Exact

Display exact location/parcel pin.

Use only when UrbanEdge has permission and publishing the exact location is commercially appropriate.

### Approximate

Display approximate map location / nearby area without exposing the exact parcel.

### Hidden

No public map coordinates; show locality/village/taluka only.

---

## 19.2 V1 Default

**Approximate should be the default public mode.**

Reasons:

- useful to buyers
- protects owners
- reduces broker bypass risk
- avoids overexposing private parcels
- allows UrbanEdge to qualify the lead before revealing sensitive details

Exact can be enabled per property by admin.

Hidden should be available for sensitive inventory.

---

## 19.3 Technical Requirement

Store independently:

- latitude
- longitude
- public_location_mode
- public_latitude
- public_longitude
- internal_latitude
- internal_longitude

Do not derive public coordinates from internal coordinates automatically unless the mode permits it.

For approximate mode, choose the published coordinate through a controlled admin operation.

---

## 19.4 SEO implications

Do not expect exact parcel coordinates to be the SEO strategy.

Useful SEO comes from:

- category
- locality
- district
- genuine property content
- useful guides
- connectivity information
- structured but unique descriptions

---

# 20. Price Display

Current client preference:

> Price on Request

This should be a supported value, not a hard-coded rule.

## Supported modes

- Price on Request
- Exact Total
- Price Range
- Per Unit
- Negotiable
- Price + Negotiable

For lease/rent:

- monthly
- quarterly
- annual
- per sq ft/unit where appropriate

### V1 default

**Price on Request** is acceptable as the default.

### Admin requirement

Each listing must have a structured price mode and optional numeric values.

Example:

```text
price_mode = price_on_request
price_total = null
price_unit = null
price_negotiable = null
```

Do not put a fake number into the database just to make filters work.

---

# 21. Units

Land listings frequently use mixed units.

V1 should support storing the original unit while normalizing for filtering.

Suggested:

- sq ft
- sq yd
- sq m
- acre
- hectare
- bigha
- vigha
- guntha
- local unit / other

### Important

Do not assume a universal local conversion without market/jurisdiction validation.

Where a local unit such as bigha/vigha/guntha is supplied, store:

- original numeric value
- original unit
- standardized value
- conversion source/rule
- conversion confidence if needed

The UI can prioritize standardized units while retaining the owner's original value.

---

# 22. Media Requirements

## Must support V1

- multiple images
- cover image
- YouTube/video URL
- drone-video URL
- brochure PDF
- 360° tour URL

Do not build a proprietary video hosting platform.

---

## 22.1 Media priority

1. high-quality cover image
2. additional site/road/access images
3. drone video where useful
4. standard video
5. brochure PDF
6. 360° link

This priority can vary for industrial land, where infrastructure and road access footage may be especially useful.

---

## 22.2 Image requirements

Admin should upload:

- clear landscape/parcel images
- road access
- boundary/context
- nearby development where relevant
- industrial infrastructure where applicable

Avoid:

- watermarked third-party images
- misleading old images without date/context
- images of neighboring property presented as subject property

Optional internal metadata:

- image date
- source
- caption

---

# 23. Video / Drone / 360 Presentation

Display as media tabs/cards rather than embedding every media type above the fold.

Example:

`Photos | Drone | Video | 360° | Brochure`

Only show tabs that exist.

No blank “360” block if no 360 link exists.

---

# 24. Verification Product

Verification should be a **multi-signal system**, not a single Boolean.

## 24.1 Recommended statuses

Public-facing where appropriately supported:

- Information Reviewed
- Documents Reviewed
- Location Reviewed
- Site Visited

Possible internal-only:

- Survey Reviewed
- Title/Land Record Review
- Legal Review Completed

---

## 24.2 Why a single “Verified” is dangerous

“Verified” is too vague.

A buyer can interpret it as:

- title clear
- no litigation
- no encumbrance
- owner verified
- construction permitted
- legally purchasable
- location accurate
- all authorities approved

One Boolean cannot safely mean all of this.

---

## 24.3 Public badge rules

A badge must define its scope.

Example:

**Information Reviewed**

> UrbanEdge reviewed the property information submitted to us as part of our listing process.

**Documents Reviewed**

> UrbanEdge has reviewed selected documents supplied for this property. This is not a legal title certificate or guarantee.

**Site Visited**

> UrbanEdge has physically visited the stated property/location.

Do not use:

> 100% Verified  
> Legally Clear  
> Title Guaranteed

unless UrbanEdge has an appropriate professional and documentary basis for such language.

---

# 25. Government Information Integration

V1 should not promise live official data integration unless actually implemented.

However, the admin workflow should make it easy to record references to:

- e-Dhara / Record of Rights
- 7/12
- VF6
- VF8A
- property card where applicable
- registration/property search
- Jantri reference
- EC
- Index-2
- certified documents
- planning authority records
- GIDC records

Gujarat's e-Dhara system describes availability of VF6, 7/12 and VF8A records and its integration with revenue processes. The state registration/stamps department separately lists document registration, property search, Jantri, market-value calculation and iORA services such as EC, Index-2 and certified document copies. These systems support the need for a structured internal evidence model. [e-Dhara](https://gil.gujarat.gov.in/edhara/); [Revenue iORA](https://revenuedepartment.gujarat.gov.in/iora-service); [IGR/Stamps](https://stampsregistration.gujarat.gov.in/).

---

# 26. Legal / Regulatory Product Boundary

UrbanEdge Land Space is not a legal practice.

The site should include a clear disclaimer:

- listings are provided for information/discovery purposes
- availability and commercial terms can change
- information may be supplied by owner/authorized representative
- buyers should conduct appropriate independent legal/document due diligence
- UrbanEdge verification badges are scoped and do not guarantee title or legal compliance
- permissions/approvals may depend on property-specific facts and authorities
- users should obtain professional advice for legal/tax/registration matters

The exact legal wording should be reviewed by counsel before production launch.

---

# 27. Planning / Development Information

Ahmedabad and surrounding areas may involve planning/development authorities and Town Planning frameworks.

AUDA publishes development plans and planning materials, including a Revised Development Plan and GDCR-related resources. Planning information should therefore be treated as **property-specific and authority-specific**. [AUDA Revised Development Plan](https://www.auda.org.in/rdp/).

The product should store an optional:

- Planning Authority
- Development Plan reference
- TP Scheme
- Zone / use
- reference date
- source URL/document

Do not infer development rights solely from a locality name.

---

# 28. Industrial/GIDC Product Boundary

UrbanEdge may list:

- private industrial land
- industrial park plots
- GIDC-related opportunities
- leases
- resale opportunities

But the UI must distinguish:

`GIDC Estate`

from

`Private Industrial Land`

because GIDC has its own allotment and transfer framework.

GIDC states that industrial plots can be allotted through application/screening processes and that some estates have different allotment mechanisms. It also publishes estate-level allotment prices and policies. [GIDC Allotment](https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties); [GIDC FY 2026–27 allotment prices](https://gidc.gujarat.gov.in/allotmentprice/).

---

# 29. RERA Boundary

UrbanEdge Land Space is a brokerage/discovery product, not a replacement for Gujarat RERA.

Where a marketed **real-estate project** is RERA-registered and the listing is a plotted development/project, the listing may include a RERA registration number if appropriately verified.

Do not apply a simplistic rule that every piece of standalone agricultural, NA or industrial land must have a RERA number.

RERA applicability can depend on whether the inventory is a “real estate project” / plotted development and on statutory exemptions. Gujarat RERA materials specifically reference registration of eligible real-estate projects and examples of plotted projects. [Gujarat RERA materials](https://gujrera.gujarat.gov.in/); Gujarat RERA project/search references should be checked against the current official portal before publication.

### Product rule

RERA is an **optional property-specific field**:

- RERA applicable/registered
- RERA number
- authority
- official project URL
- verification date

Never invent or infer a RERA number.

---

# 30. Buyer Discovery Workflow

Recommended V1 journey:

`Landing`
→ `Search / Category`
→ `Results`
→ `Property Detail`
→ `WhatsApp / Call / Inquiry / Site Visit`
→ `CRM Lead`
→ `Qualification`
→ `Site Visit Request`
→ `Site Visit`
→ `Negotiation`
→ `Closed Won / Lost / Nurture`

---

## 30.1 Primary conversion

`Inquiry`

Because it provides structured customer data and is not dependent on the visitor being ready to call immediately.

---

## 30.2 High-intent shortcut

`WhatsApp`

Use prefilled message:

> Hi UrbanEdge, I’m interested in Property UE-LS-000123.

This preserves the Property ID.

---

## 30.3 Call

Call CTA should preserve:

- property ID
- source/page
- session/lead source where technically available

A call click should create an analytics event even if the phone call itself cannot be tracked as completed.

---

## 30.4 Site Visit

Do not automatically book a calendar slot in V1.

Recommended:

**Request preferred date/time**

This is practical for a single-admin brokerage because availability, owner access and site conditions may change.

---

# 31. Site Visit Workflow

## Statuses

- Requested
- Contacted
- Proposed
- Confirmed
- Rescheduled
- Completed
- No Show
- Cancelled
- Follow-up Required

## V1 process

Customer chooses:

- preferred date
- preferred time window
- contact number
- optional alternate time
- note

Admin confirms manually.

### Why not automatic booking?

Land visits can involve:

- owner/representative availability
- access keys
- village/farm access
- weather
- security
- industrial gate permissions
- multiple parcels
- changing availability

Manual confirmation is more robust for V1.

---

# 32. Generic Buyer Requirement Form

This is a high-priority feature.

A visitor may not find an exact listing but still be a valuable buyer.

Fields:

- name
- phone
- email optional
- buyer type
- transaction intent
- land type
- preferred district
- taluka
- village/localities
- budget
- minimum area
- maximum area
- intended use
- timeline
- requirement notes
- consent

This lead should have:

`inquiry_type = buyer_requirement`

instead of being forced into a fake property inquiry.

---

# 33. Lead Sources

V1 central CRM must support:

- Website form
- Property detail
- WhatsApp click
- Call click
- Site visit form
- Sell Your Land
- Generic buyer requirement
- Referral
- Manual entry
- 99acres
- MagicBricks
- Housing
- Other portal
- Instagram
- Facebook
- Google Business/Profile
- Direct / Organic
- Offline

Portals should be configurable rather than hard-coded.

---

# 34. CRM Design

V1 uses **one central inbox and one admin**.

The architecture should support a future `assigned_to` field, but assignment does not need to be operational in V1.

---

# 35. Recommended CRM Pipeline

Use:

1. New
2. Contact Attempted
3. Qualified
4. Requirement Confirmed
5. Property Matched
6. Site Visit Requested
7. Site Visit Confirmed
8. Site Visit Completed
9. Negotiation
10. Nurture
11. Closed Won
12. Closed Lost

### Why “Property Matched”?

A buyer-requirement lead may begin without a specific listing.

This stage records that UrbanEdge has identified at least one suitable property.

---

# 36. CRM Stage Definitions

| Stage | Meaning | Entry | Next likely | Capture |
|---|---|---|---|---|
| New | New lead received | Any source creates lead | Contact Attempted | source, time, contact |
| Contact Attempted | First outreach initiated | New lead touched | Qualified | attempt note, outcome |
| Qualified | Basic fit confirmed | Need/budget/location understood | Requirement Confirmed | budget, area, type, use |
| Requirement Confirmed | Requirement is actionable | Buyer confirms criteria | Property Matched | exact criteria |
| Property Matched | One or more properties matched | UrbanEdge has candidate(s) | Site Visit Requested | property IDs |
| Site Visit Requested | Buyer requested visit | visit request submitted | Site Visit Confirmed | date/time preference |
| Site Visit Confirmed | Visit fixed | admin confirms | Site Visit Completed | date/time/property |
| Site Visit Completed | Visit happened | attendance recorded | Negotiation/Nurture/Lost | feedback |
| Negotiation | Commercial discussion underway | serious interest | Won/Lost | offer, notes |
| Nurture | Not ready now | future potential | Reactivate/Closed | next follow-up |
| Closed Won | transaction converted | deal confirmed | — | property/deal info |
| Closed Lost | no further action | lost decision | — | loss reason |

---

# 37. Lead Data Model

Required V1:

- Lead ID
- name
- phone
- email
- lead source
- inquiry type
- buyer type
- preferred transaction
- land type
- budget
- desired area min/max
- district
- taluka
- locality
- intended use
- status
- next follow-up date
- last contacted
- notes
- created at
- updated at

Optional relationships:

- property IDs
- site visits
- activities
- owner submission
- assigned_to (future-ready)

---

# 38. Activity Timeline

Every lead should have an activity timeline.

Examples:

- Lead created
- WhatsApp click
- Call click
- Note added
- Contact attempted
- Requirement updated
- Property matched
- Site visit requested
- Site visit confirmed
- Site visit completed
- Offer received
- Follow-up scheduled
- Status changed

This becomes the operating memory of the brokerage.

---

# 39. Follow-Up Management

Every open lead should support:

- next follow-up date
- follow-up type
- note
- completed flag

Admin dashboard should show:

- overdue
- today
- next 7 days

Do not require an advanced automation engine in V1.

---

# 40. Loss Reasons

Use structured loss reasons.

Examples:

- Budget mismatch
- Location mismatch
- Size mismatch
- Property sold
- Property unavailable
- Buyer not eligible / needs professional confirmation
- Legal/document concern
- Timing changed
- Competitor property
- Buyer stopped responding
- Not interested
- Duplicate lead
- Other

Admin can enter a note.

This is more useful than only a free-text “lost” field.

---

# 41. Admin — V1 Role

One administrator controls all functions.

Admin can:

- create/edit properties
- publish/archive
- review submissions
- upload media
- manage verification signals
- manage leads
- manage site visits
- manage guides
- manage locations
- manage SEO fields
- view analytics
- manage settings
- view audit trail

The data model should include `created_by`, `updated_by`, and future-friendly `assigned_to`.

---

# 42. Admin Dashboard

Dashboard should answer:

### Today

- new inquiries
- owner submissions
- overdue follow-ups
- site visits today
- new properties pending review

### Pipeline

- new leads
- qualified
- visits
- negotiation
- won/lost

### Inventory

- published
- review
- pending documents
- on hold
- sold/leased/rented

### Performance

- top-viewed properties
- WhatsApp clicks
- call clicks
- inquiry rate
- site visit requests
- lead source
- conversion

Avoid vanity metrics such as total lifetime page views without context.

---

# 43. Property Management

Admin needs:

- list view
- search
- filter
- create
- edit
- duplicate as draft
- publish
- unpublish
- archive
- change availability
- manage media
- manage location
- manage verification
- view linked leads
- view site visits

---

# 44. Property CRUD Rules

### Create

Admin enters all required fields.

### Draft

Property can be saved incomplete.

### Review

Required before publish.

### Publish

All publication-required fields pass validation.

### Archive

Removed from public search but retained for CRM/history/SEO handling.

---

# 45. Owner Submission Admin Screen

Columns:

- Submission ID
- submitted date
- owner
- land type
- transaction
- location
- area
- asking price
- status
- last contact
- next action

Actions:

- open
- contact
- request docs
- approve
- reject
- convert to property

---

# 46. Convert Submission to Listing

This must be a controlled action.

`Submission → Create Listing`

The system should copy structured fields but allow the admin to:

- change public title
- sanitize description
- change location visibility
- select public media
- choose price mode
- set verification badges
- set availability
- choose publication date

Owner-submission document files must remain private by default.

---

# 47. Audit Trail

V1 should keep basic audit data for sensitive changes.

Record:

- user/admin
- timestamp
- entity
- action
- prior state where practical
- new state where practical

High-value actions:

- publish
- unpublish
- archive
- delete
- change owner information
- change public coordinates
- change verification status
- change price
- change availability
- reject submission

---

# 48. Guides / Blog

Educational content is strategically useful for:

- SEO
- trust
- buyer education
- reducing repeated sales explanations
- local authority positioning

But the product should use a **lean editorial model**, not mass AI-generated content.

---

## 48.1 V1 Categories

### Land Buying

- What to check before buying agricultural land in Gujarat
- Agricultural vs NA vs industrial land
- What 7/12 / RoR information is useful for
- Why exact land-use status matters
- Questions to ask before a land site visit

### Ahmedabad / Gandhinagar

- Land-buying considerations around Ahmedabad growth corridors
- Gandhinagar land search guide
- Understanding TP/FP references at a high level
- Industrial land search checklist

### Transaction

- Land sale document checklist
- What to ask before renting/leasing land
- Price-per-unit terminology explained

Legal content should be reviewed by a qualified professional before publication when it makes definitive legal claims.

---

# 49. What NOT to Automate in Guides

Do not automatically publish:

- fabricated legal advice
- unsourced “latest law” posts
- mass location pages with no inventory
- AI-written pages repeating the same paragraph for hundreds of villages
- unverifiable appreciation predictions
- claims such as “guaranteed ROI”

Editorial review is required.

---

# 50. SEO Product Requirements

## 50.1 Property detail SEO

Each published listing can have:

- unique title
- unique description
- locality
- district
- category
- transaction
- area
- Property ID
- useful structured details

Do not expose internal notes.

---

## 50.2 Category pages

Core:

- /agricultural-land
- /na-land
- /industrial-land

Transaction/location variations can be useful only when inventory supports them.

---

## 50.3 Location pages

Examples:

- Agricultural Land in Ahmedabad
- Agricultural Land in Gandhinagar
- NA Land in Ahmedabad
- NA Land in Gandhinagar
- Industrial Land in Ahmedabad
- Industrial Land in Gandhinagar

Further taluka/village pages should be generated only when enough relevant inventory/content exists.

---

# 51. Programmatic SEO Rules

A location page may be indexed only if it has:

- sufficient active inventory, OR
- substantial original editorial content and search value

Avoid:

`/agricultural-land-in-every-village`

with no inventory.

A page should not be created solely because its URL keyword exists.

---

# 52. Archived / Sold Property SEO

Do not delete a property immediately after sale.

For a sold property:

- retain internal record
- public page can show `Sold` where useful
- remove active inquiry CTA or change it to “Find Similar Land”
- recommend related inventory
- preserve Property ID internally

For a permanently withdrawn/private property:

- archive
- decide case-by-case whether public page remains indexed or returns an appropriate status

Do not leave stale “available” pages live.

---

# 53. Content Trust Signals

Useful product trust signals:

- last updated
- availability checked date
- UrbanEdge site visit badge
- documents reviewed badge
- location reviewed badge
- property ID
- clear source/disclaimer language

This is more credible than generic “verified” language.

---

# 54. Analytics

V1 analytics should focus on brokerage outcomes.

## Required

### Inventory

- active listings
- listing views
- unique property viewers
- inquiry conversion by property
- WhatsApp clicks
- call clicks
- site visit requests

### Leads

- leads by source
- leads by category
- leads by transaction
- lead stage progression
- overdue follow-ups
- site visits
- conversion

### Owner side

- submissions
- submission-to-contact
- submission-to-review
- review-to-publish
- rejection rate
- top rejection reason

---

# 55. Property Performance

For each property:

- views
- WhatsApp clicks
- calls
- inquiries
- site visits requested
- site visits completed
- negotiations
- closed outcome

This helps UrbanEdge identify which properties produce actual business instead of optimizing for page views alone.

---

# 56. Recommended V1 Analytics Events

Examples:

```text
property_view
property_whatsapp_click
property_call_click
property_inquiry_start
property_inquiry_submit
site_visit_request
buyer_requirement_submit
sell_land_start
sell_land_submit
media_video_open
media_drone_open
brochure_open
360_open
search
filter_apply
no_results
lead_stage_change
site_visit_status_change
property_status_change
```

---

# 57. Competitive / Industry Research Findings

Current market research supports a structured land-specific UX.

## 57.1 MagicBricks

Current Ahmedabad plot pages expose information including:

- plot area
- dimensions
- ownership
- transaction
- road width
- authority approval
- nearby landmarks
- price per unit
- agent/owner context

Current industrial listings also show:

- road width
- infrastructure descriptions
- authority approval
- nearby landmarks
- industrial context

Source examples:

- [MagicBricks — Ahmedabad Plots](https://www.magicbricks.com/residential-plots-land-for-sale-in-ahmedabad-pppfs)
- [MagicBricks — Ahmedabad Industrial Land](https://www.magicbricks.com/industrial-land-for-sale-in-ahmedabad-pppfs)

**Product implication:** UrbanEdge should structure land data more explicitly rather than presenting everything in a free-text description.

---

## 57.2 Housing.com

Current Ahmedabad plot results expose:

- area
- facing
- new/resale
- listed-by type
- verified labels
- nearby landmarks
- budget ranges
- localities
- project association

Source:
[Housing.com — Plots in Ahmedabad](https://housing.com/in/buy/ahmedabad/plots-fid/)

**Product implication:** filters and localized discovery are expected, but UrbanEdge should tailor filters to land rather than copy residential filters such as BHK.

---

## 57.3 Square Yards

Current land results show:

- sort by relevance/price/newest
- resale
- auction
- owners
- zero brokerage
- location
- area
- maps

Source:
[Square Yards — Lands in India](https://www.squareyards.com/sale/lands)

**Product implication:** land search should support commercial status/ownership context, but UrbanEdge can stay curated rather than turning V1 into a mass marketplace.

---

## 57.4 DekhoJamin

DekhoJamin is especially relevant because it positions itself specifically around land.

Current product features include:

- Property ID search
- state/district/budget
- land categories
- map
- 360° virtual tours
- “verified” labels
- site visits
- property/document checking services
- lead capture
- customized inquiry forms
- agent/agency tools
- quick category/location searches

Source:
[DekhoJamin](https://www.dekhojamin.com/)

The live site also demonstrates a property-ID-driven discovery pattern and categories for agriculture, NA and industrial land. Its inquiry form asks for location, property type, budget, minimum size and consent. [DekhoJamin live product](https://www.dekhojamin.com/)

**Product implication:** UrbanEdge can differentiate through better curation, local market knowledge, clearer verification scope and brokerage follow-through rather than trying to reproduce every platform feature.

---

# 58. Current Land-Market Data Expectations

Observed current listings around Ahmedabad show users are presented with highly variable parcel sizes and commercial terms, including agricultural, NA and industrial offerings and location-specific pricing. The data varies widely enough that a rigid residential-style listing model would be inappropriate.

The product therefore needs flexible:

- area
- units
- pricing
- dimensions
- road width
- land type
- transaction
- authority
- owner/agent source
- location granularity

Market examples should inform UX, not be interpreted as legal or valuation benchmarks.

---

# 59. External Government Source Map

## Gujarat land records

**Organization:** Gujarat Informatics Limited / Government of Gujarat  
**Source:** e-Dhara  
**URL:** https://gil.gujarat.gov.in/edhara/  
**Research date:** 29 Aug 2026  
**Supports:** VF6, 7/12, VF8A, e-Dhara/RoR service context.

## Gujarat Revenue Department

**Organization:** Revenue Department, Government of Gujarat  
**Source:** iORA services  
**URL:** https://revenuedepartment.gujarat.gov.in/iora-service  
**Research date:** 29 Aug 2026  
**Supports:** land records, document registration, property cards, revenue services.

## Gujarat Registration / Stamps

**Organization:** Inspector General of Registration & Superintendent of Stamps, Government of Gujarat  
**URL:** https://stampsregistration.gujarat.gov.in/  
**Research date:** 29 Aug 2026  
**Supports:** document registration, property search, Jantri, market-value calculation, EC, Index-2, certified copies, model drafts.

## Gujarat Land Revenue Code / NA

**Organization:** Revenue Department, Government of Gujarat  
**Source:** Gujarat Land Revenue Code  
**URL:** https://revenuedepartment.gujarat.gov.in/downloads/act_BLRC_1879_n.pdf  
**Research date:** 29 Aug 2026  
**Supports:** NA-use legal context and section 65/65A/65B structure.

## Collector Manual / NA

**Organization:** Revenue Department, Government of Gujarat  
**URL:** https://revenuedepartment.gujarat.gov.in/downloads/collector_manual_final.pdf  
**Research date:** 29 Aug 2026  
**Supports:** practical NA-permission process context, checks around legal occupant, tenure/premium and disputes.

## Agricultural Land Restrictions

**Organization:** Revenue Department, Government of Gujarat  
**Source:** Gujarat Tenancy and Agricultural Lands Act  
**URL:** https://revenuedepartment.gujarat.gov.in/downloads/act_19092023.pdf  
**Research date:** 29 Aug 2026  
**Supports:** agricultural land transfer restrictions and permission context.

## AUDA

**Organization:** Ahmedabad Urban Development Authority  
**URL:** https://www.auda.org.in/rdp/  
**Research date:** 29 Aug 2026  
**Supports:** development-plan / GDCR / planning context.

## GIDC

**Organization:** Gujarat Industrial Development Corporation  
**URL:** https://gidc.gujarat.gov.in/Pages/Contents/Allotment%20of%20properties  
**Research date:** 29 Aug 2026  
**Supports:** industrial estate allotment structure and categories.

## GIDC Allotment Prices

**Organization:** Gujarat Industrial Development Corporation  
**URL:** https://gidc.gujarat.gov.in/allotmentprice/  
**Research date:** 29 Aug 2026  
**Supports:** estate-level FY 2026–27 allotment price data and distinction among estates.

## GIDC 2024 Policy

**Organization:** Gujarat Industrial Development Corporation  
**URL:** https://gidc.gujarat.gov.in/Document/LinkManagment/Circulars/pre-alt-1718102024013709.pdf  
**Research date:** 29 Aug 2026  
**Supports:** land allotment, utilization and transfer policy context.

## GIDC Plug-and-Play

**Organization:** Gujarat Industrial Development Corporation  
**URL:** https://gidc.gujarat.gov.in/Pages/Contents/Plug-and-Play  
**Research date:** 29 Aug 2026  
**Supports:** industrial infrastructure / approval context.

## Transfer of Property Act

**Organization:** Government of India / India Code  
**URL:** https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse  
**Research date:** 29 Aug 2026  
**Supports:** lease definition and legal framework.

## Registration Act

**Organization:** Government of India / India Code / current legal publication  
**URL:** https://indiacode.ecourtsindia.com/registration-act/section/17/  
**Research date:** 29 Aug 2026  
**Supports:** registration requirement context for specified leases.

## Gujarat RERA

**Organization:** Gujarat Real Estate Regulatory Authority  
**Official portal reference:** https://gujrera.gujarat.gov.in/  
**Research date:** 29 Aug 2026  
**Supports:** RERA/project-registration context. Verify the current official portal/domain before implementation because legacy references can exist.

---

# 60. Competitor / Industry Sources

| Organization | Source | URL | Date / Last Updated | What it supported |
|---|---|---|---|---|
| MagicBricks | Ahmedabad plots | https://www.magicbricks.com/residential-plots-land-for-sale-in-ahmedabad-pppfs | Research 29 Aug 2026 | Plot filters, area, dimensions, ownership, approval, road width, nearby |
| MagicBricks | Ahmedabad industrial land | https://www.magicbricks.com/industrial-land-for-sale-in-ahmedabad-pppfs | Research 29 Aug 2026 | Industrial filters, road width, authority, infrastructure, nearby |
| Housing.com | Ahmedabad plots | https://housing.com/in/buy/ahmedabad/plots-fid/ | Last updated shown Aug 28, 2026 | Plot discovery, budget, listed-by, verification, nearby |
| Square Yards | Lands India | https://www.squareyards.com/sale/lands | Last updated shown Aug 28, 2026 | Land sorting, owner/auction/resale filters, property IDs/map-style data |
| DekhoJamin | Land platform | https://www.dekhojamin.com/ | Live research 29 Aug 2026 | Property ID, land categories, 360, verification, inquiry, site visits, agent tools |
| SmartBuilds | Real-estate CRM | https://smartbuilds.in/ | Live research 29 Aug 2026 | Central lead dashboard, follow-up, site visit, source tracking |
| OrangeProp | Real-estate CRM | https://orangeprop.com/ | Live research 29 Aug 2026 | Lead scoring, follow-up engine, source integration |
| Realatic | Real-estate CRM | https://realatic.com/ | Live research 29 Aug 2026 | Portal lead capture, qualification, follow-up, site visit workflow |
| HamaraCRM | Real-estate CRM | https://hamaracrm.com/real-estate-crm/ | Live research 29 Aug 2026 | lead capture, qualification, site-visit scheduling |
| Leeado | Real-estate CRM | https://leeado.com/ | Live research 29 Aug 2026 | follow-up, site visit, lead priority, import |

These competitor materials are **industry research only**, not legal authority.

---

# 61. V1 Feature Classification

| Feature | V1/Future | Priority | Business Reason |
|---|---|---:|---|
| Homepage | V1 | Must | Core acquisition |
| Category pages | V1 | Must | Land discovery and SEO |
| Search | V1 | Must | Primary product job |
| Location hierarchy | V1 | Must | Land is location-driven |
| Primary filters | V1 | Must | Faster discovery |
| Advanced filters | V1 | Should | Useful without crowding core UI |
| Property detail | V1 | Must | Conversion hub |
| Property ID | V1 | Must | CRM / sharing / tracking |
| Approximate map | V1 | Must | Discovery + privacy balance |
| Exact map | V1 | Should | Useful for selected listings |
| Hidden location | V1 | Should | Sensitive inventory |
| Multiple images | V1 | Must | Trust and conversion |
| Video URL | V1 | Should | Richer inventory |
| Drone URL | V1 | Should | Particularly strong for land |
| PDF brochure | V1 | Should | Common broker asset |
| 360° link | V1 | Should | Land-specific premium experience |
| WhatsApp | V1 | Must | High-intent Indian brokerage channel |
| Call | V1 | Must | High-intent conversion |
| Inquiry form | V1 | Must | Structured lead capture |
| Site visit request | V1 | Must | Critical brokerage action |
| Generic buyer requirement | V1 | Must | Capture no-match demand |
| Sell Your Land | V1 | Must | Owner acquisition |
| Admin panel | V1 | Must | Business cannot operate without it |
| Property management | V1 | Must | Inventory control |
| Owner submission queue | V1 | Must | Curated model |
| Verification workflow | V1 | Must | Trust layer |
| Central CRM | V1 | Must | Operational backbone |
| Site visit management | V1 | Must | Conversion workflow |
| Email admin alerts | V1 | Should | Prevent missed submissions |
| Basic analytics | V1 | Must | Operational decisions |
| Guides | V1 | Should | SEO + trust |
| SEO landing pages | V1 | Should | Organic acquisition |
| Legal/disclaimer pages | V1 | Must | Product boundary |
| Buyer accounts | Later | No V1 | Adds identity/UX complexity |
| Seller dashboards | Later | No V1 | Not required for curated broker model |
| Public agent accounts | Later | No V1 | Avoid marketplace complexity |
| Public reviews | Later | No V1 | Moderation/trust burden |
| Memberships | Later | No V1 | No proven need |
| Paid listing packages | Later | No V1 | Conflicts with curated inventory model |
| Payment gateway | Later | No V1 | Transaction handled offline |
| In-app messaging | Later | No V1 | WhatsApp/phone sufficient |
| AI chatbot | Later | No V1 | Human qualification is core |
| Automatic valuation | Later | No V1 | High risk and low initial necessity |
| Mortgage tools | Do not build now | No | Not core to land brokerage |
| WhatsApp Business API | Later | No V1 | Operational cost/setup; native click-to-WhatsApp is enough |
| SMS alerts | Later | No V1 | Email + manual follow-up enough initially |
| Full appointment calendar | Later | No V1 | Manual confirmation more practical |

---

# 62. Explicit V1 Exclusions

## Buyer accounts

Do not build.

Reason: the buyer can search and submit forms without authentication. Accounts add password/OTP/recovery, privacy and saved-search complexity.

## Seller dashboard

Do not build.

Reason: owner submission is intentionally broker-controlled. Staff should manage listings internally.

## Public agent accounts

Do not build.

Reason: UrbanEdge is the brokerage brand; public agent marketplace functionality creates moderation, permissions and bypass complexity.

## Public reviews

Do not build initially.

Reason: review moderation and reputation systems are unnecessary before sufficient transaction volume.

## Memberships / paid listings

Do not build.

Reason: V1 inventory is curated; monetization is brokerage-driven.

## Payment gateway

Do not build.

Reason: website is discovery and lead generation; sale/lease transaction is offline.

## In-app messaging

Do not build.

Reason: WhatsApp, calls and inquiry forms are sufficient.

## AI chatbot

Do not build.

Reason: land inquiries need qualification and property-specific context; a generic chatbot can create false confidence.

## Automatic valuation

Do not build.

Reason: insufficient verified comparable data and high risk of misleading customers.

## Mortgage tools

Do not build.

Reason: not central to the product.

## WhatsApp Business API

Do not make a V1 dependency.

Reason: use click-to-WhatsApp with structured inquiry context; API automation can be added after lead volume/process justify it.

## SMS

Later.

## Full calendar booking

Later.

---

# 63. User Stories

## Buyer

- As a buyer, I want to filter land by Ahmedabad/Gandhinagar location so I can narrow my search.
- As a buyer, I want to filter by Agricultural/NA/Industrial so I see relevant inventory.
- As a buyer, I want to filter by area and budget so I can avoid unsuitable properties.
- As a buyer, I want to understand whether a map is exact or approximate so I know how much location confidence I have.
- As a buyer, I want a Property ID so I can refer to the same parcel when I call or WhatsApp UrbanEdge.
- As a buyer, I want to see road access and nearby connectivity because location is critical for land.
- As a buyer, I want scoped verification signals so I can understand what UrbanEdge has actually checked.
- As a buyer, I want to contact UrbanEdge by WhatsApp/call/inquiry so I can use the channel I prefer.
- As a buyer, I want to request a site visit without automatically booking a slot so UrbanEdge can confirm availability.
- As a buyer, I want to submit a requirement when no listing matches so UrbanEdge can search off-market inventory.

## Landowner

- As a landowner, I want to submit my land details so UrbanEdge can review it.
- As a landowner, I want to upload photos/documents so the broker can evaluate the opportunity.
- As a landowner, I want to control whether the exact location is public so my parcel is not unnecessarily exposed.
- As a landowner, I want UrbanEdge to contact me before publishing so I understand what will be marketed publicly.

## Admin

- As an admin, I want to review every owner submission before publication so inventory remains curated.
- As an admin, I want to convert an approved submission into a listing without re-entering every field.
- As an admin, I want to control exact/approximate/hidden location per property.
- As an admin, I want scoped verification statuses so public claims remain accurate.
- As an admin, I want to see every lead in one pipeline so no follow-up is lost.
- As an admin, I want to link multiple properties to a buyer requirement so one inquiry can be handled across inventory.
- As an admin, I want to schedule a preferred site-visit request and confirm it manually.
- As an admin, I want property views, inquiries, calls and visits so I can identify the listings producing business.
- As an admin, I want an audit trail for publishing and verification changes so sensitive information changes are traceable.

---

# 64. Business-Level Acceptance Criteria

## 64.1 Search

- User can search by district/locality.
- User can select land category.
- User can select transaction type.
- User can filter budget and area.
- Search results show Property ID.
- Property results do not expose unpublished inventory.
- Search can return zero results cleanly.
- Zero-result state provides a buyer requirement capture path.

## 64.2 Property Detail

- Every public listing has a stable Property ID.
- Category and transaction are clearly displayed.
- Area and price mode are visible.
- Availability is clear.
- Location mode is respected.
- Only admin-selected media is public.
- Verification badges explain their scope.
- Inquiry/WhatsApp/Call CTAs work.
- Site visit request works.
- Disclaimer is visible.

## 64.3 Lead Capture

- Every inquiry creates a CRM lead.
- Source is captured.
- Listing-specific leads include Property ID.
- Generic requirements do not require a fake Property ID.
- Lead receives a stage.
- Next follow-up date can be saved.
- Activity timeline is available.

## 64.4 Sell Your Land

- Owner cannot publish directly.
- Submission gets an internal status.
- Contact consent is captured.
- Location visibility preference is captured.
- Owner can submit media.
- Documents remain private by default.
- Admin can reject or convert to listing.
- Converted listing can have different public content/privacy from the original submission.

## 64.5 Admin

- Admin can create/edit/archive properties.
- Admin can publish only review-ready listings.
- Admin can manage status and availability independently.
- Admin can update price mode.
- Admin can manage verification status.
- Admin can review owner submissions.
- Admin can see related leads.
- Sensitive changes are auditable.

## 64.6 Verification

- Verification has multiple scoped statuses.
- Public badge label is not just “Verified.”
- Each public status has an explanation.
- Document Review is not represented as title guarantee.
- Legal Review is distinct from Information Reviewed.
- Verification date/source can be recorded internally.

## 64.7 Site Visit

- Buyer can request preferred date/time.
- Admin can confirm.
- Statuses include requested/confirmed/completed/cancelled.
- Site-visit property and lead are linked.
- Site-visit outcome can be recorded.

## 64.8 Media

- Multiple images can be uploaded.
- One cover image is selected.
- Video/Drone/360 URLs are supported.
- Brochure PDF can be attached.
- Missing media types do not create empty UI sections.
- Admin can remove/replace public media without deleting the underlying property record.

---

# 65. Product Data Model — Business-Level Entities

Minimum conceptual entities:

### Property

- property_id
- category
- transaction_type
- listing_status
- availability_status
- title
- description
- district
- taluka
- village_locality
- broad_address
- location_mode
- latitude/longitude
- area
- area_original
- area_original_unit
- standardized_area fields
- dimensions
- road_access
- road_width
- price_mode
- price_total
- price_unit
- price_negotiable
- category-specific fields
- verification fields
- published_at
- updated_at
- archived_at

### Owner / Party

- party_id
- name
- phone
- email
- relationship
- consent
- internal notes

### Property–Party relationship

Needed because one property may have:

- owner
- co-owner
- authorized representative
- broker/intermediary

### Media

- media_id
- property_id
- type
- URL/file reference
- public/private
- cover flag
- order
- source

### Verification

- verification_id
- property_id
- signal_type
- status
- source
- reviewed_by
- reviewed_at
- internal note
- public label
- public explanation

### Owner Submission

- submission_id
- party
- land details
- documents
- workflow status
- notes
- created_at
- updated_at

### Lead

- lead_id
- contact
- source
- inquiry type
- pipeline status
- requirement fields
- linked properties
- follow-up
- notes

### Lead Activity

- activity_id
- lead_id
- type
- timestamp
- note
- property_id optional

### Site Visit

- visit_id
- lead_id
- property_id
- preferred date/time
- confirmed date/time
- status
- outcome
- notes

### Guide

- guide_id
- title
- slug
- category
- status
- author
- reviewed_at
- published_at

### Location

- state
- district
- taluka
- village/locality
- aliases
- active flag

---

# 66. Future Expansion — Gujarat

The product should become Gujarat-ready without making V1 feel like a national portal.

Keep flexible:

- district hierarchy
- taluka/village
- planning authority
- local land units
- legal terminology
- industrial authorities
- price units
- language
- documents
- assigned salesperson
- regional content

Do not build a complex state-by-state rule engine in V1.

Instead create configurable fields for:

- local unit conversion
- verification checklist
- category-specific attributes
- authorities
- location hierarchy

---

# 67. Future Expansion — India

Future Indian expansion will introduce differences in:

- land records
- agricultural transfer rules
- terminology
- state planning rules
- registration
- local units
- languages
- industrial authority structure
- taxes/fees
- documentation
- buyer eligibility

Therefore:

- do not hard-code Gujarat-specific law as universal logic
- do not hard-code one “7/12 equivalent” field name
- allow state-specific document types
- allow state-specific legal content
- allow local unit configurations
- allow future language localization

But none of that should complicate the public V1 interface.

---

# 68. Operational Dependencies

UrbanEdge Land Space will depend on:

- timely owner responses
- accurate inventory maintenance
- access to supporting documents
- admin follow-up discipline
- photography/media quality
- external government portals
- planning authority information
- legal review when needed

The system should make these dependencies visible rather than hiding them.

---

# 69. Risks

## Risk 1 — False confidence from verification

### Mitigation

Scoped statuses and disclaimers.

---

## Risk 2 — Stale availability

### Mitigation

Availability status + last updated + admin review.

---

## Risk 3 — Exact-location bypass

### Mitigation

Approximate default + exact per-listing control.

---

## Risk 4 — Wrong land classification

### Mitigation

Admin controlled category + supporting evidence + no automatic inference.

---

## Risk 5 — Mixed units

### Mitigation

Preserve original unit + normalized search values.

---

## Risk 6 — Legal changes

### Mitigation

Do not hard-code legal rules in marketing. Date/reference legal guidance and require professional review.

---

## Risk 7 — Thin SEO pages

### Mitigation

Publish location/category pages only when useful inventory/content exists.

---

## Risk 8 — CRM overload

### Mitigation

Start with one central admin and a simple pipeline.

---

## Risk 9 — Overbuilding too early

### Mitigation

Explicit V1 exclusions.

---

# 70. Open Business Decisions

The following should remain configurable or be confirmed by UrbanEdge before final implementation:

1. Public use of exact coordinates on premium/large parcels.
2. Default public price mode for each category.
3. Whether owner phone number is ever public.
4. Exact legal disclaimer wording.
5. Which verification signals UrbanEdge is willing to publicly display.
6. Whether “Information Reviewed” and “Documents Reviewed” are both public.
7. Minimum document requirements by category.
8. Whether property IDs stay sequential or use category prefixes.
9. Whether industrial land from GIDC can be marketed as a separate inventory type.
10. Commission/brokerage commercial policy.
11. Whether brokers/intermediaries can submit third-party property.
12. How owner consent is recorded for third-party listings.
13. Whether selected off-market inventory can be shown as “Contact UrbanEdge” without photos/location.
14. Whether Gujarat expansion is opened as soon as inventory exists or only after Ahmedabad/Gandhinagar process maturity.

### Sensible V1 defaults

- approximate map
- Price on Request
- curated listing publication
- one admin
- manual site visit confirmation
- central CRM
- structured verification signals
- no customer account
- WhatsApp + Call + Inquiry
- no payment
- no open marketplace

---

# 71. Business Rules

1. No property becomes public merely because an owner submits it.
2. Every public property must have a unique Property ID.
3. Every public property must have an availability status.
4. Exact coordinates are not public by default.
5. All public verification statements must have a defined scope.
6. Owner documents are private by default.
7. Price may be hidden as “Price on Request.”
8. Category-specific fields are optional outside their relevant land type.
9. Buyer requirements without a property must enter CRM as generic requirements.
10. A property can be linked to multiple leads.
11. One lead can be linked to multiple properties.
12. Site visits are linked to both a lead and a property.
13. Listing status and availability status are separate.
14. Archived properties are retained internally.
15. Sold/leased/rented properties should not continue to appear as available.
16. No legal/title guarantee is implied by normal UrbanEdge verification.
17. Official government sources can be referenced but are not silently represented as live integrations unless integrated.
18. Any state-specific legal rule must be confirmed before being used in automated eligibility logic.

---

# 72. Suggested Public Navigation

### Main

- Home
- Agricultural Land
- NA Land
- Industrial Land
- Buy
- Rent / Lease
- Sell Your Land
- Guides
- About UrbanEdge
- Contact

### Utility

- Search
- Property ID
- WhatsApp
- Call

Avoid a crowded mega-menu in V1.

---

# 73. Suggested Conversion Hierarchy

## Primary

`Explore Land`

## Secondary

`Sell Your Land`

## Property detail

`Enquire Now`  
`WhatsApp`  
`Call`  
`Request Site Visit`

## No result

`Tell Us Your Requirement`

---

# 74. Trust Positioning

Recommended messaging themes:

- Curated land inventory
- Local Ahmedabad/Gandhinagar expertise
- Property ID based communication
- Clear verification scope
- Site-visit assistance
- Human brokerage support
- No exaggerated promises

Avoid:

- “100% legal guarantee”
- “Guaranteed investment”
- “Government approved” unless property-specific evidence supports it
- “Best price guaranteed”
- “No risk”

---

# 75. What Happens Online vs Offline

## Online

- search
- filter
- compare at a basic level
- view media
- see broad location
- view verification signals
- submit inquiry
- WhatsApp
- call
- request site visit
- submit land
- read guides

## Offline / human-assisted

- owner qualification
- document collection
- deeper document review
- exact location release when appropriate
- site visit confirmation
- physical site visit
- negotiation
- legal due diligence
- drafting
- payment
- registration
- final closure

This boundary is fundamental to the product.

---

# 76. V1 Product Philosophy

### Principle 1 — Curate before scale

A smaller, better-quality inventory is more valuable than a large stale inventory.

### Principle 2 — Structured land data

Land must not be reduced to one text description.

### Principle 3 — Scope every trust signal

“Verified” must always answer: verified for what?

### Principle 4 — Protect sensitive location

Location is valuable but can create bypass and privacy problems.

### Principle 5 — CRM before automation

Capture and follow up reliably before adding AI/automation.

### Principle 6 — Offline expertise is part of the product

The website is not replacing the brokerage; it is making the brokerage easier to discover and operate.

---

# 77. FINAL V1 REQUIREMENTS MATRIX

| Feature | V1/Future | Priority | Business Reason |
|---|---|---:|---|
| Land-only marketplace model | V1 | Must | Core product definition |
| Ahmedabad + Gandhinagar | V1 | Must | Initial market |
| Agricultural category | V1 | Must | Core inventory |
| NA category | V1 | Must | Core inventory |
| Industrial category | V1 | Must | Core inventory |
| Buy | V1 | Must | Primary discovery |
| Rent | V1 | Must | Transaction intent |
| Lease | V1 | Must | Land/industrial commercial need |
| Sell Your Land | V1 | Must | Owner acquisition |
| Search | V1 | Must | Core discovery |
| Location hierarchy | V1 | Must | Land search |
| Budget | V1 | Must | Qualification |
| Area | V1 | Must | Qualification |
| Property ID | V1 | Must | Identity / sharing |
| Approximate maps | V1 | Must | Privacy + usefulness |
| Exact maps | V1 | Should | Selected listings |
| Hidden maps | V1 | Should | Sensitive properties |
| Photos | V1 | Must | Trust |
| Video URL | V1 | Should | Rich presentation |
| Drone URL | V1 | Should | Land context |
| PDF brochure | V1 | Should | Common sales asset |
| 360 URL | V1 | Should | Premium property experience |
| Inquiry | V1 | Must | Structured lead |
| WhatsApp | V1 | Must | High-intent channel |
| Call | V1 | Must | High-intent channel |
| Site visit request | V1 | Must | Brokerage conversion |
| Generic requirement | V1 | Must | Capture off-market demand |
| Owner submission | V1 | Must | Supply acquisition |
| Admin review | V1 | Must | Curated model |
| Verification signals | V1 | Must | Trust |
| Central CRM | V1 | Must | Follow-up |
| Activity timeline | V1 | Must | Operational memory |
| Follow-up date | V1 | Must | Sales discipline |
| Site visit pipeline | V1 | Must | Conversion |
| Basic analytics | V1 | Must | Business decisions |
| Guides | V1 | Should | SEO/trust |
| SEO location pages | V1 | Should | Organic acquisition |
| Buyer accounts | Later | No | Unnecessary now |
| Seller accounts | Later | No | Curated model |
| Public agents | Later | No | Marketplace complexity |
| Reviews | Later | No | Moderation burden |
| Paid listings | Later | No | Not core monetization |
| Payments | Later | No | Offline closure |
| In-app chat | Later | No | WhatsApp/call sufficient |
| AI chatbot | Later | No | Human qualification |
| Automatic valuation | Later | No | High risk |
| Mortgage tools | Later | No | Not core |
| WhatsApp API | Later | No | Add after operational need |
| SMS | Later | No | Low V1 necessity |
| Automatic calendar | Later | No | Manual confirmation fits V1 |

---

# 78. Final Product Handoff

# URBANEDGE LAND SPACE — FINAL V1 PRODUCT DEFINITION

UrbanEdge Land Space is a **brokerage-led, curated land discovery and lead-management platform** for **Ahmedabad and Gandhinagar**.

It is separate from UrbanEdge Living Space.

## What the product is

A land-specialist website and internal business system for:

- Agricultural Land
- NA Land
- Industrial Land

with transaction intents:

- Buy
- Rent
- Lease

and an owner acquisition workflow:

- Sell Your Land

## Who it serves

Primary:

- land buyers
- investors
- farmers/agricultural buyers
- developers/builders
- industrial businesses
- logistics/manufacturing users
- landowners

Secondary:

- remote/NRI buyers
- brokers/intermediaries submitting inventory

## What V1 contains

### Public website

- premium land-focused homepage
- Agricultural / NA / Industrial category pages
- search
- filters
- property results
- property details
- stable Property ID
- approximate/exact/hidden location modes
- maps
- structured area and price
- images
- video/drone/PDF/360 links
- WhatsApp
- Call
- Inquiry
- Site Visit Request
- generic buyer requirement form
- Sell Your Land
- Guides
- Ahmedabad/Gandhinagar SEO landing pages
- About/Contact
- Terms/Privacy/Disclaimer

### Internal system

- one-admin dashboard
- property CRUD
- property review/publish/archive
- availability management
- media management
- owner submissions
- verification workflow
- CRM
- lead pipeline
- activity timeline
- follow-up tracking
- site visits
- buyer requirements
- guide management
- location management
- SEO fields
- basic analytics
- audit trail

## What V1 excludes

- buyer accounts
- seller dashboards
- public agent marketplace
- public reviews
- paid listings
- memberships
- payment gateway
- in-app messaging
- AI chatbot
- automatic valuation
- mortgage tools
- WhatsApp Business API dependency
- SMS automation
- full automatic booking calendar
- full legal due diligence system
- online land registration
- title guarantee product

## Core workflows

### Buyer

`Search → Results → Property Detail → Inquiry/WhatsApp/Call → Qualification → Site Visit → Negotiation → Closed/Nurture`

### No-match buyer

`Search → No Results → Buyer Requirement → CRM → Property Matching → Site Visit`

### Landowner

`Sell Your Land → Submission → Contact → Documents → Review → Verification → Approved → Listing → Leads`

### Site Visit

`Requested → Contacted → Proposed → Confirmed → Completed → Follow-up`

### Lead

`New → Contact Attempted → Qualified → Requirement Confirmed → Property Matched → Site Visit Requested → Site Visit Confirmed → Site Visit Completed → Negotiation → Won/Lost/Nurture`

## Admin model

V1 has one administrator with full control.

The data model must nevertheless support future:

`assigned_to`

and future role-based permissions without redesigning the core property/lead records.

## CRM

The CRM is the central operational system.

It must capture:

- source
- buyer requirement
- linked property
- status
- follow-up
- activities
- site visits
- outcome
- loss reason

One lead can link to multiple properties, and one property can receive multiple leads.

## Verification philosophy

UrbanEdge must not use a generic Boolean “Verified” as a substitute for legal certainty.

Use scoped statuses such as:

- Information Reviewed
- Documents Reviewed
- Location Reviewed
- Site Visited
- Survey Reviewed
- Legal Review Completed

Public wording must clearly state what was checked and what was not.

Verification is a **trust signal**, not a title guarantee.

## Geographic scope

V1:

- Ahmedabad
- Gandhinagar

Future:

- Gujarat
- India

Geographic hierarchy must therefore remain configurable.

## Expansion direction

The architecture/business model should support:

- more Gujarat districts
- state-specific land terminology
- local units
- local legal/document types
- planning authorities
- industrial authorities
- multiple languages
- salesperson assignment
- larger inventory

without forcing that future complexity into the V1 UI.

## Default decisions

Unless UrbanEdge explicitly changes them:

- approximate location is public default
- exact location is admin-controlled
- hidden location is supported
- Price on Request is supported/default
- buyer does not need an account
- seller does not get a dashboard
- owner submission never publishes automatically
- site visits are manually confirmed
- one central CRM is used
- verification is scoped and explainable
- transactions close offline
- legal due diligence remains outside the product

## Product success definition

V1 is successful when UrbanEdge can reliably:

1. attract a visitor looking for land in Ahmedabad/Gandhinagar,
2. help the visitor find relevant curated inventory,
3. explain the property clearly,
4. capture a high-quality inquiry,
5. contact and qualify the lead,
6. arrange a site visit,
7. keep follow-ups organized,
8. acquire additional land inventory from owners,
9. convert suitable submissions into high-quality public listings,
10. measure which properties and marketing sources create actual brokerage opportunities.

The product should optimize for **qualified land opportunities and completed brokerage workflows**, not maximum listing count, page count or vanity traffic.

---

# 79. Launch Readiness Checklist

## Business

- [ ] Ahmedabad/Gandhinagar inventory confirmed
- [ ] category definitions confirmed
- [ ] transaction terminology confirmed
- [ ] brokerage/commission rules documented internally
- [ ] owner consent wording approved
- [ ] public verification wording approved
- [ ] legal disclaimer reviewed

## Inventory

- [ ] Property ID convention confirmed
- [ ] area/unit policy configured
- [ ] price modes configured
- [ ] location privacy policy configured
- [ ] media checklist defined
- [ ] category-specific fields tested

## CRM

- [ ] lead stages configured
- [ ] follow-up workflow configured
- [ ] site visit workflow configured
- [ ] loss reasons configured
- [ ] source list configured

## Website

- [ ] home
- [ ] categories
- [ ] search
- [ ] filters
- [ ] property detail
- [ ] inquiry
- [ ] WhatsApp
- [ ] call
- [ ] site visit
- [ ] buyer requirement
- [ ] Sell Your Land
- [ ] guides
- [ ] legal pages

## Admin

- [ ] property CRUD
- [ ] submissions
- [ ] verification
- [ ] media
- [ ] CRM
- [ ] site visits
- [ ] analytics
- [ ] audit

## SEO

- [ ] unique listing content
- [ ] category pages
- [ ] Ahmedabad/Gandhinagar pages
- [ ] no empty programmatic pages
- [ ] sold/archive behavior
- [ ] guide content reviewed

---

# 80. Final Scope-Control Rule

When a proposed feature is not clearly connected to one of these V1 jobs:

**Discover → Qualify → Visit → Negotiate → Close**

or

**Acquire Owner → Review → Verify → Publish → Generate Leads**

it should not be added to V1 merely because it is technically possible.

This document is the authoritative business/product scope for the first production version of UrbanEdge Land Space.

