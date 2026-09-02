# URBANEDGE LAND SPACE — PAGE, ROUTE & UX ARCHITECTURE

**File:** `02-PAGE-ROUTE-UX-ARCHITECTURE.md`  
**System:** UrbanEdge Land Space V1  
**Parent architecture:** `01-MASTER-WEBSITE-ARCHITECTURE.md`  
**Status:** Authoritative page, route, information-architecture and UX contract  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Primary domain:** `https://urbanedgelandspace.com`  
**Architecture date:** 29 August 2026

---

## 0. Document Purpose

This document defines the complete V1 **page architecture, route architecture, information hierarchy, navigation model, user journeys, reusable UI patterns, responsive behavior, page-state behavior, CTA hierarchy, public/admin screen structure, property discovery UX, Sell Your Land flow, site-visit UX, guide/content UX, and URL-state strategy** for UrbanEdge Land Space.

It is the page-and-experience contract that sits below the parent technical architecture.

The parent architecture already establishes UrbanEdge Land Space as:

- a brokerage-led, curated land discovery and lead-management platform;
- focused initially on Ahmedabad and Gandhinagar;
- dedicated to Agricultural, NA and Industrial land;
- supporting Buy, Rent and Lease discovery;
- supporting Sell Your Land as a controlled owner-submission workflow;
- using one public website and one private admin system;
- rendering public discovery content server-first;
- keeping private operational information outside public projections.

This document converts those system boundaries into a concrete website and admin experience.

### Explicit non-goals

This document does **not** define:

- PostgreSQL table structures;
- storage bucket architecture;
- row-level security policies;
- database normalization;
- exact API schemas;
- infrastructure provisioning;
- implementation code.

Those belong to the parent and specialist architecture documents.

---

# 1. UX Executive Summary

UrbanEdge Land Space should feel like:

> **The same UrbanEdge company, with a specialist land-discovery product built around curation, clarity, trust and human brokerage.**

The UX should not resemble a mass-market classifieds marketplace.

The core public experience is:

```text
Land discovery
    ↓
Useful filtering
    ↓
Clear property understanding
    ↓
Human-assisted conversion
```

The core owner experience is:

```text
Sell Your Land
    ↓
Structured submission
    ↓
Human review
    ↓
Controlled publication
```

The core admin experience is:

```text
New information
    ↓
Review / qualify
    ↓
Act
    ↓
Follow up
    ↓
Convert / archive / nurture
```

The site therefore optimizes for **qualified land opportunities and completed brokerage workflows**, not maximum page count or maximum listing volume.

---

# 2. Foundational UX Principles

## 2.1 Discovery before complexity

A visitor should understand what UrbanEdge Land Space does within a few seconds:

- land, not apartments;
- Ahmedabad and Gandhinagar;
- Agricultural, NA and Industrial;
- Buy, Rent and Lease;
- curated inventory;
- human assistance.

Complex land fields should appear progressively, not all at once.

## 2.2 Search is the primary public utility

Search should be visible early and often.

The default mental model is:

```text
Where?
What type of land?
What transaction?
What size / budget?
```

More advanced land-specific fields appear after the basic intent is established.

## 2.3 Property detail is the main conversion asset

The listing result gets attention.

The property detail page earns trust.

The action layer converts that trust into:

- inquiry;
- WhatsApp;
- call;
- site-visit request.

## 2.4 Trust signals must be scoped

The UI must never reduce complex verification into an unexplained generic “Verified” state.

Public trust signals should describe what UrbanEdge checked, for example:

- Information Reviewed;
- Documents Reviewed;
- Location Reviewed;
- Site Visited;
- Survey Reviewed;
- Legal Review Completed.

The presentation should reinforce:

> verification is a trust signal, not a title guarantee.

## 2.5 Exact location is not a default public disclosure

The public experience defaults to an approximate map/location presentation.

The property can use:

- Exact;
- Approximate;
- Hidden

location modes.

Exact public coordinates must be treated as a controlled administrative decision.

## 2.6 No dead ends

Every important discovery failure should create another useful path.

Examples:

```text
No search result
    → broaden filters
    → explore category
    → Tell UrbanEdge Your Requirement

Unavailable property
    → Find Similar Land
    → Contact UrbanEdge
```

## 2.7 Human brokerage remains visible

The interface should not imply that the website automatically completes the transaction.

The product supports:

- discovery;
- inquiry;
- qualification;
- site-visit requests;
- communication;
- follow-up.

The deeper transaction remains human-assisted.

## 2.8 Land-specific information replaces residential metaphors

Do not reuse residential concepts such as:

- BHK;
- rooms;
- apartment configuration;
- floor-plan-centric hierarchy.

Use:

- land type;
- transaction;
- area;
- locality;
- road access;
- frontage;
- dimensions;
- irrigation/water;
- zone/NA context;
- industrial estate/authority;
- infrastructure;
- verification;
- connectivity.

---

# 3. Global Information Hierarchy

The public website uses a five-level hierarchy.

## Level 1 — Brand and intent

The visitor must immediately understand:

1. UrbanEdge Land Space
2. Ahmedabad + Gandhinagar
3. Agricultural / NA / Industrial
4. Buy / Rent / Lease
5. Find land or sell land

## Level 2 — Discovery controls

Primary discovery dimensions:

1. District
2. Taluka
3. Village/locality
4. Land category
5. Transaction
6. Budget
7. Area
8. Property ID
9. Free-text search
10. Map

## Level 3 — Property qualification

A visitor should be able to answer:

- What is it?
- Where is it?
- How much land is there?
- What is the commercial expectation?
- What road/access context exists?
- What use/status information is available?
- What has UrbanEdge actually reviewed?
- What can I ask UrbanEdge next?

## Level 4 — Conversion

Primary property conversion:

`Enquire Now`

High-intent alternatives:

`WhatsApp`  
`Call`  
`Request Site Visit`

## Level 5 — Assistance

When the visitor cannot find a match:

`Tell UrbanEdge Your Requirement`

When the visitor owns land:

`Sell Your Land`

---

# 4. Route Architecture

## 4.1 Canonical public route tree

```text
/
├── /properties
│   ├── ?[search state]
│   └── /[property-slug]
│
├── /agricultural-land
├── /na-land
├── /industrial-land
│
├── /buy
├── /rent
├── /lease
│
├── /sell-your-land
│   ├── /thank-you
│   └── /?
│
├── /requirements
│   ├── /thank-you
│   └── /?
│
├── /site-visit
│   ├── /thank-you
│   └── /?
│
├── /guides
│   ├── /[guide-slug]
│   └── /category/[category-slug]
│
├── /locations
│   ├── /ahmedabad
│   └── /gandhinagar
│
├── /locations/ahmedabad/[land-category-slug]
├── /locations/gandhinagar/[land-category-slug]
│
├── /about
├── /contact
│
├── /terms
├── /privacy
├── /disclaimer
│
├── /search
└── /404
```

### Route philosophy

The route tree separates:

- direct discovery;
- category discovery;
- transaction discovery;
- conversion workflows;
- editorial content;
- location SEO;
- trust/legal pages.

Query parameters should carry dynamic search/filter state instead of creating arbitrary path permutations.

---

# 5. Public Navigation Architecture

## 5.1 Desktop primary navigation

The desktop header should remain compact and avoid a mega-menu.

Recommended visible navigation:

```text
Logo
Home
Agricultural Land
NA Land
Industrial Land
Buy
Rent / Lease
Sell Your Land
Guides
About
Contact
[WhatsApp CTA]
```

The exact visible item count may be reduced at narrower desktop widths using a compact “More” grouping rather than allowing the header to become crowded.

## 5.2 Utility discovery controls

The site should provide:

- Search access;
- Property ID search;
- WhatsApp;
- Call.

Property ID should be easy to reach without becoming a dominant top-level navigation item.

## 5.3 Mobile navigation

Below the desktop breakpoint, use the established UrbanEdge mobile pattern:

```text
Logo
Menu trigger
```

The mobile menu opens as a controlled panel containing:

```text
Home
Explore Land
Agricultural Land
NA Land
Industrial Land
Buy
Rent
Lease
Sell Your Land
Guides
About
Contact
WhatsApp
Call
Property ID Search
```

The menu should not become a long accordion hierarchy in V1.

## 5.4 Active navigation rules

Active state should be obvious but restrained:

- gold text/accent;
- subtle gold indicator;
- no oversized animated navigation.

---

# 6. Global Public Page Shell

Every normal public page should use:

```text
Global Header
    ↓
Page Content
    ↓
Contextual CTA
    ↓
Global Footer
```

Exceptions:

- full-screen media/gallery overlays;
- focused form confirmation pages;
- temporary utility states.

## 6.1 Global header responsibilities

The header owns:

- brand mark;
- primary navigation;
- mobile navigation;
- primary global WhatsApp action;
- sticky behavior;
- scroll-state treatment.

It does not own domain data fetching.

## 6.2 Global footer responsibilities

Desktop:

- multi-column structure;
- dark navy surface;
- gold headings;
- white/light supporting text;
- discovery links;
- company links;
- legal links;
- contact actions.

Mobile:

- stacked sections;
- readable spacing;
- centered or left-aligned grouped content depending on component;
- no multi-column squeeze.

---

# 7. Public CTA Hierarchy

## 7.1 Global

**Primary:** `Explore Land`

**Secondary:** `Sell Your Land`

## 7.2 Property

**Primary:** `Enquire Now`

**High-intent:** `WhatsApp`

**High-intent:** `Call`

**Conversion:** `Request Site Visit`

## 7.3 No result

**Primary:** `Tell UrbanEdge Your Requirement`

**Secondary:** `Broaden Search`

**Tertiary:** `Contact UrbanEdge`

## 7.4 Guides

Primary conversion should usually be contextual rather than aggressive:

`Explore Land`

or

`Speak to UrbanEdge`

## 7.5 Avoid

Do not present five or six visually equal buttons.

The visual hierarchy should communicate the business priority.

---

# 8. Route-by-Route Public Architecture

# 8.1 `/` — Homepage

## Purpose

Primary brand, discovery and conversion entry point.

## User jobs

A new visitor should be able to:

- understand the product;
- search land;
- choose a category;
- choose a transaction;
- see proof of curation/trust;
- open featured inventory;
- submit a requirement;
- sell land;
- discover useful guides.

## Section hierarchy

### Section 1 — Hero

Content:

- UrbanEdge Land Space identity;
- headline;
- short support statement;
- primary search;
- primary CTA: `Explore Land`;
- secondary CTA: `Sell Your Land`.

Recommended positioning:

> Land opportunities, curated by UrbanEdge.

Supporting direction:

> Agricultural, NA and industrial land across Ahmedabad and Gandhinagar, with local guidance from enquiry to site visit.

### Section 2 — Quick discovery

Chips/cards:

- Agricultural
- NA
- Industrial
- Buy
- Rent
- Lease

### Section 3 — Trust / proof

Use concise statements such as:

- Curated inventory;
- Local Ahmedabad/Gandhinagar knowledge;
- Property ID communication;
- Scoped verification;
- Site-visit assistance.

Avoid unsupported numerical claims.

### Section 4 — Featured land

Land listing cards with a limited curated set.

### Section 5 — Discover by location

Start with:

- Ahmedabad;
- Gandhinagar.

Do not create dozens of empty location links.

### Section 6 — Why UrbanEdge

Explain the brokerage model:

```text
Discover
→ Understand
→ Enquire
→ Visit
→ Proceed with guidance
```

### Section 7 — Sell Your Land

Owner-facing band with one clear explanation and strong CTA.

### Section 8 — Guides

A concise selection of useful land guides.

### Section 9 — Final conversion band

Strong closing CTA:

`Explore Land`

and/or

`Tell UrbanEdge Your Requirement`

## Desktop behavior

- full-bleed image-led hero;
- search controls placed above the fold;
- featured inventory in a responsive multi-column grid;
- editorial sections use balanced image/text layouts.

## Mobile behavior

- hero height reduced;
- heading scales down;
- search controls stack;
- category chips can horizontally scroll;
- listing cards become one-column;
- CTA area remains compact but touch-friendly;
- no horizontal overflow.

## States

### Loading

Use skeleton blocks for inventory only.

### Error

Show:

> We could not load the latest land opportunities right now.

Provide:

`Retry`

Do not block the entire page if static sections can still render.

### Empty featured inventory

Replace with an editorial/discovery module rather than an empty grid:

`Explore All Land`

---

# 8.2 `/properties` — Search / Results

## Purpose

Primary structured land-discovery workspace.

## User jobs

- refine location;
- refine land type;
- refine transaction;
- compare candidates;
- sort;
- inspect result density;
- open details;
- recover from no-match.

## Page hierarchy

```text
Compact hero / search context
        ↓
Search summary
        ↓
Filter controls
        ↓
Result count + sort
        ↓
Results grid/list
        ↓
Pagination
        ↓
Requirement CTA
```

## Search header

Show:

- current query;
- selected location/category/transaction;
- result count;
- optional breadcrumb.

## Filter architecture

### Basic filters

- Location;
- Land Type;
- Transaction;
- Budget;
- Area;
- Availability;
- Property ID;
- Road access;
- Price on Request / Listed Price.

### Category-specific filters

Agricultural:

- irrigation/water;
- road access;
- soil;
- fenced;
- village/taluka.

NA:

- NA status;
- intended/approved use where documented;
- zone;
- planning authority;
- road width.

Industrial:

- GIDC / non-GIDC;
- industrial estate;
- road width;
- power;
- water;
- gas;
- logistics/highway connectivity;
- authority.

### Advanced filters

Collapsed by default:

- ownership type;
- survey/block;
- TP/FP/OP;
- frontage;
- dimensions;
- corner;
- boundary;
- title/document review status;
- site visited;
- drone;
- 360;
- brochure.

## Desktop layout

At large desktop:

```text
| Filter rail | Results content          |
|             | count + sort             |
|             | listing grid             |
```

The filter rail is persistent or visually stable.

## Tablet behavior

Transition away from a permanent sidebar when space becomes constrained.

Use:

`Filters (N)`

to open the filter panel.

## Mobile behavior

The mobile pattern should follow the source design reference:

- results remain visible;
- filters open in a fixed bottom sheet;
- sheet covers roughly the lower portion of the viewport;
- backdrop/scrim blocks accidental background interaction;
- top corners rounded;
- footer actions stay accessible.

Recommended bottom-sheet footer:

`Clear` + `Apply Filters`

## Result controls

Support:

- sorting;
- pagination;
- optional compact list/grid presentation if it proves useful.

Do not overbuild map/list synchronized interaction in V1.

## Loading

Initial page:

- card skeletons;
- preserve filter shell;
- preserve page structure.

Filter change:

- do not blank the entire page;
- use a loading indicator associated with the result area.

## Error

Show inline result-area error with:

`Retry`

Preserve the currently selected filters.

## Empty

Do not show only:

> No properties found.

Show:

```text
No matching land is currently listed.

Try:
- broadening location
- broadening budget
- broadening area
```

Then primary CTA:

`Tell UrbanEdge Your Requirement`

## Search result card hierarchy

1. Image
2. Land type / transaction pills
3. Property ID
4. Title
5. Broad location
6. Area
7. Key road/access or category signal
8. Price / POR
9. Verification signals
10. Updated date
11. `View Property`
12. `WhatsApp`

Do not expose owner phone by default.

---

# 8.3 `/agricultural-land` — Agricultural Category

## Purpose

Blend category education with real inventory.

## Page hierarchy

```text
Hero
    ↓
What Agricultural Land means in UrbanEdge inventory
    ↓
Common search criteria
    ↓
Available Agricultural Land
    ↓
Agricultural-specific filters / discovery
    ↓
Relevant guides
    ↓
Inquiry / requirement CTA
```

## Key UX content

Explain the practical buying dimensions:

- village/taluka;
- area;
- road access;
- irrigation/water;
- current use;
- fencing;
- availability;
- verification.

## Trust/legal framing

Do not state universal agricultural purchase eligibility.

Where legal context is mentioned, use carefully scoped language and avoid “anyone can buy” or equivalent claims.

## Inventory state

If useful inventory is insufficient, prioritize meaningful category content and the requirement CTA rather than producing a thin SEO page.

---

# 8.4 `/na-land` — NA Category

## Purpose

Help visitors discover NA land while clearly separating land status from development guarantees.

## Page hierarchy

```text
Hero
    ↓
What NA means in UrbanEdge inventory
    ↓
Status/use/zoning explanation
    ↓
Available NA Land
    ↓
NA filters
    ↓
Relevant guide content
    ↓
Enquiry CTA
```

## Required conceptual UX rule

Never present:

`NA = development guaranteed`

Prefer:

> NA/status information is presented according to the available property evidence and remains subject to the applicable documents and authorities.

---

# 8.5 `/industrial-land` — Industrial Category

## Purpose

Serve developers, manufacturers, logistics operators and businesses looking for industrial land.

## Page hierarchy

```text
Hero
    ↓
Industrial land overview
    ↓
GIDC / non-GIDC distinction
    ↓
Infrastructure and connectivity criteria
    ↓
Available industrial land
    ↓
Industrial guides
    ↓
Industrial requirement CTA
```

## Important discovery dimensions

- GIDC / non-GIDC;
- estate;
- authority;
- road width;
- power;
- water;
- drainage;
- gas;
- logistics/highway connectivity;
- use/status.

The interface should distinguish authority-controlled industrial estate context from privately marketed industrial land.

---

# 8.6 `/buy` — Buy Discovery Landing

## Purpose

A transaction-intent landing page for buyers.

## UX

The page should not duplicate the entire category experience.

It should:

- explain the buying journey;
- expose the main category choices;
- expose a simple land search;
- surface featured buy inventory;
- link to relevant buyer guides;
- provide the requirement form.

## CTA

`Explore Land for Purchase`

---

# 8.7 `/rent` — Rent Discovery Landing

## Purpose

Provide a clear rental intent landing point.

## Key content

- rental land inventory;
- relevant category filters;
- price presentation;
- term context where published;
- inquiry CTA.

Avoid forcing a rigid legal interpretation of “rent.”

---

# 8.8 `/lease` — Lease Discovery Landing

## Purpose

Separate lease discovery from rent because land and industrial commercial arrangements may have materially different economics and terms.

## Key content

- lease inventory;
- term where known;
- commercial structure;
- category;
- area;
- location;
- infrastructure;
- inquiry/site-visit CTA.

---

# 8.9 `/properties/[property-slug]` — Property Detail

## Purpose

Primary qualification and conversion surface.

## Page hierarchy

```text
Breadcrumb
    ↓
Hero / gallery
    ↓
Title + status + actions
    ↓
Key facts
    ↓
Overview
    ↓
Location / map
    ↓
Land characteristics
    ↓
Infrastructure / connectivity
    ↓
Verification
    ↓
Media / documents / brochure
    ↓
Inquiry / site visit
    ↓
Related land
    ↓
Disclaimer
```

## Above the fold

Must show:

- Property ID;
- land category;
- transaction;
- title;
- area;
- broad location;
- price/POR;
- cover image/gallery;
- primary action;
- WhatsApp;
- Call;
- Site Visit.

## Desktop layout

Use the established UrbanEdge detail pattern:

```text
Main content                  Sticky action/sidebar
---------------------------   ----------------------
Gallery                       Inquiry / CTA block
Title                         Key commercial facts
Overview                      Contact actions
Land facts                    Location note
Infrastructure
Verification
Media
```

The action/sidebar should remain useful while scrolling.

## Mobile layout

The page becomes one continuous stack.

Recommended action order:

1. title + core facts;
2. primary `Enquire Now`;
3. `WhatsApp`;
4. `Call`;
5. `Request Site Visit`;
6. details.

A mobile sticky action bar may be used when appropriate, but it must not cover content or keyboard input.

## Gallery

Land imagery should prioritize:

- parcel/context images;
- aerial/drone images;
- road/access views;
- boundaries/context;
- nearby infrastructure.

Use:

- cover crop;
- rounded clipping;
- subtle image zoom on desktop;
- lazy loading where appropriate;
- accessible captions/alt text.

## Property facts

### Shared

- Property ID;
- category;
- transaction;
- location;
- area;
- price/POR;
- availability;
- road access;
- connectivity;
- verification.

### Agricultural

- irrigation;
- water source;
- soil if supported;
- cultivation/current use;
- fencing;
- farm access.

### NA

- NA status;
- purpose/use;
- zone;
- planning authority;
- development permission status where documented;
- road width;
- TP/FP/OP references where approved for publication.

### Industrial

- GIDC/non-GIDC;
- industrial estate;
- authority;
- industrial use/category;
- dimensions;
- road frontage;
- road width;
- power;
- water;
- drainage;
- gas;
- logistics.

## Location presentation

Clearly label:

`Approximate location`

or

`Exact location`

or

`Location details available through UrbanEdge`

Do not let the visual map imply precision that is not intentionally published.

## Verification presentation

Each badge should have an explanatory interaction:

```text
Documents Reviewed
What this means →
```

The explanatory copy must state scope and limitations.

## Media links

Support:

- video;
- drone video;
- brochure;
- 360°.

These can open a modal, new page, or controlled external view depending on asset type.

## Sold/unavailable behavior

If the property is no longer available:

- visibly show `Sold`, `Leased`, `Rented`, or another relevant status;
- stop presenting it as currently available;
- replace primary conversion with `Find Similar Land` where appropriate.

---

# 8.10 `/search` — Global Search

## Purpose

A lightweight entry point for visitors starting with a broad query or Property ID.

## Modes

### General search

- district;
- taluka;
- locality;
- type;
- transaction;
- keyword.

### Property ID

If a recognizable Property ID pattern is entered, route to the relevant property or a focused result state.

## UX

Search should gracefully convert into `/properties?...` state rather than becoming an independent search ecosystem.

---

# 8.11 `/requirements` — Tell UrbanEdge Your Requirement

## Purpose

Capture high-value buyer demand even when there is no exact public listing.

## Primary journey

```text
No Match / Navigation
    ↓
Requirement form
    ↓
Success
    ↓
UrbanEdge contacts buyer
```

## Form sections

### Contact

- Name
- Mobile
- Email optional

### Buyer profile

- Buyer type
- Transaction intent

### Land requirement

- Land type
- Preferred district
- Taluka
- Village/localities
- Budget
- Minimum area
- Maximum area
- Intended use
- Timeline
- Requirement notes

### Consent

Explicit consent.

## UX rules

- group related fields;
- use progressive disclosure;
- preserve entered data on validation error;
- show a concise summary before final submit when useful;
- do not require account creation.

## Success page

Message:

> Thank you. Your requirement has been shared with UrbanEdge. Our team will review it and contact you about suitable land opportunities.

Primary CTA:

`Continue Exploring Land`

Secondary:

`Back to Home`

---

# 8.12 `/requirements/thank-you`

## Purpose

Clear conversion confirmation without unnecessary navigation.

## Sections

- confirmation icon/state;
- short explanation;
- expected next step;
- `Explore Land`;
- `Return Home`.

Do not promise an exact response time unless configured operationally.

---

# 8.13 `/site-visit`

## Purpose

Request a preferred site-visit time without automatic booking.

## Primary journey

```text
Property Detail
    ↓
Request Site Visit
    ↓
Preferred date/time
    ↓
Contact details
    ↓
Submit request
    ↓
Manual UrbanEdge confirmation
```

## Fields

- property context;
- preferred date;
- preferred time window;
- contact number;
- alternate time optional;
- note;
- consent where necessary.

## UX message

Make it explicit:

> This is a request, not an automatic calendar booking. UrbanEdge will confirm the visit after checking access and availability.

## Why this matters

Land visits can depend on:

- owner availability;
- parcel access;
- weather;
- security;
- industrial gate permission;
- changing property availability.

---

# 8.14 `/site-visit/thank-you`

## Content

```text
Site visit request received
    ↓
UrbanEdge will contact you to confirm
    ↓
Explore similar land
```

Avoid presenting a fake “confirmed” calendar state.

---

# 8.15 `/sell-your-land` — Owner Acquisition Flow

## Purpose

Acquire additional brokerage inventory without creating an open marketplace.

## Primary messaging

> Submit your land details. Our team will review the information and contact you before the property is listed.

## UX model

Use a multi-step form because the data is substantial.

Recommended sequence:

```text
1. Intent
2. Land Type
3. Owner
4. Location
5. Land Area
6. Commercials
7. Property Details
8. Media
9. Documents
10. Consent
```

## Step 1 — Intent

- Sell
- Lease
- Rent
- optional combined intent where supported

## Step 2 — Land Type

- Agricultural
- NA
- Industrial

## Step 3 — Owner

- Full name
- Mobile
- Email optional
- Preferred contact method
- Ownership relationship

Ownership relationship options:

- Owner
- Co-owner
- Authorized representative
- Broker/intermediary
- Other

## Step 4 — Location

- District
- Taluka
- Village/locality
- Broad address
- Survey/block optional in the public interaction where practical
- Map pin
- Public visibility preference:
  - Exact
  - Approximate
  - Hidden

The owner should understand that this preference influences later publication review, not an automatic publication rule.

## Step 5 — Land Area

Capture:

- numeric area;
- original/local unit;
- standardized display conversions.

Never silently replace the owner’s source unit.

## Step 6 — Commercials

- Asking price;
- display preference;
- total price;
- unit-based price;
- negotiable;
- rent/lease amount where relevant;
- deal terms;
- internal/private minimum acceptable price should not be public.

## Step 7 — Property-specific data

Show category-dependent fields.

For Agricultural:

- water;
- irrigation;
- soil;
- cultivation;
- fencing;
- access.

For NA:

- status;
- use;
- zone;
- authority;
- planning details where relevant.

For Industrial:

- GIDC;
- estate;
- authority;
- power;
- water;
- road;
- logistics;
- industrial use.

## Step 8 — Media

Support:

- photos;
- video URL;
- drone video URL;
- brochure PDF;
- 360° link.

## Step 9 — Documents

Allow submission of supporting documents for internal review.

UI wording must make clear:

> Documents are provided for UrbanEdge review and do not by themselves constitute legal certification.

## Step 10 — Consent

Required concepts:

- permission to contact;
- information submission declaration;
- privacy consent;
- acknowledgement that publication is subject to review;
- acknowledgement that document submission is not legal certification.

## Progress UX

Show:

```text
Step 4 of 10
Location
```

Do not make users wonder how much remains.

## Save behavior

V1 does not require authenticated saved drafts.

Within the active session, entered fields should survive ordinary validation and UI state changes.

## Submission success

> Thank you for sharing your land details. Our team will review the submission and contact you before any public listing is created.

Primary CTA:

`Return to UrbanEdge Land Space`

---

# 8.16 `/sell-your-land/thank-you`

## Purpose

Confirm receipt and reinforce the human review boundary.

## Must not say

- “Your property is now live.”
- “Your property is published.”
- “Buyers can contact you now.”

## Should say

- submission received;
- UrbanEdge review will follow;
- publication is controlled by UrbanEdge.

---

# 8.17 `/guides` — Guide Index

## Purpose

Provide useful, trustworthy land education and support SEO.

## Page hierarchy

```text
Editorial hero
    ↓
Search guides
    ↓
Category chips
    ↓
Featured guide
    ↓
Guide grid
    ↓
Related land CTA
```

## Guide categories

### Land Buying

Examples:

- What to check before buying agricultural land in Gujarat
- Agricultural vs NA vs industrial land
- What 7/12 / RoR information is useful for
- Why exact land-use status matters
- Questions to ask before a land site visit

### Ahmedabad / Gandhinagar

Examples:

- Land-buying considerations around Ahmedabad growth corridors
- Gandhinagar land search guide
- Understanding TP/FP references at a high level
- Industrial land search checklist

### Transaction

Examples:

- Land sale document checklist
- What to ask before renting/leasing land
- Price-per-unit terminology explained

## Search/filter

Use the established editorial pattern:

- search field;
- category chips;
- article grid;
- pagination where required.

On mobile, category chips may horizontally scroll.

---

# 8.18 `/guides/[guide-slug]` — Guide Detail

## Page hierarchy

```text
Breadcrumb
    ↓
Eyebrow/category
    ↓
Title
    ↓
Published/updated context
    ↓
Hero image
    ↓
Readable article content
    ↓
Related guides
    ↓
Relevant land CTA
```

## Reading UX

- readable measure;
- clear subheadings;
- short paragraphs;
- tables/checklists where useful;
- explicit legal disclaimers when the article touches legal interpretation.

## Conversion

The CTA should connect the article to the relevant next action:

- `Explore Agricultural Land`
- `Explore NA Land`
- `Explore Industrial Land`
- `Tell UrbanEdge Your Requirement`

Do not convert every guide into a hard sales page.

---

# 8.19 `/about` — About UrbanEdge

## Purpose

Build confidence in the brokerage relationship.

## Page hierarchy

Adapt the UrbanEdge Living Space editorial pattern:

1. Hero
2. Story
3. Who we are
4. Mission / values
5. Land-specialist service approach
6. Why local knowledge matters
7. Trust / verification philosophy
8. CTA

## Land-specific adaptation

The page should explain:

- curated inventory;
- local market knowledge;
- human qualification;
- site visits;
- scoped verification;
- brokerage support.

Do not copy residential service propositions such as guaranteed rent.

---

# 8.20 `/contact` — Contact

## Purpose

Give visitors a direct, low-friction way to reach UrbanEdge.

## Hierarchy

1. Dark image-led hero
2. Contact form
3. Contact details
4. WhatsApp action
5. Map/location context
6. Final CTA

## Contact form

Keep it shorter than the full requirement form.

Suggested fields:

- name;
- phone;
- email;
- purpose;
- message;
- consent.

## Direct actions

Use real:

- `tel:`
- `mailto:`
- WhatsApp

Do not hide direct contact behind a modal.

---

# 8.21 `/locations/ahmedabad`

## Purpose

Location-level discovery and SEO entry page.

## Required content

- Ahmedabad land market introduction;
- categories;
- supported transactions;
- active relevant inventory;
- useful local context;
- related guides;
- requirement CTA.

## Do not create

Empty or near-identical sub-location pages merely for keyword coverage.

---

# 8.22 `/locations/gandhinagar`

Same structural model as Ahmedabad, with genuinely relevant Gandhinagar content.

---

# 8.23 Location + category pages

Examples:

```text
/locations/ahmedabad/agricultural-land
/locations/ahmedabad/na-land
/locations/ahmedabad/industrial-land

/locations/gandhinagar/agricultural-land
/locations/gandhinagar/na-land
/locations/gandhinagar/industrial-land
```

These pages are valid when they contain:

- enough active inventory;
- or substantial original content and search value.

The system should not generate hundreds of thin village pages simply because the URL template exists.

---

# 8.24 `/terms`

## Purpose

Present site-use terms and brokerage/service boundaries.

## UX

- plain language;
- clear headings;
- easy scanning;
- link to privacy and disclaimer.

---

# 8.25 `/privacy`

## Purpose

Explain collection and processing of visitor/lead information.

---

# 8.26 `/disclaimer`

## Purpose

Clearly explain limitations around:

- listing information;
- availability;
- location precision;
- verification scope;
- legal/title matters;
- third-party authorities;
- transaction completion.

This page should be easy to reach from property detail and forms.

---

# 8.27 `/404`

## UX

Show:

> We could not find that page.

Then:

`Explore Land`

and:

`Return Home`

Optionally provide a search input.

Do not make a 404 page depend on a broken route-specific data fetch.

---

# 9. Shared Property-Discovery UX

# 9.1 Land Listing Card

The flagship property-card visual language should be adapted, not copied literally.

## Anatomy

```text
┌───────────────────────────────┐
│                               │
│            IMAGE              │
│     type / transaction pills  │
│                               │
├───────────────────────────────┤
│ Property ID                   │
│ Land title                    │
│ Broad location                │
│                               │
│ Area    Road/Key feature      │
│ Price / POR                   │
│                               │
│ Verification signals          │
│                               │
│ [View Property]   [WhatsApp]  │
└───────────────────────────────┘
```

## Responsibilities

The card is responsible for:

- visual scanning;
- summary;
- navigation;
- lightweight contact action.

The card is not responsible for exposing:

- owner PII;
- internal notes;
- private documents;
- exact private coordinates.

## Desktop

- image-first;
- strong elevated surface;
- subtle hover lift;
- image zoom.

## Mobile

- one-column;
- reduced image height;
- tighter padding;
- stacked action area;
- no squeezed two-column metadata.

---

# 9.2 Verification Badge

Badges should be semantically clear.

Examples:

- Information Reviewed
- Documents Reviewed
- Location Reviewed
- Site Visited
- Survey Reviewed

Interaction:

- tap/click opens short scope explanation;
- optionally reveal review date;
- never imply title guarantee.

---

# 9.3 Property ID pattern

Property IDs must be visible on:

- cards;
- detail pages;
- inquiry context;
- WhatsApp prefilled text where relevant;
- admin listing/detail screens.

Example:

`UE-LS-000001`

The category should not be encoded as the only source of meaning in the ID.

---

# 10. Search UX

# 10.1 Homepage search

Default prompt:

> Looking for land in Ahmedabad / Gandhinagar

Quick chips:

- Agricultural
- NA
- Industrial
- Buy
- Rent
- Lease

## Interaction

A visitor can start with one dimension and refine later.

Example:

```text
Ahmedabad
    ↓
Agricultural
    ↓
Buy
    ↓
Area
    ↓
Budget
```

Do not force all fields before search.

---

# 10.2 Search parsing

Search should distinguish:

- locality/location;
- property ID;
- category;
- transaction;
- general keyword.

Free text should not become the only source of truth for structured filters.

---

# 10.3 Active filter state

Show current filters above results as removable chips.

Example:

```text
Ahmedabad ×
Agricultural ×
Buy ×
10,000–20,000 sq ft ×
```

Provide:

`Clear All`

---

# 10.4 Filter count

On mobile:

`Filters (4)`

The count should reflect active user-applied filters, not every default.

---

# 10.5 Sorting

Recommended V1 options:

- Relevance;
- Newest;
- Price: Low to High;
- Price: High to Low;
- Area: Small to Large;
- Area: Large to Small.

Only offer options that have meaningful underlying data.

---

# 10.6 Pagination

Use URL-preserving pagination.

The visitor should be able to:

- refresh;
- share;
- navigate back.

Changing page must not discard filters.

---

# 11. URL-State Strategy

Search state is part of the public information architecture.

## 11.1 Canonical principle

Use readable query parameters.

Example:

```text
/properties?
district=ahmedabad
&taluka=daskroi
&locality=...
&category=agricultural
&transaction=buy
&minArea=10000
&maxArea=25000
&minPrice=...
&maxPrice=...
&availability=available
&page=2
&sort=newest
```

The exact parameter names are implementation contracts for the search specialist document; the page architecture requires that they be:

- stable;
- bookmarkable;
- shareable;
- crawlable only when appropriate;
- non-duplicative.

## 11.2 Filter state vs UI state

Persist in URL:

- search query;
- location;
- category;
- transaction;
- price;
- area;
- availability;
- property ID;
- sort;
- page.

Keep local UI state outside the URL:

- filter sheet open/closed;
- gallery modal open;
- expanded advanced filters;
- toast visibility;
- temporary unsaved form text.

## 11.3 Canonicalization

Equivalent parameter orders must resolve to the same canonical route representation where the implementation supports canonicalization.

Avoid multiple URLs for the same result state due to:

- empty parameters;
- duplicate values;
- arbitrary ordering;
- default values unnecessarily encoded.

## 11.4 SEO rule

Not every filter combination should become an indexable SEO landing page.

Search URLs are primarily user-state URLs.

Dedicated SEO pages should be selected and editorially governed.

---

# 12. Property Detail URL Strategy

Canonical form:

```text
/properties/[property-slug]
```

Optional query state may support:

- referring search;
- gallery context;
- return state.

The canonical URL must remain stable even when:

- price changes;
- availability changes;
- title wording is lightly refined.

Do not put the mutable price or date into the canonical path.

---

# 13. Form UX Architecture

# 13.1 Shared form patterns

All public forms should use the same foundational behavior:

- clear labels;
- visible required markers;
- helpful field hints;
- inline validation;
- preserved values after errors;
- concise error text;
- accessible focus behavior;
- submit-state feedback.

## 13.2 Submission states

Every form needs:

```text
Idle
→ Editing
→ Submitting
→ Success
or
→ Recoverable Error
```

## 13.3 Validation errors

Show errors next to the field.

At the top of long forms, show a summary:

> Please review the highlighted fields.

Do not erase valid input.

## 13.4 Server-side errors

Example:

> We could not submit your request. Please try again.

Provide a retry path.

## 13.5 Spam / bot controls

Anti-bot controls should be low-friction unless risk requires more.

Do not make a normal visitor solve a complex challenge by default.

---

# 14. Global Loading Architecture

## 14.1 Page loading

Use structural skeletons for:

- listing cards;
- guide cards;
- property key-fact blocks.

Avoid full-screen spinners for normal navigation.

## 14.2 Image loading

Use:

- reserved aspect-ratio containers;
- image placeholders;
- lazy loading below the fold;
- eager loading for the primary hero image when appropriate.

## 14.3 Form submission

Primary submit button becomes:

`Submitting…`

with action protection against accidental duplicate submits.

## 14.4 Admin loading

Prefer skeletons for lists and detail panels, but prioritize operational responsiveness over decorative animations.

---

# 15. Global Empty States

Empty states should explain:

1. what is empty;
2. why that matters;
3. what the user can do next.

Examples:

### No properties

> No matching land is currently listed.

CTA:

`Tell UrbanEdge Your Requirement`

### No guides

> Guides are being prepared.

CTA:

`Explore Land`

### No related properties

> No similar land is currently available.

CTA:

`Explore All Land`

### No admin records

> Nothing needs attention in this queue.

This should feel positive rather than broken.

---

# 16. Global Error States

## 16.1 404

Route not found.

## 16.2 Property unavailable

The route can still resolve if the business wants a useful stale/sold page.

Show:

- property status;
- limited historical/public context;
- similar inventory.

## 16.3 Temporary data failure

Preserve static page content where possible.

Example:

> The latest property data could not be loaded.

`Retry`

## 16.4 Map failure

Do not block the property page.

Fallback:

- broad textual location;
- `Open in Google Maps` when appropriate and permitted.

## 16.5 External media failure

Show the media title with:

> This media is temporarily unavailable.

Do not break the page.

---

# 17. Maps UX

## 17.1 Public modes

### Exact

Use only when intentionally published.

### Approximate

Default public mode.

### Hidden

No public coordinates.

## 17.2 Map behavior

The map should answer:

> Where is this land in general?

before attempting to answer:

> Where is the exact parcel boundary?

## 17.3 Desktop

Map can sit in the location section beside explanatory text.

## 17.4 Mobile

Map becomes a full-width stacked section.

Avoid tiny map panels that are difficult to interact with.

## 17.5 Navigation action

Use:

`Open in Google Maps`

for an appropriate public point rather than exposing internal coordinate data.

---

# 18. Media UX

## 18.1 Media priority

1. Cover image
2. Gallery
3. Aerial/drone
4. Road/access/context
5. Video
6. 360
7. Brochure/PDF

## 18.2 Gallery interaction

Desktop:

- featured image;
- thumbnails;
- optional full-screen lightbox.

Mobile:

- swipe gallery;
- image counter;
- tap to enlarge.

## 18.3 Media error handling

Broken media should be removed from visual prominence without collapsing the gallery.

---

# 19. Guide UX Architecture

The editorial product should feel like part of UrbanEdge, not a separate CMS.

## Shared guide card

Show:

- image;
- category;
- title;
- short excerpt;
- updated date;
- `Read Guide`.

## Guide search

Search should be simple and content-oriented.

## Guide-to-property linking

Every guide should have at least one contextual path into the discovery experience when relevant.

Example:

```text
Guide:
Agricultural vs NA vs Industrial Land

↓
Compare land categories

↓
Explore Agricultural / NA / Industrial
```

---

# 20. Mobile Information Architecture

Mobile UX must be designed as a deliberate version of the desktop architecture, not a compressed desktop.

## 20.1 Header

Desktop:

```text
logo + nav + WhatsApp
```

Mobile:

```text
logo + menu
```

## 20.2 Search

Desktop:

- horizontal controls where space allows.

Mobile:

- stacked;
- primary location/type controls first;
- advanced filters behind a sheet.

## 20.3 Property result

Desktop:

- multi-column grid.

Mobile:

- single-column card stack.

## 20.4 Property detail

Desktop:

- main content + sticky sidebar.

Mobile:

- single stack;
- conversion actions brought near the top.

## 20.5 Forms

Desktop:

- grouped two-column sections where logical.

Mobile:

- one-column;
- clear step sequencing;
- larger touch targets.

## 20.6 Tables

Where admin/data tables become too wide on mobile:

- prioritize critical columns;
- move secondary details into row expansion or detail screens;
- do not force horizontal scrolling for every primary task unless it genuinely improves the admin workflow.

---

# 21. Responsive Breakpoint Contract

Normalize the public system around recurring UrbanEdge breakpoints:

```text
<480px      Compact mobile
>=480px     Large mobile / small tablet
>=768px     Desktop navigation / major layout transition
>=992px     Large desktop grid/layout
>=1200px    Wide desktop / content ceiling
```

Use special transitions such as ~900px only when the content itself requires it, particularly:

- search filter conversion;
- detail sidebar stacking.

Do not create many one-off breakpoints.

---

# 22. UrbanEdge Visual Language Contract

The Land Space site preserves the recognizable UrbanEdge relationship.

## 22.1 Color family

Core public family:

```text
Primary Navy:     #02066F
Navigation Navy:  #001F3F
Deep Navy:        #01043D
Brand Gold:       #DABA52
CTA Gold Dark:    #B8860B
CTA Gold Light:   #CD950C
White:            #FFFFFF
Soft Surface:     #F9FAFB
Neutral Surface:  #F0F0F0
Primary Text:     #333333
Muted Text:       #495057
```

Land Space should **not** create a separate “green land brand.”

Green, teal, warning and danger colors remain semantic UI colors.

## 22.2 Typography

Primary public pair:

```text
Playfair Display — headings
Montserrat — body / UI
```

## 22.3 Section heading pattern

Use:

```text
Playfair heading
    +
navy text
    +
short gold underline
```

## 22.4 Buttons

Retain:

- gold primary;
- navy secondary;
- navy outline;
- rounded/pill geometry;
- approximately 30px button radius.

## 22.5 Cards

Retain:

- white surfaces;
- soft neutral backgrounds;
- controlled shadows;
- rounded corners;
- stronger elevation for listing cards.

## 22.6 Hero imagery

Use:

- large photographic sections;
- cover imagery;
- navy overlays;
- readable contrast.

## 22.7 Motion

Use subtle motion:

- card lift;
- image zoom;
- nav/menu transition;
- gold underline growth;
- fade/reveal.

Honor `prefers-reduced-motion`.

The experience should never feel like an animation showcase.

---

# 23. Shared UI Pattern Library

The implementation should converge on these reusable patterns.

## 23.1 Layout primitives

- `PublicShell`
- `Container`
- `Section`
- `SectionHeading`
- `Breadcrumbs`
- `PageHero`

## 23.2 Navigation

- `PublicHeader`
- `MobileMenu`
- `Footer`
- `WhatsAppAction`
- `CallAction`

## 23.3 Search

- `LandSearchBar`
- `SearchContext`
- `FilterGroup`
- `ActiveFilterChips`
- `SortControl`
- `PropertyIdSearch`

## 23.4 Property

- `LandListingCard`
- `PropertyGallery`
- `PropertyFactsGrid`
- `LocationSection`
- `VerificationSignals`
- `AvailabilityBadge`
- `PriceDisplay`
- `MediaLinks`
- `RelatedLand`

## 23.5 Conversion

- `InquiryPanel`
- `InquiryForm`
- `SiteVisitForm`
- `RequirementForm`
- `SellYourLandWizard`
- `ContactForm`
- `SuccessState`

## 23.6 Feedback

- `Skeleton`
- `Spinner`
- `InlineError`
- `EmptyState`
- `Toast`
- `ConfirmDialog`

## 23.7 Content

- `GuideCard`
- `GuideCategoryChips`
- `ArticleHeader`
- `ArticleContent`
- `RelatedGuides`

---

# 24. Component Responsibility Rules

Components should have one clear responsibility.

## Example

`LandListingCard`

Owns:

- display of public listing summary;
- click behavior to detail;
- WhatsApp action context.

Does not own:

- property fetching;
- CRM creation;
- private owner data;
- admin logic.

## `InquiryForm`

Owns:

- field presentation;
- validation interaction;
- submission UX.

Server-side action owns:

- validation enforcement;
- lead creation;
- activity creation;
- notification flow.

## `PropertyGallery`

Owns:

- active image;
- thumbnails;
- lightbox;
- responsive gallery.

It does not own property fetching.

## `VerificationSignals`

Owns:

- public scoped badges;
- explanation UI.

It does not make verification decisions.

---

# 25. Public User Journey Architecture

# 25.1 Buyer journey — exact listing

```text
Home / Search / Category / SEO Landing
    ↓
Results
    ↓
Property Detail
    ↓
Enquire / WhatsApp / Call
    ↓
UrbanEdge Qualification
    ↓
Site Visit Request
    ↓
Manual Confirmation
    ↓
Site Visit
    ↓
Negotiation
    ↓
Closed / Nurture
```

## UX requirement

Every transition should feel intentional.

The website should not ask for the full buyer profile at the first click.

---

# 25.2 Buyer journey — no exact match

```text
Search
    ↓
No Results
    ↓
Broaden Search
or
Tell UrbanEdge Your Requirement
    ↓
Lead enters CRM
    ↓
UrbanEdge matching
    ↓
Property matched
    ↓
Site visit
```

This is a first-class journey, not a failure page.

---

# 25.3 Buyer journey — direct guide entry

```text
Guide
    ↓
Relevant land category
    ↓
Search
    ↓
Property Detail
    ↓
Inquiry
```

Guides should lead naturally into discovery rather than trap the user in editorial content.

---

# 25.4 Landowner journey

```text
Sell Your Land
    ↓
10-step submission
    ↓
Submission received
    ↓
UrbanEdge contacts owner
    ↓
Documents / review
    ↓
Verification
    ↓
Approved for Listing
    ↓
Controlled public publication
```

Never imply instant publication.

---

# 25.5 Site-visit journey

```text
Property Detail
    ↓
Request Site Visit
    ↓
Preferred date/time
    ↓
Requested
    ↓
Contacted
    ↓
Proposed
    ↓
Confirmed
    ↓
Completed / Rescheduled / No Show / Cancelled
    ↓
Follow-up
```

The public UX only initiates the workflow; the actual confirmation is administrative.

---

# 26. Admin Route Architecture

The admin is a private operational application with a separate route boundary.

## Canonical admin tree

```text
/admin
├── /login
│
├── /dashboard
│
├── /properties
│   ├── /new
│   ├── /[property-id]
│   ├── /[property-id]/edit
│   ├── /[property-id]/media
│   ├── /[property-id]/verification
│   ├── /[property-id]/leads
│   └── /[property-id]/visits
│
├── /submissions
│   ├── /[submission-id]
│   └── /[submission-id]/convert
│
├── /leads
│   ├── /[lead-id]
│   └── /pipeline
│
├── /requirements
│   ├── /[lead-id]
│   └── /unmatched
│
├── /site-visits
│   ├── /[visit-id]
│   └── /calendar
│
├── /verification
│   ├── /queue
│   └── /[property-id]
│
├── /media
│
├── /guides
│   ├── /new
│   ├── /[guide-id]
│   └── /[guide-id]/edit
│
├── /locations
│   ├── /[location-id]
│   └── /[location-id]/edit
│
├── /seo
│   ├── /landing-pages
│   └── /[landing-page-id]
│
├── /analytics
│
├── /settings
│   ├── /business
│   ├── /contact
│   ├── /lead-sources
│   ├── /property-options
│   └── /seo
│
└── /audit
```

The exact administrative sub-route names may change during implementation, but the screen responsibilities are mandatory.

---

# 27. Admin Shell Architecture

The design reference establishes an internal admin language distinct from the public site.

Recommended shell:

```text
Dark top bar
    ↓
Light sidebar
    ↓
Gray application canvas
    ↓
Dense operational content
```

The admin should still feel like UrbanEdge, but should prioritize speed and clarity over luxury presentation.

## Admin shell responsibilities

- route navigation;
- authentication state;
- account/session controls;
- breadcrumb/context;
- notifications;
- responsive sidebar behavior.

---

# 28. Admin Navigation

Primary groups:

```text
Dashboard

Inventory
  Properties
  Owner Submissions
  Verification
  Media

CRM
  Leads
  Buyer Requirements
  Site Visits

Content
  Guides
  Locations
  SEO

Business
  Analytics
  Settings
  Audit
```

Use badges/counts for actionable queues where useful.

Example:

`Submissions  (5)`

`Follow-ups  (3)`

Do not add decorative dashboard navigation sections without an operational reason.

---

# 29. Admin `/dashboard`

## Purpose

Answer:

> What needs my attention today?

## First block — Today

- new inquiries;
- owner submissions;
- overdue follow-ups;
- site visits today;
- properties pending review.

## Second block — Pipeline

Show the CRM stages:

```text
New
Contact Attempted
Qualified
Requirement Confirmed
Property Matched
Site Visit Requested
Site Visit Confirmed
Site Visit Completed
Negotiation
Nurture
Closed Won
Closed Lost
```

## Third block — Inventory

- published;
- review;
- pending documents;
- on hold;
- sold/leased/rented.

## Fourth block — Performance

Focus on:

- top-viewed properties;
- WhatsApp clicks;
- call clicks;
- inquiry rate;
- site-visit requests;
- lead source;
- conversion.

Avoid vanity “lifetime traffic” cards without operational meaning.

## Dashboard CTA hierarchy

Primary:

`Review New Leads`

Secondary:

`Review Submissions`

Utility:

`View Site Visits`

---

# 30. Admin `/properties`

## Purpose

Inventory control center.

## Default view

Dense list/table with:

- Property ID;
- title;
- category;
- transaction;
- location;
- area;
- price/POR;
- availability;
- publication;
- updated date;
- verification state.

## Actions

- search;
- filter;
- create;
- edit;
- duplicate as draft;
- publish;
- unpublish;
- archive;
- change availability;
- manage media;
- manage location;
- manage verification;
- view linked leads;
- view site visits.

---

# 31. Admin `/properties/new`

## Purpose

Create a new property draft directly.

## UX

Organize into tabs or long-form sections:

1. Identity
2. Classification
3. Location
4. Area
5. Pricing
6. Category-specific details
7. Media
8. Public presentation
9. Verification
10. Publication

Primary:

`Save Draft`

Secondary:

`Preview`

Publication action should be visually separate and protected.

---

# 32. Admin property edit/detail

The admin property screen should combine:

- internal context;
- public preview;
- editable property information;
- status controls;
- linked leads;
- linked site visits;
- verification;
- media.

## Recommended top bar

```text
Property ID
Status
Availability
Last updated
[Preview]
[Edit]
[Publish / Unpublish]
```

## Publication gate

Before publishing, present a validation checklist.

Example:

```text
Public title            ✓
Category                ✓
Transaction             ✓
Location visibility     ✓
Area                    ✓
Price mode              ✓
Cover media             ✓
Availability             ✓
Required disclaimers    ✓
```

If a required item is missing:

`Publish` remains blocked.

---

# 33. Admin `/properties/[id]/media`

## Purpose

Operational media management.

Capabilities:

- upload;
- reorder;
- choose cover;
- remove;
- mark public/private;
- inspect metadata;
- preview.

Private owner documents must not accidentally become public listing media.

---

# 34. Admin `/properties/[id]/verification`

## Purpose

Manage scoped trust signals.

Display:

```text
Information Reviewed
Documents Reviewed
Location Reviewed
Site Visited
Survey Reviewed
Legal Review Completed
```

For each:

- status;
- reviewer;
- date;
- evidence/context;
- public disclosure wording.

Never provide a single giant “Verified” switch.

---

# 35. Admin `/submissions`

## Purpose

Owner submission intake queue.

## Default columns

- Submission ID;
- submitted date;
- owner;
- land type;
- transaction;
- location;
- area;
- asking price;
- status;
- last contact;
- next action.

## Primary actions

- Open
- Contact
- Request Docs
- Approve
- Reject
- Convert to Property

## Queue filters

- status;
- category;
- district;
- transaction;
- submitted date;
- incomplete;
- follow-up due.

---

# 36. Admin `/submissions/[id]`

## Information hierarchy

```text
Submission summary
    ↓
Owner/contact
    ↓
Land details
    ↓
Commercials
    ↓
Location
    ↓
Media
    ↓
Documents
    ↓
Review notes
    ↓
Timeline
    ↓
Next action
```

## Status flow

```text
Submitted
→ Contacted
→ Documents Requested
→ Under Review
→ Verification In Progress
→ Approved for Listing
→ Published
→ On Hold
→ Rejected
→ Closed
```

## Important UX rule

The next operational action should always be visible.

Example:

`Next: Request missing NA order`

---

# 37. Admin `/submissions/[id]/convert`

## Purpose

Controlled conversion from owner submission to public property.

## Flow

```text
Submission
    ↓
Create Listing
    ↓
Review copied fields
    ↓
Set public title
    ↓
Sanitize description
    ↓
Choose public location mode
    ↓
Select public media
    ↓
Set price mode
    ↓
Set verification signals
    ↓
Set availability
    ↓
Choose publication date
    ↓
Save draft / publish
```

Owner documents remain private by default.

---

# 38. Admin `/leads`

## Purpose

Single central lead inbox.

## Views

- list;
- pipeline;
- filters.

## Important fields visible at glance

- Lead ID;
- name;
- source;
- inquiry type;
- buyer type;
- transaction;
- land type;
- location;
- budget;
- stage;
- next follow-up;
- last contacted.

## Primary CTA

`Open Lead`

---

# 39. Admin `/leads/pipeline`

## Board columns

```text
New
Contact Attempted
Qualified
Requirement Confirmed
Property Matched
Site Visit Requested
Site Visit Confirmed
Site Visit Completed
Negotiation
Nurture
Closed Won
Closed Lost
```

The board should not become a drag-and-drop toy.

Drag interactions may be used later; V1 can use explicit stage controls where clearer.

---

# 40. Admin `/leads/[id]`

## Information hierarchy

```text
Lead identity
    ↓
Current stage
    ↓
Buyer requirement
    ↓
Linked properties
    ↓
Site visits
    ↓
Activity timeline
    ↓
Next follow-up
    ↓
Outcome / notes
```

## Activity examples

- Lead created;
- WhatsApp click;
- Call click;
- Note added;
- Contact attempted;
- Requirement updated;
- Property matched;
- Site visit requested;
- Site visit confirmed;
- Site visit completed;
- Offer received;
- Follow-up scheduled;
- Status changed.

The activity timeline is the operational memory of the brokerage.

---

# 41. Admin `/requirements`

## Purpose

Manage generic buyer requirements that may have started without a property.

## Primary use case

Match off-market demand to suitable inventory.

## Screen sections

- requirement queue;
- filters;
- unmatched requirements;
- matched requirements;
- follow-up status.

## Detail

Show the full requirement brief and linked property candidates.

---

# 42. Admin `/site-visits`

## Purpose

Operational visit management.

## Views

- Today;
- Upcoming;
- Follow-up required;
- Completed;
- Cancelled;
- No show.

## Statuses

```text
Requested
Contacted
Proposed
Confirmed
Rescheduled
Completed
No Show
Cancelled
Follow-up Required
```

## Detail page

Show:

- lead;
- property;
- preferred time;
- confirmed time;
- notes;
- contact;
- outcome;
- next action.

---

# 43. Admin `/site-visits/calendar`

V1 may use a practical operational calendar/list view, but it is **not** a fully automatic external scheduling engine.

The UX should treat the calendar as an internal coordination view.

---

# 44. Admin `/verification`

## Purpose

Central review queue.

## Filters

- pending;
- information reviewed;
- documents reviewed;
- site visited;
- survey reviewed;
- legal review completed;
- recently changed.

## Interaction

Opening a property should show:

- claim;
- evidence;
- date;
- reviewer;
- public wording.

---

# 45. Admin `/media`

## Purpose

Cross-property media management.

Useful views:

- recent uploads;
- failed uploads;
- unused media;
- public/private state;
- property association.

Do not make this a generic digital asset management platform in V1.

---

# 46. Admin `/guides`

## Purpose

Editorial workflow.

## List fields

- title;
- category;
- status;
- published date;
- updated date;
- SEO readiness;
- author/reviewer where applicable.

## Guide lifecycle

```text
Draft
→ Review
→ Published
→ Unpublished / Archived
```

No direct public auto-publish from an unreviewed draft.

---

# 47. Admin `/locations`

## Purpose

Maintain normalized public location configuration and editorial content.

The screen should support:

- district;
- taluka;
- locality;
- status;
- published landing content;
- SEO content.

Do not expose database structure in the UX.

---

# 48. Admin `/seo`

## Purpose

Manage indexable landing pages and SEO metadata.

### Landing page screen

Show:

- page title;
- URL;
- canonical;
- index/noindex state;
- last updated;
- content completeness;
- inventory support;
- publication state.

## SEO page publication gate

A location page should not be publishable simply because a location exists.

Require meaningful:

- inventory;
- or substantial original editorial value.

---

# 49. Admin `/analytics`

## Purpose

Measure brokerage outcomes.

## Inventory

- active listings;
- listing views;
- property inquiry rate;
- WhatsApp clicks;
- call clicks;
- site visits.

## Leads

- leads by source;
- category;
- transaction;
- stage progression;
- overdue follow-ups;
- site visits;
- conversion.

## Owner side

- submissions;
- contact rate;
- review rate;
- publish rate;
- rejection rate;
- rejection reasons.

The admin UI should favor trend/comparison over vanity totals.

---

# 50. Admin `/settings`

## Groupings

### Business

- business identity;
- contact details;
- WhatsApp/call destinations.

### Lead sources

- website;
- portals;
- social;
- referrals;
- offline.

### Property options

- category options;
- transaction options;
- statuses;
- availability choices.

### SEO

- defaults;
- metadata;
- social settings.

Keep sensitive secrets outside the UX and out of editable public settings unless specifically designed for secure administration.

---

# 51. Admin `/audit`

## Purpose

Trace sensitive changes.

## Fields

- admin;
- timestamp;
- entity;
- action;
- prior state where practical;
- new state where practical.

## High-value actions

- publish;
- unpublish;
- archive;
- delete;
- owner information change;
- public coordinate change;
- verification change;
- price change;
- availability change;
- submission rejection.

The audit page is read-heavy and should be optimized for inspection.

---

# 52. Admin Loading / Error / Empty States

## Loading

Skeletons for:

- dashboard cards;
- tables;
- detail sections.

## Empty

Example:

> No submissions need review right now.

Avoid blank canvases.

## Error

Example:

> We could not load this queue.

Actions:

`Retry`

and optionally:

`Return to Dashboard`

## Permission / auth failure

Use a clear secure state rather than exposing technical details.

---

# 53. Admin Responsive Architecture

## Desktop

- left sidebar;
- dense tables;
- multi-column detail pages;
- sticky contextual action panels when useful.

## Tablet

- collapsible sidebar;
- compressed tables;
- stacked secondary panels.

## Mobile

Admin is not required to reproduce the full desktop table experience.

Primary mobile behaviors:

- list → card;
- row → detail screen;
- filter → sheet;
- secondary metadata → expandable detail.

The admin must remain operationally usable on mobile, but should prioritize critical workflows:

- lead follow-up;
- submission review;
- site visit status;
- property status;
- quick notes.

---

# 54. Navigation Between Related Records

The following cross-links are mandatory UX patterns.

## Property → Leads

`View Linked Leads`

## Property → Site Visits

`View Site Visits`

## Lead → Properties

`View Matched Properties`

## Lead → Site Visits

`View Site Visits`

## Submission → Property

`Converted Listing`

## Property → Submission

Where applicable:

`Source Submission`

## Guide → Category

`Explore This Land Type`

These links make the system feel like one operating environment rather than disconnected screens.

---

# 55. Public-to-Admin Traceability

Every meaningful public conversion should preserve enough context for the admin to understand:

- source;
- page;
- property;
- transaction;
- land type;
- search context where appropriate;
- campaign/source where available.

Examples:

```text
Property detail → inquiry
Property detail → WhatsApp click
Property detail → call click
Property detail → site visit
Search → requirement
Sell Your Land → owner submission
```

The UX should never expose internal tracking IDs to the visitor just for operational convenience.

---

# 56. Public Detail Conversion Pattern

The recommended conversion block is:

```text
Interested in this land?

Property ID: UE-LS-000123

[Enquire Now]
[WhatsApp]
[Call]
[Request Site Visit]
```

Secondary reassurance:

> Share the Property ID when speaking with UrbanEdge.

This reinforces the brokerage workflow without overwhelming the visitor.

---

# 57. WhatsApp UX

## Property context

Prefilled text should include the Property ID.

Example:

> Hi UrbanEdge, I’m interested in Property UE-LS-000123.

## Generic requirement

Prefilled text may summarize:

- district;
- land type;
- transaction.

Do not include private customer information in an uncontrolled URL if not necessary.

## Analytics

Record click events even though successful conversation completion cannot be guaranteed.

---

# 58. Call UX

Call links should use:

`tel:`

The call action may preserve:

- property context;
- page/source context;
- lead source where technically available.

A call click is an intent signal, not proof of a completed conversation.

---

# 59. Property Availability UX

Availability and listing publication are separate concepts.

## Public states

At minimum, communicate appropriate states such as:

- Available;
- On Hold;
- Sold;
- Leased;
- Rented;
- Unavailable.

The UI must never let a non-available property look active through stale primary CTAs.

---

# 60. Price UX

Support:

- Listed Price;
- Price on Request;
- price per unit;
- total price;
- rent;
- lease economics where intentionally published;
- negotiable indication.

Never replace missing pricing with fabricated estimates.

`Price on Request` is a valid product state.

---

# 61. Area and Unit UX

Land often has multiple units.

The public UI should present:

- normalized area;
- local/source unit where relevant;
- clear unit labels.

Example:

```text
1.25 Acre
≈ 54,450 sq ft
```

Do not hide the original source representation in cases where it is meaningful to the user.

---

# 62. Category-Specific Detail UX

## Agricultural

Priority order:

```text
Area
Location
Water / Irrigation
Road Access
Current Use
Fencing
Connectivity
Verification
```

## NA

Priority order:

```text
Area
Location
NA Status
Use / Zone
Road Width
Planning Authority
Development Context
Verification
```

## Industrial

Priority order:

```text
Area
Estate / Authority
GIDC Status
Road Width / Frontage
Power / Water / Drainage / Gas
Logistics Connectivity
Use / Status
Commercials
Verification
```

This hierarchy reflects how users evaluate land, rather than how residential users evaluate buildings.

---

# 63. Legal and Trust UX Boundaries

The UX must preserve the following distinctions.

## Do not claim

- legal guarantee;
- title guarantee;
- guaranteed investment return;
- universal agricultural purchase eligibility;
- NA = automatic development rights;
- every industrial property = GIDC;
- generic RERA applicability to every land parcel.

## Prefer

- property-specific evidence;
- scoped verification;
- government reference links where genuinely relevant;
- clear disclaimers;
- human brokerage review.

---

# 64. SEO Information Architecture

## Primary indexable families

### Core category

```text
/agricultural-land
/na-land
/industrial-land
```

### Core locations

```text
/locations/ahmedabad
/locations/gandhinagar
```

### Location × category

Only when justified:

```text
/locations/ahmedabad/agricultural-land
/locations/ahmedabad/na-land
/locations/ahmedabad/industrial-land
...
```

### Property

```text
/properties/[property-slug]
```

### Guides

```text
/guides/[guide-slug]
```

## Search URL policy

Do not treat every `/properties?...` filter combination as an SEO page.

---

# 65. Breadcrumb Architecture

Public breadcrumbs should use meaningful hierarchy.

Example:

```text
Home
> Agricultural Land
> Ahmedabad
> UE-LS-000123
```

For category pages:

```text
Home
> Agricultural Land
```

For guides:

```text
Home
> Guides
> Land Buying
> Article
```

Mobile breadcrumbs may truncate intermediate labels rather than overflow.

---

# 66. Cross-Sell / Related Inventory UX

Related properties should be based on meaningful similarity such as:

- same category;
- same district;
- same transaction;
- similar area;
- nearby locality.

Avoid pretending there is intelligent “recommendation AI” in V1.

Section CTA:

`View All Similar Land`

---

# 67. Navigation Recovery Patterns

## Back from detail

Preserve the user’s search state so returning to results does not reset their filters.

## Back from inquiry

Do not discard the source property context.

## Back from guide

Return to guide index/search state where practical.

## Cancel Sell Your Land

Warn before leaving if meaningful unsaved information exists.

---

# 68. Accessibility UX

Public and admin experiences should follow accessible interaction practices.

Required patterns:

- keyboard-accessible navigation;
- visible focus states;
- semantic headings;
- form labels;
- aria labels for icon-only controls;
- sufficient text contrast;
- touch-friendly controls;
- reduced-motion support;
- accessible modal closing;
- no color-only meaning.

Do not rely on gold/green/red alone to communicate state.

---

# 69. Performance UX

## Public pages

Prioritize:

- initial content;
- primary hero;
- search controls;
- first result cards.

Use lazy loading for lower-page media.

## Property detail

Load:

1. title and key facts;
2. cover image;
3. main conversion actions;
4. body sections;
5. secondary media.

Do not defer core property facts until after hydration.

## Admin

Prefer operational responsiveness over high visual polish.

---

# 70. Motion UX Contract

Approved motion vocabulary:

```text
Fast       ~0.2s
Medium     ~0.3s
Slow       ~0.5s
```

Use for:

- button hover;
- card lift;
- image scale;
- menu transitions;
- gold underline growth;
- light reveal.

Do not animate:

- every section;
- every number;
- operational admin tables;
- critical error states.

Respect reduced motion.

---

# 71. State Matrix by Public Surface

| Surface | Loading | Error | Empty | Success |
|---|---|---|---|---|
| Homepage inventory | Skeleton cards | Inline retry | Alternate discovery CTA | Inventory |
| Search results | Card skeletons | Retry results | Requirement CTA | Results |
| Property detail | Detail skeleton | Error/retry or unavailable state | Not applicable | Detail |
| Guides | Card skeletons | Retry | Editorial empty | Guide list |
| Guide detail | Article skeleton | Retry | Not applicable | Article |
| Inquiry | Button submitting | Recoverable form error | Not applicable | Confirmation |
| Site visit | Button submitting | Recoverable form error | Not applicable | Confirmation |
| Requirement | Button submitting | Recoverable form error | Not applicable | Confirmation |
| Sell land | Step loading | Field/server errors | Not applicable | Submission received |
| Contact | Button submitting | Recoverable error | Not applicable | Confirmation |

---

# 72. State Matrix by Admin Surface

| Surface | Loading | Error | Empty | Primary action |
|---|---|---|---|---|
| Dashboard | KPI/table skeleton | Retry section | No work today | Review queue |
| Properties | Table skeleton | Retry | No properties | Create property |
| Submissions | Table skeleton | Retry | No pending submissions | Add/filter |
| Leads | List/board skeleton | Retry | No active leads | Add/manual entry if permitted |
| Requirements | List skeleton | Retry | No unmatched requirements | Review matched inventory |
| Visits | List/calendar skeleton | Retry | No upcoming visits | Review requests |
| Verification | Queue skeleton | Retry | No pending verification | Review property |
| Guides | Table skeleton | Retry | No drafts | New guide |
| Locations | Table skeleton | Retry | No configurable items | Manage locations |
| Analytics | Chart skeleton | Retry | Insufficient data | Adjust range/filter |
| Audit | Table skeleton | Retry | No audit records | None |

---

# 73. Public Page Priority Model

Not every page is equally important.

## Tier 1 — Core conversion pages

- `/`
- `/properties`
- `/properties/[slug]`
- `/sell-your-land`
- `/requirements`
- `/site-visit`

## Tier 2 — Discovery pages

- `/agricultural-land`
- `/na-land`
- `/industrial-land`
- `/buy`
- `/rent`
- `/lease`
- location pages

## Tier 3 — Trust / editorial

- `/guides`
- `/guides/[slug]`
- `/about`
- `/contact`

## Tier 4 — Legal / utility

- `/terms`
- `/privacy`
- `/disclaimer`
- `/404`

---

# 74. Admin Priority Model

## Tier 1

- Dashboard
- Properties
- Submissions
- Leads
- Site Visits

## Tier 2

- Verification
- Requirements
- Media

## Tier 3

- Guides
- Locations
- SEO

## Tier 4

- Analytics
- Settings
- Audit

This ordering should inform the default sidebar and shortcut design.

---

# 75. Public Navigation Decision Rules

## Rule 1

Do not add user accounts to discovery.

## Rule 2

Do not add seller dashboards.

## Rule 3

Do not add public agent profiles/marketplace.

## Rule 4

Do not introduce in-app chat in V1.

## Rule 5

Do not introduce an automatic calendar booking flow.

## Rule 6

Do not expose internal documents.

## Rule 7

Do not create a mega-menu.

## Rule 8

Do not create hundreds of thin SEO pages.

---

# 76. Page Composition Pattern

Most public informational pages should follow:

```text
Page Hero
    ↓
Core Value / Context
    ↓
Structured Information
    ↓
Relevant Inventory
    ↓
Trust / Guidance
    ↓
Conversion
```

Property detail is the specialized exception:

```text
Breadcrumb
    ↓
Gallery / Title
    ↓
Actions
    ↓
Facts
    ↓
Deep information
    ↓
Verification
    ↓
Location
    ↓
Conversion
```

---

# 77. Form Composition Pattern

For long forms:

```text
Step title
Supporting explanation
Fields
Inline validation
Step navigation
Progress
```

Buttons:

```text
Back
Continue
```

Final step:

```text
Back
Submit
```

Do not use ambiguous labels such as:

`Next Step?`

Prefer:

`Continue to Location`

when useful.

---

# 78. Detail Composition Pattern

The property detail page must balance confidence and restraint.

## Above fold

High-confidence facts only.

## Middle

Land-specific evidence and practical context.

## Lower page

Deeper supporting information.

## Final

Clear conversion and disclaimer.

This prevents the page from becoming either:

- an empty marketing page;
- or a database record dumped into the browser.

---

# 79. Public Search + Admin Operational Link

The public site and admin should be conceptually linked.

Example:

```text
Visitor searches:
Agricultural + Ahmedabad + Buy

↓

Public result:
UE-LS-000123

↓

Visitor enquires

↓

Admin lead:
Property = UE-LS-000123
Source = Property Detail
Stage = New

↓

Admin follows up

↓

Site visit requested

↓

Visit linked to same property + lead
```

The page UX should preserve this continuity.

---

# 80. Future Expansion Compatibility

The V1 route system must allow future expansion without breaking current URLs.

Future-safe dimensions include:

- more Gujarat districts;
- state-specific categories;
- additional transaction models;
- multiple languages;
- salesperson assignment.

Do not force future national complexity into V1 navigation.

---

# 81. Route Canonicalization Principles

## Canonical public paths

Use stable nouns and slugs.

Examples:

```text
/properties
/agricultural-land
/na-land
/industrial-land
/sell-your-land
/guides
/contact
```

Avoid version prefixes such as:

```text
/v1/properties
```

in public routes.

## Canonical admin paths

Keep administrative routes clearly private:

```text
/admin/...
```

Do not reuse public routes for admin operations.

---

# 82. Route Authorization Boundary

Public routes:

- anonymous by default.

Admin routes:

- authentication required;
- authorization enforced at server/route boundary.

Form submission routes:

- public visitor allowed;
- server-owned validation and mutation.

No public client component should be trusted to enforce privacy or publication state.

---

# 83. Public Data Projection UX

The page must only receive data intended for public presentation.

The following must never appear in public UI by accidental omission:

- private owner phone;
- private owner email;
- internal legal notes;
- private documents;
- broker source;
- confidential negotiation notes;
- internal coordinates;
- private commission data.

The page architecture assumes public-safe projections from the server boundary.

---

# 84. Content Publication UX

Public pages that depend on managed content should use a clear publication model.

## Property

```text
Draft
→ Review
→ Published
→ On Hold
→ Archived
```

## Guide

```text
Draft
→ Review
→ Published
→ Archived
```

## Location SEO page

```text
Draft
→ Quality Check
→ Published
→ Noindex / Archived
```

The UX should make publication state visible to admins but not expose internal operational states to public users unless intentionally mapped to a public status.

---

# 85. Property Publication UX

The public `Publish` state should require:

- complete minimum public fields;
- approved public media;
- chosen location visibility;
- valid availability;
- appropriate price mode;
- approved verification signals;
- disclaimer context.

Publishing is a deliberate administrative action, not a side effect.

---

# 86. Archive UX

Archiving removes a property from active discovery while preserving internal history.

Public behavior after archive should be decided intentionally:

- show unavailable/sold page;
- redirect to related inventory;
- or return the appropriate not-found/de-indexing state.

Do not allow stale available pages to remain unintentionally live.

---

# 87. Property ID Search UX

Property ID search is a fast-path utility.

Example:

```text
Have a Property ID?

[ UE-LS-000123 ] [Search]
```

Useful locations:

- homepage utility area;
- global search;
- property detail references;
- contact/inquiry context.

---

# 88. Comparison UX

V1 should support lightweight visual comparison through:

- result cards;
- consistent metadata positions;
- optionally selecting a small number of listings for side-by-side comparison only if implementation complexity remains low.

Do not turn comparison into a full consumer product in V1.

A consistent card information hierarchy is more important than a dedicated comparison engine.

---

# 89. Trust Copy Architecture

Every trust statement should answer:

1. What was checked?
2. By whom?
3. When?
4. What is not guaranteed?

Examples:

> Documents Reviewed — Supporting documents were reviewed by UrbanEdge as part of its brokerage process. This does not constitute a title guarantee.

> Location Reviewed — Location information was reviewed for brokerage use. Public map precision may remain approximate.

---

# 90. User Journey Exit Rules

When a visitor leaves a conversion flow:

## Inquiry

Return to property detail/search.

## Site visit

Return to property detail or similar inventory.

## Requirement

Return to search/home.

## Sell Your Land

Return to home or owner-focused information.

Do not strand users on a dead confirmation page.

---

# 91. Public Form Confirmation Language

Confirmation should communicate:

```text
Received
↓
Reviewed / next human step
↓
No false automation promise
```

Do not say:

- “approved” unless actually approved;
- “booked” unless confirmed;
- “published” for owner submissions;
- “legally verified” unless the property-specific standard explicitly supports that exact wording.

---

# 92. Admin Quick Actions

From the dashboard, provide fast access to:

- New Lead
- Review Submissions
- Due Follow-ups
- Today’s Visits
- Create Property
- Pending Verification

Quick actions should support the operating rhythm of a single administrator.

---

# 93. Admin Detail Action Hierarchy

Each operational detail screen should have one dominant next action.

Examples:

### Submission

`Request Documents` or `Convert to Listing`

### Lead

`Contact / Add Follow-up`

### Site Visit

`Confirm / Reschedule`

### Property

`Publish / Update Availability`

### Verification

`Review Evidence`

This prevents the interface from becoming a wall of equally weighted buttons.

---

# 94. Admin Confirmation Requirements

Confirm destructive or high-risk actions such as:

- delete;
- archive;
- reject submission;
- change public coordinates;
- change verification state;
- unpublish;
- change availability in a way that removes public discovery.

The confirmation dialog should describe consequence, not merely say:

> Are you sure?

Example:

> Archive this property? It will be removed from active public search but retained internally.

---

# 95. Mobile Bottom-Sheet Pattern

Use bottom sheets for:

- search filters;
- lightweight action menus;
- selected card actions where needed.

Do not use a bottom sheet for:

- long legal content;
- large guide articles;
- full property details.

Bottom sheets should have:

- title;
- close button;
- clear scroll area;
- fixed action footer where needed;
- safe-area support;
- backdrop.

---

# 96. Public Footer Link Architecture

Recommended groups:

## Explore

- Agricultural Land
- NA Land
- Industrial Land
- Buy
- Rent
- Lease

## For Owners

- Sell Your Land

## Learn

- Guides
- Ahmedabad
- Gandhinagar

## Company

- About
- Contact

## Legal

- Terms
- Privacy
- Disclaimer

Plus:

- phone;
- WhatsApp;
- copyright.

Avoid crowding the footer with every possible location.

---

# 97. Page Metadata Responsibilities

Each route should define:

- title;
- description;
- canonical behavior;
- social image where relevant;
- robots/indexing state.

Metadata must be generated from public-safe data only.

Property detail metadata should use:

- property title;
- land category;
- locality/district;
- useful area context;
- Property ID where helpful.

---

# 98. URL Examples

## Basic search

```text
/properties
```

## Category

```text
/agricultural-land
```

## Category + transaction through state

```text
/properties?category=agricultural&transaction=buy
```

## Location search

```text
/properties?district=ahmedabad&taluka=daskroi
```

## Property ID

```text
/search?propertyId=UE-LS-000123
```

## Property detail

```text
/properties/agricultural-land-near-ahmedabad-ue-ls-000123
```

## Guide

```text
/guides/what-to-check-before-buying-agricultural-land-in-gujarat
```

The slug may remain readable while the stable Property ID remains visible inside the page.

---

# 99. Acceptance Checklist — Public

The public architecture is complete only when:

- [ ] Home communicates product, geography and categories immediately.
- [ ] Search is accessible from the home experience.
- [ ] Category pages explain category + expose inventory.
- [ ] Results support structured land filters.
- [ ] Mobile filters use a usable sheet pattern.
- [ ] Listing cards show Property ID.
- [ ] Property detail exposes land-specific information.
- [ ] Exact location is not public by default.
- [ ] Verification is scoped.
- [ ] Inquiry, WhatsApp, Call and Site Visit are available.
- [ ] No-result state offers requirement capture.
- [ ] Sell Your Land uses a multi-step owner flow.
- [ ] Owner submission never implies instant publication.
- [ ] Guides are searchable and useful.
- [ ] Location pages are not generated thinly.
- [ ] Legal/trust limitations are visible.
- [ ] Public forms require no account.
- [ ] Public pages work with server-rendered core content.
- [ ] Mobile navigation is deliberate.
- [ ] Empty/error/loading states exist for all major async surfaces.

---

# 100. Acceptance Checklist — Admin

- [ ] Dashboard answers “what needs attention today?”
- [ ] Property management supports full publication lifecycle.
- [ ] Submission queue exposes next action.
- [ ] Submission can convert to listing without re-entry of all fields.
- [ ] Property media can be managed separately.
- [ ] Verification is scoped.
- [ ] Leads use one central pipeline.
- [ ] Buyer requirements can exist without a property.
- [ ] Site visits are manually confirmed.
- [ ] Guides can be drafted and reviewed.
- [ ] Location and SEO landing pages are controlled.
- [ ] Analytics emphasizes business outcomes.
- [ ] Audit trail is searchable/readable.
- [ ] Mobile admin supports critical operational tasks.
- [ ] Sensitive actions are confirmed.
- [ ] Admin routing and public routing remain separate.

---

# 101. Final Route Contract

## Public

```text
/                                           Home
/properties                                 Search/results
/properties/[property-slug]                 Property detail

/agricultural-land                          Agricultural category
/na-land                                    NA category
/industrial-land                            Industrial category

/buy                                        Buy discovery
/rent                                       Rent discovery
/lease                                      Lease discovery

/sell-your-land                             Owner submission
/sell-your-land/thank-you                   Owner confirmation

/requirements                               Buyer requirement
/requirements/thank-you                     Requirement confirmation

/site-visit                                 Site-visit request
/site-visit/thank-you                       Site-visit confirmation

/guides                                     Guide index
/guides/[guide-slug]                        Guide detail
/guides/category/[category-slug]            Optional editorial category

/locations/ahmedabad                        Ahmedabad landing
/locations/gandhinagar                      Gandhinagar landing
/locations/[city]/[category]                Supported SEO landing

/about                                      About UrbanEdge
/contact                                    Contact

/terms                                      Terms
/privacy                                    Privacy
/disclaimer                                 Disclaimer

/search                                     Utility search
/404                                        Not found
```

## Admin

```text
/admin/login

/admin/dashboard

/admin/properties
/admin/properties/new
/admin/properties/[id]
/admin/properties/[id]/edit
/admin/properties/[id]/media
/admin/properties/[id]/verification
/admin/properties/[id]/leads
/admin/properties/[id]/visits

/admin/submissions
/admin/submissions/[id]
/admin/submissions/[id]/convert

/admin/leads
/admin/leads/pipeline
/admin/leads/[id]

/admin/requirements
/admin/requirements/unmatched
/admin/requirements/[id]

/admin/site-visits
/admin/site-visits/calendar
/admin/site-visits/[id]

/admin/verification
/admin/verification/queue
/admin/verification/[property-id]

/admin/media

/admin/guides
/admin/guides/new
/admin/guides/[id]
/admin/guides/[id]/edit

/admin/locations
/admin/locations/[id]
/admin/locations/[id]/edit

/admin/seo
/admin/seo/landing-pages
/admin/seo/[id]

/admin/analytics

/admin/settings
/admin/settings/business
/admin/settings/contact
/admin/settings/lead-sources
/admin/settings/property-options
/admin/settings/seo

/admin/audit
```

---

# 102. Final UX Principles

UrbanEdge Land Space V1 should consistently express these decisions:

1. **Curate before scale.**
2. **Search first, complexity later.**
3. **Land-specific information over residential conventions.**
4. **Property detail is the main trust and conversion surface.**
5. **Inquiry is the primary structured conversion.**
6. **WhatsApp and Call are high-intent shortcuts.**
7. **Site visits are requested online but confirmed manually.**
8. **No-result states become buyer-requirement opportunities.**
9. **Sell Your Land is a submission workflow, not instant publishing.**
10. **Verification is scoped, explainable and never a generic legal guarantee.**
11. **Approximate location is the default public location mode.**
12. **Public UI never relies on client-side hiding for private information.**
13. **The admin is operationally dense and separate from the public marketing presentation.**
14. **Every route has a clear business purpose.**
15. **Every major async surface has loading, error and empty behavior.**
16. **URL state preserves searchable discovery state.**
17. **Mobile is a deliberate information architecture, not compressed desktop.**
18. **UrbanEdge navy, gold, Playfair and Montserrat remain the family bridge.**
19. **Motion is restrained.**
20. **The website is a brokerage conversion engine, not a full transaction platform.**

---

# 103. Source Alignment

This architecture is grounded in the supplied:

- `01-MASTER-WEBSITE-ARCHITECTURE.md`
- `LANDSPACE_PRODUCT_REQUIREMENTS.md`
- `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`

Key source-derived constraints include:

- brokerage-led, curated inventory and Ahmedabad/Gandhinagar V1 scope;
- Agricultural / NA / Industrial categories;
- Buy / Rent / Lease discovery;
- Sell Your Land as controlled owner submission;
- Property ID communication;
- no customer account requirement;
- inquiry / WhatsApp / Call / site visit conversion model;
- generic buyer requirement capture;
- approximate location as the V1 public default;
- scoped verification language;
- one-admin CRM and operational pipeline;
- guides and controlled location SEO;
- UrbanEdge navy/gold, Playfair/Montserrat, image-led hero sections, elevated cards, pill actions and responsive filter/detail patterns.

The route and UX architecture intentionally stays one level above implementation and database design so that subsequent specialist documents can define those concerns without duplicating or contradicting this page-level contract.
