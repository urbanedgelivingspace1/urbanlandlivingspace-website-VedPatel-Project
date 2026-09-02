# URBANEDGE LIVING SPACE — DESIGN SYSTEM & BRAND ANALYSIS REPORT

## 1. ANALYSIS METHOD

### Scope

This report analyzes the supplied UrbanEdge Living Space React/Vite repository as a design-system reference for a separate future product, **UrbanEdge Land Space**. The source project was inspected without modifying the supplied project itself.

The analysis covered:

- Application routing and root layout
- Public marketing pages
- Property listing and detail surfaces
- About, contact, blog, team, guaranteed-rent and authentication surfaces
- Shared UI primitives
- Navigation and footer
- Search/filter components
- Forms, inputs, buttons, badges, cards, modals, pagination and loading states
- Responsive media queries and mobile behavior
- Global CSS, typography and design tokens
- Images, logos, icon libraries and other visual assets
- Admin shell/styles where relevant to distinguish internal UI from public brand language

### Primary source files examined

Representative high-value files include:

- `src/App.jsx`
- `src/main.jsx`
- `src/styles/tokens.css`
- `src/styles/typography.css`
- `src/styles/global.css`
- `src/App.css`
- `src/components/NavigationBar.jsx`
- `src/components/NavigationBar.css`
- `src/components/Footer.jsx`
- `src/components/Footer.css`
- `src/components/ui/Button.jsx`
- `src/components/ui/Button.css`
- `src/components/ui/Card.jsx`
- `src/components/ui/Card.css`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Badge.css`
- `src/components/ui/Input.jsx`
- `src/components/ui/Input.css`
- `src/components/ui/Textarea.jsx`
- `src/components/ui/Textarea.css`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Modal.css`
- `src/components/ui/Pagination.jsx`
- `src/components/ui/Pagination.css`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/Skeleton.css`
- `src/components/ui/Spinner.jsx`
- `src/components/ui/Spinner.css`
- `src/components/ui/StarRating.jsx`
- `src/components/ui/StarRating.css`
- `src/components/shared/PropertyCard.jsx`
- `src/components/shared/PropertyCard.css`
- `src/components/shared/WhatsAppButton.jsx`
- `src/components/shared/WhatsAppButton.css`
- `src/components/property/PropertyFilters.jsx`
- `src/components/property/PropertyFilters.css`
- `src/components/property/AmenitiesGrid.jsx`
- `src/components/property/ConfigurationsTable.jsx`
- `src/components/forms/ContactForm.jsx`
- `src/components/forms/ContactForm.css`
- `src/components/forms/InquiryForm.*`
- `src/components/forms/SiteVisitForm.*`
- `src/pages/HomePage.*`
- `src/pages/Properties.*`
- `src/pages/PropertyDetailPage.*`
- `src/pages/AboutUs.*`
- `src/pages/ContactUs.*`
- `src/pages/Blog.*`
- `src/pages/BlogDetail.*`
- `src/pages/OurTeam.*`
- `src/pages/GuaranteedRentPage.*`
- `src/pages/public/AuthPages.*`
- `src/components/layout/AdminLayout.*`
- `public/*` logo/favicons/manifest assets

### Repository-level implementation facts

- The application uses **React 19 + Vite**, not Create React App.
- There is **no Tailwind configuration** and no evidence that Tailwind is the active styling system.
- Public styling is primarily **custom CSS + CSS variables**, with component/page styles stored in normal `.css` files rather than CSS Modules.
- `framer-motion` is present in `package.json`, but no source imports were found during the repository scan. It should therefore not be treated as the current public motion system.
- The repository contains several comments describing earlier cleanup packages. Those comments are useful implementation context, but the rendered design recommendations in this report are based on the actual remaining code and values.

### Live-site cross-check

The supplied live URL was accessible to the web fetcher, but the returned page contained no usable extractable body for a reliable visual comparison. Therefore **no rendered-site observation is used to override source-code evidence** in this report.

**Evidence status for most findings:** Confirmed from code.

---

## 2. EVIDENCE STANDARD

This report uses the following evidence labels:

| Evidence label | Meaning |
|---|---|
| **Confirmed from code** | Directly supported by source code, CSS, tokens, JSX, asset metadata or package configuration. |
| **Confirmed from rendered site** | Supported by a usable rendered-page observation. Not available for the supplied live URL in this analysis. |
| **Strong inference** | A pattern is repeated enough across source files that it is reasonable to treat it as intentional design language, but it is not declared as a formal design token. |
| **Unknown / Not determinable** | The supplied source does not provide enough evidence to establish the behavior or rule. |

### Important interpretation rule

A repeated hard-coded value is not automatically an official token. For example, the public property card uses a `24px` radius repeatedly, but the formal token file defines `--card-radius: 12px`. This report therefore distinguishes:

- **formal tokens** already declared by the project, and
- **repeated visual patterns** that should be normalized for a future codebase.

Where a rule is not determinable from the source, the report says:

**Not determinable from supplied source**

---

## 3. EXECUTIVE DESIGN SUMMARY

### Overall visual personality

**Confirmed from code / strong inference**

UrbanEdge Living Space presents as a **premium, modern real-estate marketing interface with a corporate foundation and luxury cues**, expressed through a restrained navy/gold palette, serif display typography, image-led hero sections, elevated white cards, and conversion-oriented CTAs.

The design is not minimalist in the “ultra-sparse editorial” sense. It is more accurately **structured, polished and moderately content-dense**, especially on search/listing/detail pages.

### Brand impression

The interface consistently communicates:

- premium real estate positioning
- professional advisory/service positioning
- trust and conversion
- property-photo-led presentation
- strong navy authority with gold premium accents
- clear action hierarchy

### Major recurring patterns

1. **Playfair Display + Montserrat**
   - Serif display headings provide premium/luxury character.
   - Montserrat provides practical UI/body readability.

2. **Navy + gold identity**
   - Primary navy: `#02066F`
   - Navigation/deep navy: `#001F3F`
   - Gold: `#DABA52`
   - Gold gradient CTAs use darker metallic gold values.

3. **Image-led real-estate composition**
   - Large photographic hero areas.
   - Cover-cropped property/editorial imagery.
   - Navy overlays to preserve text contrast.

4. **Rounded, elevated cards**
   - General content cards are usually around `12px` radius.
   - The flagship PropertyCard is more rounded at `24px` with a stronger shadow/elevation.

5. **Pill language for actions and metadata**
   - Buttons use `30px` radius.
   - Badges commonly use fully rounded `999px`.

6. **Gold accent underlines**
   - Section headings frequently receive short gold underline rules.
   - This is one of the clearest recurring visual motifs.

7. **Responsive, mobile-first adaptation**
   - Navigation collapses at `768px`.
   - Listing grids collapse through `992px/768px`.
   - Filters become a bottom-sheet panel around `900px`.
   - Blog and hero grids have their own smaller breakpoints.

### Visual strengths

- Clear premium color/typography identity.
- Strong conversion hierarchy.
- Good use of photography and contrast overlays.
- PropertyCard has a particularly well-developed visual treatment.
- Shared Button/Input/Modal primitives exist and establish a foundation for normalization.
- Mobile behavior is not an afterthought; several components have explicit mobile states.
- Loading, empty, error and reduced-motion states are present on several important surfaces.

### Inconsistencies / implementation debt

**High / Medium importance**

- Multiple competing font stacks coexist in the token file (`Playfair Display`, `Montserrat`, `Inter`, `Poppins`, `Georgia`, `Segoe UI`), even though the strongest public identity is Playfair + Montserrat.
- The text-based NavigationBar logo and image-based UrbanEdge logo assets are different implementations of the same brand mark.
- Generic card tokens do not cover the stronger `24px` PropertyCard radius/shadow pattern.
- Multiple icon libraries are used (`lucide-react` and `react-icons`).
- Public pages contain both shared UI primitives and bespoke button/badge/card styles.
- Responsive breakpoints are not centralized.
- The global touch-target rule declares `11px`, while `HomePage.css` later declares `44px` for the same broad selectors.
- `Footer` has local styling while bare `footer` also has global styling.
- The repository contains duplicated/unused-looking logo assets and a React starter `src/logo.svg`.
- `hero-bg.jpg` is a zero-byte file in the supplied repository.
- `HomePage.jsx` contains a link to `/about`, while `App.jsx` defines the route as `/about-us`; this is a confirmed navigation inconsistency.
- The `AboutUs.css` hero uses `var(--background-gradient, url(...))`; because `--background-gradient` is defined in tokens, the image fallback is not used. This makes the implementation inconsistent with the surrounding “image/parallax” intent.
- The footer copyright text is hard-coded as `© 2025`.
- `README.md` contains older Create React App-style instructions even though the active build is Vite.

These are implementation issues, not reasons to abandon the visual language.

### What makes the site recognizable as UrbanEdge

The strongest recognizable combination is:

> **Deep navy + warm gold + Playfair Display headings + Montserrat body/UI + property photography + rounded elevated white cards + pill CTAs/badges + short gold section rules.**

That combination is stronger evidence of brand family than any individual component.

---

## 4. COMPLETE COLOR SYSTEM

### 4.1 Formal public-facing design tokens

**Confirmed from code: `src/styles/tokens.css`**

| Role | Token | HEX | Usage / notes | Consistency |
|---|---|---|---|---|
| Primary Navy | `--primary-color` | `#02066F` | Primary links, headings, primary buttons, active states, public UI | Very high |
| Accent Gold | `--accent-color` | `#DABA52` | Accents, section lines, highlights, stars, CTA accents | Very high |
| Secondary | `--secondary-color` | `#DABA52` | Alias/collision with gold | High but semantically redundant |
| Navigation Navy | `--bg-nav` / `--bg-dark` | `#001F3F` | Navigation and footer surfaces | High |
| Deep Navy | `--primary-dark` | `#01043D` | Dark headings/detail presentation | Repeated |
| White | `--white` | `#FFFFFF` | Backgrounds, cards, text on navy | Very high |
| Background | `--background-color` | `#FFFFFF` | Global body background | High |
| Light background | `--light-color` / `--off-white` | `#F9FAFB` | Page/detail backgrounds, soft sections | High |
| Neutral light | `--neutral-light` | `#F0F0F0` | Listing background and utility surfaces | Moderate |
| Dark text | `--dark-color` | `#333333` | Body text in many page components | High |
| Secondary text | `--text-light` | `#495057` | Paragraph/meta tone in public pages | Moderate |
| Black/Charcoal | `--black` / `--charcoal` | `#000000` | Base/reset text in places | Moderate |

### 4.2 CTA gold gradient

**Confirmed from code**

```css
--btn-bg: linear-gradient(45deg, #B8860B, #CD950C);
--btn-hover-bg: linear-gradient(45deg, #CD950C, #B8860B);
```

This gradient appears in the shared Button primary treatment and is visually more metallic/deeper than `--accent-color`.

### 4.3 Accent expansion tokens

**Confirmed from code**

| Token | HEX | Role |
|---|---|---|
| `--accent-hover` | `#C9A83F` | Gold hover |
| `--accent` | `#C4A542` | Alternate semantic gold |
| `--accent-light` | `#E0C76A` | Light gold |
| `--accent-dark` | `#A17D2D` | Dark gold |

These reinforce the same gold family but indicate that the project has more than one “canonical” gold value.

### 4.4 Primary expansion tokens

| Token | HEX | Role |
|---|---|---|
| `--primary-light` | `#2C5998` | Light blue/navy extension |
| `--primary-dark` | `#01043D` | Deep navy |
| `--primary` | alias of `--primary-color` | Public primary |

### 4.5 Neutral/grayscale tokens

**Confirmed from code**

`--gray-100 #F3F4F6`, `--gray-200 #E5E7EB`, `--gray-300 #D1D5DB`, `--gray-400 #9CA3AF`, `--gray-500 #6B7280`, `--gray-600 #4B5563`, `--gray-700 #374151`, `--gray-800 #1F2937`, `--gray-900 #111827`.

Also present:

- `--neutral-medium: #E9ECEF`
- `--neutral-dark: #6C757D`

These are useful for utility/UI states but are not themselves strong brand colors.

### 4.6 Semantic/public component colors

These are repeated UI-category colors rather than core brand colors:

| Purpose | HEX / treatment | Example usage |
|---|---|---|
| Rent category | `#0F8B8D` → `#159A9C` | PropertyCard “For Rent” badge |
| Commercial category | `#4B3F8F` → `#5E4DB8` | PropertyCard commercial badge |
| WhatsApp | `#25D366` → `#1EBE5A` | Floating/inline WhatsApp actions |
| Favourite active | `#E0335F` | Property favourite control |
| Success | `#2E8B57` and related green states | Shared Badge/forms/admin |
| Warning | `#E67E22` | Shared Badge/admin |
| Danger | `#C0392B` / `#A33025` | Shared Badge/admin/errors |
| Error text variant | `#B91C1C`, `#B3261E` | Empty/error/auth states |

### 4.7 Gradients and overlays

**Confirmed from code**

- Background gradient: `linear-gradient(135deg, #0A1741, #1A2A5E)`
- Homepage hero overlay: dark navy `rgba(2,6,46,0.72)` to `rgba(2,6,46,0.82)`
- Properties hero overlay: primary navy around `0.55` to `0.70` opacity
- Blog hero overlay: primary navy `0.72` to `0.82`
- Contact hero: navy `rgba(0,24,61,0.7)` plus a separate black overlay `rgba(0,0,0,0.35)`
- About hero background currently resolves to the tokenized navy gradient because `--background-gradient` is defined.

### 4.8 Opacity language

The design repeatedly uses:

- white text at `.75`, `.88`, `.90`, `.96` opacity in hero/nav contexts
- translucent white card/action backgrounds
- dark navy image overlays between roughly `.04` and `.82`, depending on purpose
- translucent black scrims for mobile sheets/modals

### 4.9 Hover/active language

The dominant interaction language is:

- navy → gold text or gold border
- transparent → filled navy for outline buttons
- gold gradient reverses direction on hover
- cards lift vertically and increase shadow
- images scale around `1.04–1.05`
- pills/chips use navy background for active state

### 4.10 Canonical UrbanEdge palette

**Recommended canonicalization of existing patterns; not a new brand**

Use these as the core public palette for Land Space:

```text
Brand Navy:        #02066F
Navigation Navy:   #001F3F
Deep Navy:         #01043D
Brand Gold:        #DABA52
CTA Gold Dark:     #B8860B
CTA Gold Light:    #CD950C
White Surface:     #FFFFFF
Soft Surface:      #F9FAFB
Neutral Surface:   #F0F0F0
Primary Text:      #333333
Muted Text:        #495057
Border Neutral:    #E9ECEF / #E5E7EB
```

Treat teal, indigo, WhatsApp green, success/warning/danger colors as **semantic UI colors**, not as core UrbanEdge brand colors.

---

## 5. TYPOGRAPHY SYSTEM

### 5.1 Font loading

**Confirmed from code: `src/styles/typography.css`**

Google Fonts are loaded for:

- **Playfair Display** — weights `400`, `700`
- **Montserrat** — weights `300`, `400`, `600`

Font display is `swap`.

### 5.2 Main public typography tokens

```css
--heading-font: 'Playfair Display', serif;
--body-font: 'Montserrat', sans-serif;
```

These are the strongest and most consistently used public identity tokens.

### 5.3 Other font tokens present

`tokens.css` also contains:

- `--primary-font: 'Playfair Display','Georgia',serif`
- `--font-heading: 'Playfair Display', serif`
- `--font-body: 'Inter', sans-serif`
- `--font-primary: 'Poppins','Segoe UI',sans-serif`
- `--font-secondary: 'Georgia',serif`
- `--font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

**Evidence: Confirmed from code**

This means the formal token layer contains legacy or subsystem-specific font options that compete with the main public pair.

### 5.4 Global body

**`src/styles/global.css`**

- Font: `var(--body-font)` → Montserrat
- Base font size: `clamp(1rem, 1.5vw, 1.125rem)`
- Line height: `1.6`
- Color: `--charcoal`
- Background: white
- Horizontal overflow hidden
- Antialiasing enabled

### 5.5 Heading system

**`src/styles/typography.css`**

All `h1–h6`:

- Playfair Display
- weight `700`
- line height `1.3`
- `margin-bottom: .5em`
- letter spacing `-0.01em`
- primary navy color

Representative scale:

| Level | Size |
|---|---|
| H1 | `clamp(1.75rem, 5vw, 2.75rem)` |
| H2 | `clamp(1.5rem, 4vw, 2.25rem)` |
| H3 | `clamp(1.25rem, 3vw, 1.75rem)` |
| H4 | `clamp(1.125rem, 2vw, 1.5rem)` |
| H5 | `clamp(1rem, 1.5vw, 1.25rem)` |

Paragraphs:

- line height `1.7`
- bottom margin `1rem`
- max width `72ch`

### 5.6 Homepage hero typography

**`src/pages/HomePage.css`**

- mobile-ish hero H1: `2.1rem`
- <=480px: `1.6rem`
- >=769px: `2.6rem`
- >=1025px: `2.9rem`
- hero paragraph approximately `1.05rem` / `1.1rem` on larger displays

### 5.7 Button typography

**`src/components/ui/Button.css`**

- Montserrat
- weight `500`
- size varies with button size
- button text uses normal case, not an all-caps system

### 5.8 Blog/label typography

Blog hero eyebrow:

- `0.75rem`
- weight `700`
- uppercase
- letter spacing `0.12em`
- gold

Blog chips:

- `0.86rem`
- weight `600`

### 5.9 Property card typography

**`src/components/shared/PropertyCard.css`**

- title approximately `1.12rem`, `700`
- location approximately `0.94rem`
- metadata approximately `0.90rem`
- price approximately `1.08rem`, `800`
- per-square-foot approximately `0.86rem`

### 5.10 Consistency assessment

**Medium inconsistency**

The public visual identity is strongest when Playfair Display + Montserrat are used together. Poppins/Inter/Georgia/Segoe UI should not be treated as equivalent public brand typography simply because they exist as tokens.

Admin and some feature-specific surfaces use separate stacks. That is acceptable for an internal application, but a future Land Space public UI should avoid inheriting these subsystem fonts unless there is a deliberate reason.

### 5.11 Canonical UrbanEdge Typography System

**Recommended normalization of current public patterns**

```text
Display / Headings:
  Playfair Display
  Preferred weights currently evidenced: 400, 700
  H1–H6: weight 700 by default

Body / UI:
  Montserrat
  Current evidenced weights: 300, 400, 600

Body base:
  16–18px responsive clamp
  line-height around 1.6–1.7

Section headings:
  Playfair Display
  Navy
  Gold underline accent

Labels / chips:
  Montserrat
  600–700
  compact size
  moderate letter spacing where uppercase
```

---

## 6. SPACING SYSTEM

### 6.1 Formal spacing tokens

**Confirmed from `src/styles/tokens.css`**

| Token | Value |
|---|---|
| `--spacing-xxs` | `0.375rem` |
| `--spacing-xs` | `clamp(5px, 1vw, 10px)` |
| `--spacing-sm` | `clamp(10px, 2vw, 20px)` |
| `--spacing-md` | `clamp(15px, 3vw, 30px)` |
| `--spacing-lg` | `clamp(20px, 4vw, 40px)` |
| `--spacing-xl` | `clamp(30px, 5vw, 60px)` |
| `--base-spacing` | `20px` |
| `--section-spacing` | `clamp(30px, 5vw, 60px)` |

### 6.2 Global container

**`src/styles/global.css`**

```css
.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-sm);
}
```

This is the strongest generic public page shell.

### 6.3 Homepage container variation

**`src/pages/HomePage.css`**

```css
.homepage-container {
  width: 92%;
  max-width: 1180px;
}
```

This is close to, but not identical to, the global container.

### 6.4 Detail-page content ceiling

**Property detail CSS**

- maximum width approximately `1280px`
- horizontal padding uses `--spacing-sm`

This is appropriate to the more data-rich property-detail layout.

### 6.5 Grid gaps

Common examples:

- `gap: var(--spacing-sm)` in the global grid
- Property results: `var(--spacing-md)` and roughly `24–25px`
- Blog results: `var(--spacing-lg) var(--spacing-md)`
- Mobile filter sections: roughly `20px`
- Card body/detail groups: 8–20px depending on component

### 6.6 Section spacing

The common public pattern is approximately:

- `30–60px` vertical section spacing through `--section-spacing`
- Larger marketing sections such as blog content use multiplied versions of spacing tokens
- Hero sections are more bespoke and page-specific

### 6.7 Mobile spacing

Recurring mobile reductions include:

- `16px` or tokenized small gaps
- `12px` edge padding in hero/search contexts
- `10px` in application shell on narrow screens
- cards reduce internal padding and/or image height
- grids collapse to one column rather than retaining dense desktop spacing

### 6.8 Canonical spacing system

**Recommended normalization of current patterns**

```text
6px      xxs
5–10px   xs
10–20px  sm
15–30px  md
20–40px  lg
30–60px  xl / section
20px     base UI spacing
```

For Land Space, keep the tokenized clamp strategy rather than introducing dozens of arbitrary pixel values.

---

## 7. BORDER, RADIUS, SHADOW & SURFACE SYSTEM

### 7.1 Formal radius tokens

**Confirmed from code**

| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `8px` |
| `--radius` | `0.375rem` |
| `--card-radius` | `12px` |
| Button radius | `30px` in `Button.css` |
| Badge radius | `999px` |

### 7.2 Actual component radii

| Component | Radius |
|---|---|
| Generic Card | `12px` |
| PropertyCard desktop | `24px` |
| PropertyCard mobile | `20px` |
| BlogCard | `12px` |
| Testimonial/card surfaces | generally `12px` |
| Property Detail hero/sections | `8px` |
| Property Detail RERA pill | `999px` |
| Nav mobile panel | `14px` |
| Team cards | around `6px` |
| Buttons | `30px` |
| Chips/badges | `20px` to `999px` |

### 7.3 Radius interpretation

UrbanEdge is **slightly-to-moderately rounded**, not fully pill-heavy.

The strongest visual split is:

- **General content surfaces:** about `8–12px`
- **Featured property merchandising card:** about `20–24px`
- **Actions/chips:** about `30–999px`

### 7.4 Formal shadows

```css
--shadow-sm:
  0 1px 3px rgba(2,6,111,.07),
  0 1px 2px rgba(2,6,111,.05);

--shadow-md:
  0 8px 20px rgba(2,6,111,.10);

--shadow-lg:
  0 16px 32px rgba(2,6,111,.12);
```

Aliases also exist:

- `--shadow`
- `--shadow-light`
- `--shadow-medium`
- `--shadow-premium`
- `--box-shadow`

### 7.5 Property card elevation

The PropertyCard uses a stronger bespoke treatment:

```text
Default:
0 22px 45px rgba(15,23,42,.08)

Hover:
0 28px 60px rgba(15,23,42,.16)
```

Hover also translates approximately `-8px`.

### 7.6 Surfaces

Dominant hierarchy:

1. Navy/dark photographic hero
2. White cards/content surfaces
3. Soft neutral page backgrounds (`#F9FAFB` / `#F0F0F0`)
4. Gold accents, borders or controls
5. Dark navy text/headers

### 7.7 Glass / blur

Confirmed effects include:

- navigation backdrop blur on scroll: `blur(6px)`
- translucent mobile nav/action surfaces
- homepage `text-background-overlay` with `backdrop-filter: blur(4px)`
- property quick-action surfaces use translucent white + backdrop blur around `8px`

This is used sparingly rather than as a universal glassmorphism aesthetic.

### 7.8 Recommended canonical elevation/radius rules

Use the existing public hierarchy:

```text
radius-sm:         4px
radius-md:         6px
radius-lg:         8px
radius-card:       12px
radius-property:   24px  (normalize existing PropertyCard pattern)
radius-button:     30px
radius-pill:       999px
```

Do not replace the PropertyCard’s elevated character with flat 12px cards merely to satisfy token purity; normalize it as a named higher-emphasis card pattern.

---

## 8. BUTTON SYSTEM

### 8.1 Shared Button primitive

**Confirmed from `src/components/ui/Button.jsx` and `Button.css`**

Variants:

- primary
- secondary
- outline
- ghost
- danger

Sizes:

- small
- medium
- large

Additional behaviors:

- `fullWidth`
- loading
- disabled

### 8.2 Primary

- Gold gradient background
- White text
- Pill radius `30px`
- Montserrat, weight `500`
- Moderate shadow
- Hover reverses gradient
- Hover translates upward around `3px`
- Hover shadow increases
- Focus-visible uses a `2px` primary outline

### 8.3 Secondary

- Navy background
- White text
- Same pill/spacing language
- Hover shifts toward deeper navy

### 8.4 Outline

- Transparent background
- Primary navy border/text
- Hover fills with navy and switches to white text

### 8.5 Ghost

- Transparent
- Neutral hover surface
- Intended for lower-emphasis interaction

### 8.6 Danger

Uses the semantic red token family. Primarily relevant to admin/utility actions, not brand CTAs.

### 8.7 Sizing

Representative shared values:

- small: around `0.5rem 1rem 0.875rem`
- medium: around `0.75rem 1.5rem`, responsive font-size around `0.875–1rem`
- large: around `1rem 2rem`, about `1.125rem`

### 8.8 Icon treatment

Buttons use flex alignment and small inter-icon gaps; icon placement is generally inline with the label rather than being a separate decorative badge.

### 8.9 Hover / active / focus

- Hover: background/border transition + small upward movement on primary
- Focus-visible: visible outline
- Disabled: opacity reduction and pointer suppression
- Active-specific transform is not separately prominent beyond the hover/press behavior declared in the CSS

### 8.10 Other button-like patterns

There are also bespoke buttons for:

- property hero/search submit
- blog hero search submit
- phone CTA
- mobile filter controls
- category chips
- property quick-action icon buttons
- WhatsApp CTA

This means the shared Button primitive is a strong source of truth, but it is not literally the only visual button implementation in the project.

### 8.11 Canonical UrbanEdge Button Variants

For Land Space, inherit:

```text
Primary:
  Gold gradient + white text + pill

Secondary:
  Navy fill + white text + pill

Outline:
  Navy border + navy text → navy fill on hover

Ghost:
  transparent → soft neutral hover

Semantic:
  danger/success only when function requires it
```

Keep the gold/navy contrast. Avoid introducing a large new library of button shapes.

---

## 9. CARD SYSTEM

### 9.1 PropertyCard — flagship brand card

**`src/components/shared/PropertyCard.jsx/.css`**

Structure:

1. Image area
2. Overlay/listing badge
3. Featured/RERA/property-type indicators
4. Quick-action buttons
5. Details panel
6. Location
7. Metadata
8. Price
9. Optional WhatsApp action

### 9.2 PropertyCard presentation

- Radius: `24px` desktop / `20px` mobile
- Border: subtle `rgba(10,23,65,.08)`
- White-to-soft-blue/white background treatment
- Stronger-than-token shadow
- Hover lift about `8px`
- Image: about `260px` desktop, about `230px` mobile
- Image object-fit cover
- Image hover scale around `1.04`

### 9.3 PropertyCard badge system

Buy/sale:

- gold gradient
- navy text

Rent:

- teal gradient

Commercial:

- indigo gradient

Featured:

- white translucent pill
- gold border/star

Property type:

- translucent white pill near bottom-left

RERA:

- verification-style pill/badge

### 9.4 PropertyCard family identity

This card is arguably the strongest reusable visual reference for Land Space because it combines:

- property photography
- pill metadata
- navy typography
- gold accenting
- compact iconography
- strong white surface elevation
- clear price/action hierarchy

### 9.5 BlogCard

- White surface
- `12px` radius
- subtle border
- small-to-medium shadow
- image ratio around `16/10`
- badge radius `4px`
- body padding around `20–24px`
- hover lift about `4px`
- image zoom around `1.05`

### 9.6 Generic Card primitive

The shared `Card` is intentionally generic:

- white
- `12px` radius
- `--shadow-sm`
- optional hoverable state that lifts around `6px`
- image wrapper about `200px`
- body padding tokenized

However, public pages often use bespoke domain-specific cards instead of the generic primitive.

### 9.7 Testimonial cards

The shared/new carousel uses:

- white cards
- around `12px` radius
- stronger shadow
- gold left quote accent
- circular imagery
- one/two/three-card responsive progression

There is also a legacy `Testimonial` component/style with slightly different dimensions and shadows.

### 9.8 Contact/information cards

Contact details and other information surfaces tend toward:

- white
- `12px` radius
- medium/large shadow
- centered or compact text hierarchy
- hover lift in some contexts

### 9.9 Mobile behavior

Cards mostly:

- reduce image height
- reduce internal padding
- switch list-layout cards to column
- collapse multi-column grids to one column
- preserve the same color/radius language

### 9.10 What Land Space should preserve

The **visual structure** of PropertyCard is highly reusable.

The information architecture should change from residential/commercial property metadata to land metadata, while retaining:

- image-first presentation
- title
- location
- compact metadata
- status/type badges
- price
- verification/action zone
- rounded elevated surface

---

## 10. HEADER / NAVBAR

### 10.1 Structure

**`src/components/NavigationBar.jsx`**

Desktop navigation items:

- Home
- About Us
- Properties
- Our Team
- Blog
- Contact Us
- Sign In / My Account
- WhatsApp CTA

### 10.2 Positioning

**Confirmed**

- Sticky at top
- `z-index: 1000`
- baseline min-height around `58px`
- horizontal padding `12px 20px`

### 10.3 Colors

Base:

- navigation navy `#001F3F`

Scrolled:

- `rgba(0,31,63,.92)`
- backdrop blur `6px`
- subtle black shadow

### 10.4 Logo implementation

**Important confirmed inconsistency**

The NavigationBar does **not** use the supplied UrbanEdge image logo. It renders a text lockup:

- “Urban Edge” in gold
- “Living Space” in white
- Playfair Display
- roughly `1.5rem` mobile and `1.9rem` desktop

The asset-based logo is used elsewhere.

This means the current website has two distinct logo implementations.

### 10.5 Navigation typography

- Montserrat for navigation links
- around `.98rem` desktop
- mobile around `.9rem`
- active/hover state uses gold

### 10.6 WhatsApp CTA

The navigation CTA deliberately uses **gold/navy**, not WhatsApp green:

- translucent gold background
- gold border
- gold text
- fills gold on hover

This makes it read as a brand CTA rather than as an external green widget.

### 10.7 Mobile navigation

At `max-width: 767px`:

- hamburger button around `44x44`
- bars around `22x2`
- animated bars transform to X
- menu is a fixed floating panel
- width around `min(220px, calc(100vw - 16px))`
- max-height around `72dvh`
- radius `14px`
- navy gradient
- shadow around `0 12px 28px rgba(0,0,0,.2)`
- slide-in from right
- links use small rounded backgrounds
- menu closes on Escape
- resize at `>=768px` resets the open state

### 10.8 Desktop/mobile breakpoint

**Confirmed**

`768px` is the primary navigation breakpoint in CSS and component logic.

### 10.9 Header theme behavior

Unlike some older real-estate implementations, the current navigation is not primarily a transparent-over-hero header. It remains a sticky navy navigation surface.

A page-specific dark hero generally follows beneath it.

### 10.10 Land Space guidance

Reuse:

- sticky premium navy header
- gold active/CTA language
- compact desktop navigation
- floating mobile menu behavior
- same general logo hierarchy

Do not copy the **text-only logo implementation** as a rule. The more robust family rule is to use an approved UrbanEdge logo asset consistently in the new codebase.

---

## 11. FOOTER

### 11.1 Structure

**`src/components/Footer.jsx`**

Three primary columns:

1. Quick Links
2. Newsletter subscription
3. Follow Us

Socials:

- Facebook
- Instagram
- WhatsApp

### 11.2 Footer styling

**`Footer.css`**

- background: `var(--bg-dark)` → `#001F3F`
- white text
- vertical padding around `--section-spacing` / `20px`
- max content width `1200px`
- mobile centered/stacked
- desktop row at `768px`
- section headings gold, around `1.3rem`, weight `600`
- social icons around `1.6rem`
- bottom border `rgba(255,255,255,.15)`

WhatsApp icon uses green `#25D366` within the social icon group.

### 11.3 Footer logo

**Confirmed**

The current Footer component does **not** render the UrbanEdge logo asset.

### 11.4 Copyright

Hard-coded:

`© 2025`

This is implementation content debt rather than a brand-system rule.

### 11.5 Newsletter behavior

The visible form exists, but the submit handler clears the input rather than exposing a visible subscription state. This is primarily interaction/functional debt, not a visual design rule.

### 11.6 Global/local styling overlap

`src/styles/global.css` also styles bare `footer`, including a primary-navy background. `.footer` then provides its own local styling.

The component renders `.footer`, so local rules are the stronger implementation path. However, this duplication should not be carried into a new codebase.

### 11.7 Land Space continuity

Preserve:

- navy footer surface
- gold section headings
- white typography
- compact multi-column information architecture
- social/contact row
- restrained border treatment

The footer does not need to copy Living Space-specific links.

---

## 12. LOGO USAGE

### 12.1 Existing logo assets

Confirmed asset inventory includes:

- `public/UrbanEdge_Living_Space_Logo_HD.jpg`
- `public/uelslogo.jpg`
- `public/logo192.png`
- `public/logo512.png`
- `public/favicon.ico`
- `public/og-image.svg`
- `src/assets/UrbanEdge_Living_Space_Logo_HD.jpg`
- `src/logo.svg`

### 12.2 Main image-logo asset

The public JPG:

- approximately `4267 × 4267`
- square
- used in image-based areas such as Homepage/About sections
- rendered with constrained display width and object-fit containment

### 12.3 Duplicate logo asset

`public/UrbanEdge_Living_Space_Logo_HD.jpg` and `public/uelslogo.jpg` have the same observed file size and dimensions in the supplied source.

The source does not establish whether they have meaningful visual differences. Treat them as duplicate-looking assets requiring one canonical source in a future codebase.

### 12.4 Text logo

NavigationBar uses a text lockup rather than the image logo.

This is the largest logo-system inconsistency.

### 12.5 Footer

No logo is rendered.

### 12.6 Favicon/app logos

- favicon is present
- 192px and 512px app icons are present

### 12.7 Open Graph asset

`public/og-image.svg` exists and is a navy/gold brand-themed `1200×630`-style social preview asset.

However, `index.html` metadata points at a public logo JPEG rather than clearly using `og-image.svg`.

### 12.8 React starter logo

`src/logo.svg` is the standard React-style starter logo and does not represent the UrbanEdge brand.

**Recommendation:** Do not carry it into Land Space.

### 12.9 Logo rules for Land Space

**Reuse closely**

- Use an approved UrbanEdge logo asset.
- Preserve original aspect ratio.
- Use image containment rather than stretching/cropping.
- Prefer a canonical asset path rather than duplicating the same image under multiple filenames.
- Maintain sufficient clear space around the mark.
- Use a dark-background-compatible logo variant only where the source asset supports it.

**Not determinable from supplied source**

A formal measured clear-space rule, official minimum physical size, or officially approved monochrome logo specification is not declared in the repository.

---

## 13. ICONOGRAPHY

### 13.1 Libraries

Two icon systems are present:

- `lucide-react`
- `react-icons`

### 13.2 Examples

PropertyCard uses Lucide icons such as:

- `MapPin`
- `BedDouble`
- `Ruler`
- `Building2`
- `Heart`
- `ShieldCheck`
- `Star`
- `UserRound`

React Icons is also used for items such as WhatsApp and navigation/social icons.

### 13.3 Visual language

The public UI generally favors:

- compact icon sizes
- outline-style utility icons
- icons inside circular or softly rounded controls
- gold for highlighted/icon-accent roles
- navy/gray for utility metadata
- WhatsApp green only for explicitly branded WhatsApp controls

### 13.4 Sizes

Common practical sizes are around:

- `16px` for labels/details
- `20–24px` for buttons/metadata
- `32–48px` inside larger icon containers

Exact size varies per component.

### 13.5 Stroke/fill

Because two libraries are used, there is no single formally enforced stroke system.

**Medium consistency issue**

For Land Space, select one principal outline icon language for general UI and reserve branded logos/icons (such as WhatsApp) for their specific library/source.

---

## 14. IMAGE / MEDIA STYLE

### 14.1 General principle

UrbanEdge is strongly **image-led**.

Images are used to communicate:

- property quality
- premium positioning
- editorial/company story
- place/context

### 14.2 Global image behavior

`src/styles/global.css`:

```css
img, video {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
```

Individual components then set explicit dimensions/ratios.

### 14.3 Homepage hero

**Confirmed**

- Uses `property.jpg`
- `min-height: 560px`
- `background-size: cover`
- centered
- strong dark navy overlay
- centered headline/search/trust strip

The source comments state that `hero-bg.jpg` exists but is a zero-byte placeholder, so the populated property image is used instead.

### 14.4 Properties hero

- Dedicated `property_hero_image.jpg`
- compact roughly `220px` desktop hero
- cover treatment
- navy overlay
- centered title/count/search

### 14.5 Blog and Contact imagery

`pexels-cmoon-12558848.jpg` is reused for large editorial/contact hero areas.

This is a strong example of **presentation-system reuse** rather than identical content.

### 14.6 Property cards

- fixed-height image region
- object-fit cover
- subtle dark overlay
- hover zoom
- rounded card clipping

### 14.7 About page imagery

- split story image
- service/offer cards with photographic artwork
- some generated/illustrative image assets
- soft corners and medium shadow

### 14.8 Detail gallery

Property detail uses:

- a large primary hero/gallery image
- cover cropping
- gallery interaction/button overlay
- rounded container

### 14.9 Lazy loading

PropertyCard images explicitly use lazy loading.

### 14.10 Loading/placeholder behavior

Skeleton components are available and used on listing/content surfaces.

### 14.11 Image-specific source inconsistencies

- `hero-bg.jpg` is zero-byte
- multiple similar/duplicate logo JPGs exist
- social preview configuration does not appear fully aligned with the dedicated `og-image.svg`

These are asset-management issues, not reasons to change the image-led brand strategy.

### 14.12 Land Space media direction

Reuse:

- full-bleed or wide hero photography
- navy overlays
- `cover` for photographic cards
- controlled crop ratios
- subtle image zoom on hover
- rounded clipping
- lazy loading
- skeleton placeholders

For Land Space, the content should shift to **roads, agricultural plots, NA parcels, industrial estates, access roads, surrounding context and aerial/location imagery**, while retaining the same presentation treatment.

---

## 15. FORMS & INPUTS

### 15.1 Shared Input primitive

**`src/components/ui/Input.css`**

- white background
- approximately `0.7rem 1rem` padding
- `1rem` text
- Montserrat/inherited font
- `1px` neutral border
- `6px` radius
- label around `.9rem`, weight `600`
- focus border becomes primary navy
- focus adds around `3px` translucent navy ring
- error state uses danger color

### 15.2 Textarea

- mirrors Input
- min-height around `6rem`
- vertical resize
- same radius/focus conventions

### 15.3 Contact form

`ContactForm.css`:

- white card
- `12px` radius
- large shadow
- `20px`-scale padding
- form gaps around `20px`
- success/error messages use pale tinted surfaces and semantic colors

### 15.4 Inquiry/Site Visit forms

These forms use similar vertical spacing and status colors. Site Visit includes paired fields that collapse on narrow widths.

### 15.5 Search inputs

Homepage/search/listing/blog each use white, bordered or borderless input groups with:

- clear contrast
- compact controls
- gold/navy submit buttons

### 15.6 Auth forms

`src/pages/public/AuthPages.css`:

- auth card max-width `420px`
- padding around `2.5rem 2rem`
- radius `12px`
- shadow medium
- input radius `8px`
- light neutral borders
- simple focused navy border

### 15.7 Select/filter controls

PropertyFilters:

- search/select control height around `40px`
- `6px` radius
- gray border
- chips around `32px` tall
- active chips use navy fill/white text

### 15.8 Consistency assessment

There is a good common foundation, but not every page uses the shared Input component. Some forms remain page-specific.

Land Space should preserve the shared input geometry and focus language rather than reproducing every bespoke form rule from Living Space.

---

## 16. BADGES / PILLS / STATUS INDICATORS

### 16.1 Shared Badge primitive

**`src/components/ui/Badge.css`**

- pill radius `999px`
- compact padding
- small/medium size variants
- semantic variants: neutral, primary, accent, success, warning, danger, info

### 16.2 PropertyCard badges

The PropertyCard has richer bespoke badges:

- For Sale: gold
- For Rent: teal
- Commercial: indigo
- Featured: white + gold
- RERA: verification
- Property type: translucent white

### 16.3 Positioning

- top-left for main listing status
- top/overlay for featured/RERA/utility tags
- bottom-left for property type
- quick actions occupy the opposing top-right zone

### 16.4 Typography

Generally:

- compact
- Montserrat
- `600–800`
- moderate to strong contrast
- some uppercase semantics

### 16.5 Reuse for Land Space

The structure can be reused for:

- Agricultural
- NA
- Industrial
- Buy
- Rent
- Lease
- Verified

However, **do not automatically assign new colors** from the Living Space source. The teal/indigo meanings are specifically used for Living Space’s residential/commercial transaction categories. For Land Space, define semantics first and keep the core UrbanEdge navy/gold relationship.

### 16.6 RERA vs verification

The current RERA treatment is specifically tied to property compliance. Land Space may need a different verification vocabulary.

**Recommendation:** retain the visual concept of a verification badge, but change the label and information model to what the land product actually verifies. Do not merely rename RERA to “Verified” without a defined verification rule.

---

## 17. LAYOUT SYSTEM

### 17.1 Primary layout technologies

**Confirmed**

- Flexbox
- CSS Grid
- custom CSS
- CSS variables
- component-level styles

No active Tailwind system was found.

### 17.2 Generic page shell

Primary public pattern:

```text
full-width hero / section
    ↓
.container
    width: 90%
    max-width: 1200px
    centered
```

### 17.3 Global grid

12-column grid utility exists:

```css
.grid {
  display: grid;
  gap: var(--spacing-sm);
  grid-template-columns: repeat(12, 1fr);
}
```

At `768px` and `992px` additional column span rules are applied.

### 17.4 Listing layout

Desktop:

```text
Page hero
  ↓
Main content
  ├── Filter sidebar (~260px)
  └── Results flex area
       ├── sort/view controls
       └── property grid
```

### 17.5 Property detail layout

Desktop:

```text
Hero/gallery card
    ↓
Main content
 ├── Main information/content
 └── ~340px sticky sidebar
```

At smaller widths the sidebar stacks.

### 17.6 Homepage layout

Marketing shell:

```text
Hero + search + trust
↓
Welcome / introduction
↓
Featured properties
↓
Why choose us
↓
Guaranteed rent band
↓
Testimonials
↓
Latest blog
↓
Contact CTA
```

### 17.7 About layout

Editorial split sections:

- hero
- narrative/story
- split image/text
- mission/value cards
- service/offer cards
- testimonials
- CTA

### 17.8 Contact layout

- hero
- form/details split
- map embedded within contact details
- mobile stacked

### 17.9 Blog layout

- editorial hero
- search
- category chips
- 3-column desktop grid
- 2-column around `1024px`
- 1-column at `640px`

### 17.10 Layout philosophy

UrbanEdge uses **section-based composition with controlled maximum widths**, not an extremely dense application dashboard style for public pages.

The visual rhythm alternates:

- full-width dark/image section
- centered constrained content
- white/neutral content surface
- elevated card group

---

## 18. RESPONSIVE BEHAVIOR

### 18.1 Breakpoints actually present

The source uses several breakpoints:

- `480px`
- `481px`
- `560px`
- `576px`
- `640px`
- `720px`
- `768px`
- `769px`
- `880px`
- `900px`
- `992px`
- `1024px`
- `1025px`
- `1200px`
- `prefers-reduced-motion`

This is **not** a single centralized breakpoint system.

### 18.2 Strongest recurring breakpoint family

The most common general-purpose breakpoints are:

- `480px`
- `576px`
- `768px`
- `992px`
- `1200px`

Additional components introduce specialized values such as `900px` and `1024px`.

### 18.3 Header

- `>=768px`: desktop navigation
- `<768px`: hamburger + floating/fixed mobile panel

### 18.4 Homepage hero

- <=480px: reduced headline, tighter padding, search controls stack
- 481–768px: intermediate spacing
- >=769px: larger hero typography
- >=1025px: largest hero heading (`2.9rem`)

### 18.5 Search

Homepage search transitions from horizontal to stacked on narrow displays.

Property and blog search bars are designed to remain compact but adapt width as available.

### 18.6 Property grids

Properties page:

- desktop: responsive multi-column grid using `minmax(280px,1fr)`
- <=992px: main layout stacks and sidebar becomes full width
- <=768px: results grid becomes one column

Blog:

- 3 columns
- <=1024px: 2 columns
- <=640px: 1 column

### 18.7 PropertyCard

- image height decreases
- radius reduces from 24 to 20
- list mode collapses toward stacked layout
- content padding reduces

### 18.8 PropertyFilters

This is one of the most deliberate responsive components:

- desktop: sidebar
- <=900px: trigger control appears
- mobile: filters become a fixed bottom sheet
- sheet reaches about `85vh`
- radius on top corners `16px`
- backdrop/scrim is shown
- footer actions remain accessible

No separate mobile DOM/component was required; the same component is adapted through CSS/state.

### 18.9 Property detail

- desktop: main column + ~340px sidebar
- <=900px: stacks
- <=560px: shorter image hero
- <=480px: key detail grid becomes one column

### 18.10 About

- desktop split content
- <=768px: major flex sections stack
- hero typography falls
- offers/values become narrower/full-width as required

### 18.11 Contact

- <=768px: form and contact details stack
- <=576px: hero title reduces further

### 18.12 Blog

- <=640px: category chips horizontally scroll instead of wrapping to multiple lines
- grid drops to one column
- search icon disappears on very small screens

### 18.13 Footer

- mobile: stacked/centered
- desktop: horizontal multi-column

### 18.14 Typography responsiveness

The project uses `clamp()` in the formal heading and spacing system and supplements it with page-level media-query overrides.

### 18.15 Responsive strengths

- property filters have an explicit mobile information architecture
- navigation has explicit mobile interaction logic
- cards and grids generally collapse rather than overflow
- blog chips use horizontal scrolling appropriately
- property detail has staged layout reduction

### 18.16 Responsive weaknesses / normalization opportunities

**Medium**

- Too many breakpoint values for a codebase without centralized breakpoint tokens.
- `900px` vs `992px` is used differently by filter/detail/listing surfaces.
- `1024px` vs `1025px` split is present in some hero/blog styles.
- There is no single source of truth for all component breakpoints.

### 18.17 Recommended Land Space breakpoint normalization

Based strictly on recurring current values:

```text
<480px     compact/mobile
>=480px    larger mobile/small tablet
>=768px    desktop navigation / major 2-column transition
>=992px    large desktop content/grid
>=1200px   wide desktop/container ceiling
```

Use `900px` or `1024px` only where the content genuinely benefits from the additional transition.

---

## 19. INTERACTIONS & MOTION

### 19.1 General transition tokens

**Confirmed from `tokens.css`**

- `--transition-fast: .2s`
- `--transition-medium: .3s`
- `--transition-slow: .5s`
- `--transition-speed: .3s`
- `--transition: all .25s ease`
- `--ease-out-smooth: cubic-bezier(.22,1,.36,1)`

### 19.2 Navigation motion

- mobile menu uses around `.3s ease`
- hamburger bars transform to an X
- scroll state transitions background/shadow/backdrop

### 19.3 Link motion

`animated-link`:

- gold underline grows from width `0` to `100%`
- duration about `.5s`
- smooth easing

### 19.4 Card motion

PropertyCard:

- hover lift `-8px`
- increased shadow
- image scale `1.04`

BlogCard:

- hover lift roughly `-4px`
- image scale `1.05`

Generic Card:

- hover lift around `-6px`

### 19.5 Scroll/reveal motion

Homepage/global CSS contains:

- fade/slide-in patterns
- `slideInLeft`/`slideInRight`
- `riseIn`
- `fadeInUp`
- stagger delays around `0.1–0.6s`
- reveal transitions using opacity + translate transforms

### 19.6 Skeleton motion

Skeleton shimmer runs around `1.4s`.

### 19.7 Spinner motion

Spinner rotation is around `.7s`.

### 19.8 Reduced-motion support

`prefers-reduced-motion: reduce` is implemented in both global/home and component contexts.

The home page has a broad safety rule that reduces animation/transition durations to near-zero and disables smooth scrolling.

This is a positive accessibility/system pattern worth retaining.

### 19.9 Animation libraries

`framer-motion` is installed but no public source import was found.

Therefore the current visible motion system is primarily **CSS transitions/animations**, not Framer Motion.

### 19.10 Brand-defining vs decorative motion

**Brand-defining / worthwhile to retain**

- subtle card lift
- image zoom
- restrained nav/menu transitions
- gold underline growth
- fade/reveal

**Decorative**

- generic floating/subtle animations
- any unused animation library dependencies

Land Space should prioritize subtle motion and avoid turning the premium visual language into a highly animated interface.

---

## 20. PAGE-BY-PAGE VISUAL PATTERNS

### 20.1 Homepage

**Hierarchy**

1. Full-bleed hero
2. Search mode/input
3. Trust metrics
4. Introduction
5. Featured properties
6. Why choose us
7. Guaranteed-rent marketing band
8. Testimonials
9. Blog/news
10. Contact CTA

**Reusable components**

- Navigation
- Button
- PropertyCard
- Badge
- Skeleton
- TestimonialCarousel
- WhatsAppButton

**Visual strengths**

- strongest brand synthesis
- premium dark hero
- gold/navy CTA system
- property-first imagery
- clear section hierarchy

**Inconsistencies**

- homepage container is `92% / 1180px`, unlike generic `90% / 1200px`
- `/about` link mismatch with actual `/about-us` route
- local broad `44px` target rule conflicts with global `11px` declaration
- hero references zero-byte `hero-bg.jpg` in comments but uses `property.jpg`

### 20.2 Property listing/search page

**Hierarchy**

1. Compact photo hero
2. Search/count context
3. Sidebar/filter controls
4. Result/sort/view controls
5. Property grid/list
6. Pagination/empty/error states

**Strengths**

- practical utility structure
- clear separation of filters and results
- mobile filter bottom sheet is a strong responsive pattern
- loading/error/empty handling is explicit

**Inconsistencies**

- listing badges use bespoke colors/gradients outside the generic Badge token system
- breakpoint set differs from global system
- sidebar/listing dimensions are page-specific rather than tokenized

### 20.3 Property detail

**Hierarchy**

1. Breadcrumb
2. Hero/gallery
3. Title + badges/actions
4. Main detail content
5. Sidebar
6. Key information
7. Amenities/configurations/floor-plan
8. Inquiry/site-visit interaction

**Strengths**

- information-dense without being dashboard-like
- excellent use of section cards
- sticky sidebar at desktop
- clear conversion actions
- mobile stacking is deliberate

**Inconsistencies**

- section radius `8px` rather than the more common `12px`
- Rent/Commercial badge colors mirror listing cards, but geometry is not identical
- font token usage is not always as clean as the public heading/body pair

### 20.4 About

**Hierarchy**

1. Hero
2. Story
3. Who we are / image-text split
4. Mission/value cards
5. Services/offers
6. Brand tagline section
7. Testimonials
8. CTA

**Strengths**

- editorial composition
- strong serif-led hierarchy
- repeated gold section accents
- good use of white cards over a controlled page background

**Inconsistency/implementation issue**

The CSS uses `background: var(--background-gradient, url(...))`. Since `--background-gradient` is defined, the supplied property image fallback is not used. The implementation therefore does not match the apparent intention of a photographic fallback/parallax hero.

### 20.5 Contact

**Hierarchy**

1. Dark photographic hero
2. Form
3. Contact details
4. WhatsApp action
5. Google Maps embed

**Strengths**

- direct conversion path
- phone/email are real `tel:`/`mailto:` links
- contact details come from centralized `ORGANIZATION` values
- map is lazy-loaded

**Responsive**

Two-column flex becomes vertical at `768px`.

### 20.6 Blog index

**Hierarchy**

1. Image hero
2. breadcrumb/eyebrow/title/subtitle
3. search
4. category chips
5. article grid
6. pagination
7. empty/error handling

**Responsive**

- 3 columns
- 2 at `1024px`
- 1 at `640px`
- horizontal scrolling chips on small screens

**Strengths**

- editorial identity is still tied to the same navy/gold system
- clear content discovery controls

### 20.7 Blog detail

Uses a readable article/content hierarchy and shares the Blog visual language.

**Not determinable from supplied source:** a separate formal blog typography token system beyond the page/component CSS.

### 20.8 Our Team

Uses grouped portrait/card presentation, compact typography, and the same navy/gold accents. It is more people/editorial-oriented than property-oriented.

### 20.9 Guaranteed Rent

Uses a dedicated marketing funnel with:

- hero
- explanatory steps/cards
- benefits
- eligibility/checklist
- FAQ
- CTA

It belongs visually to the same brand but its content pattern is service-specific and should not become a Land Space layout template.

### 20.10 Authentication

Auth pages use:

- light neutral page
- centered white card
- `12px` radius
- medium shadow
- Playfair heading
- navy accent
- compact form spacing

This is a good utility reference, not a primary marketing reference.

### 20.11 Admin

Admin is structurally different:

- dark top bar
- light sidebar
- gray application canvas
- sidebar navigation
- internal dashboard density

It should not define the public Land Space visual personality.

---

## 21. COMPONENT INVENTORY

| Component | Source file | Used where | Design role | Reusability |
|---|---|---|---|---|
| NavigationBar | `src/components/NavigationBar.jsx/.css` | Global public shell | Brand navigation/header | High |
| Footer | `src/components/Footer.jsx/.css` | Global public shell | Brand footer | High |
| PropertyCard | `src/components/shared/PropertyCard.jsx/.css` | Home/listings/related property surfaces | Primary listing card | High; adapt for Land |
| Button | `src/components/ui/Button.jsx/.css` | Public forms/CTAs | Action system | Very high |
| Card | `src/components/ui/Card.jsx/.css` | Limited generic use | Generic elevated surface | Medium |
| Badge | `src/components/ui/Badge.jsx/.css` | Public/admin utility | Semantic pill system | High |
| Input | `src/components/ui/Input.jsx/.css` | Public forms | Input primitive | High |
| Textarea | `src/components/ui/Textarea.jsx/.css` | Public forms | Long-form field | High |
| Modal | `src/components/ui/Modal.jsx/.css` | Inquiry/site visit/etc. | Dialog shell | High |
| Pagination | `src/components/ui/Pagination.jsx/.css` | Listings/blog | Paging | High |
| Skeleton | `src/components/ui/Skeleton.jsx/.css` | Home/listings/blog | Loading state | High |
| Spinner | `src/components/ui/Spinner.jsx/.css` | Loading states | Progress indicator | High |
| StarRating | `src/components/ui/StarRating.jsx/.css` | Ratings/admin/testimonials | Rating input/display | Medium |
| PropertyFilters | `src/components/property/PropertyFilters.jsx/.css` | Properties | Search/filter architecture | High conceptually |
| AmenitiesGrid | `src/components/property/AmenitiesGrid.*` | Property detail | Feature matrix | Medium |
| ConfigurationsTable | `src/components/property/ConfigurationsTable.*` | Property detail | Structured property data | Low-to-medium; adapt data model |
| ContactForm | `src/components/forms/ContactForm.*` | Contact page | Lead form | High conceptually |
| InquiryForm | `src/components/forms/InquiryForm.*` | Property detail | Property enquiry | High conceptually |
| SiteVisitForm | `src/components/forms/SiteVisitForm.*` | Property detail | Visit scheduling | Medium |
| WhatsAppButton | `src/components/shared/WhatsAppButton.*` | Global/floating/inline | Lead CTA | High |
| TestimonialCarousel | `src/components/shared/TestimonialCarousel.*` | Home/About | Testimonial display | High |
| Legacy Testimonial | `src/components/shared/Testimonial.*` | Limited/dead-looking legacy surface | Older testimonial card | Low |
| BlogCard | `src/components/blog/BlogCard.*` | Blog | Editorial listing card | High |
| BlogReader | `src/components/blog/BlogReader.*` | Blog detail | Article presentation | Medium |
| ErrorBoundary | `src/components/shared/ErrorBoundary.*` | App routing | Resilience utility | Not brand-defining |
| AdminLayout | `src/components/layout/AdminLayout.*` | Admin | Internal shell | Do not use as public reference |

### Reusability assessment

The strongest genuinely reusable public primitives are:

- Button
- Badge
- Input
- Textarea
- Modal
- Pagination
- Skeleton
- Spinner
- NavigationBar
- Footer
- WhatsAppButton

The PropertyCard is highly reusable **conceptually**, but its content model is specific to built property.

---

## 22. DESIGN TOKENS INVENTORY

### 22.1 Formal color tokens

| Token | Current value |
|---|---|
| `--primary-color` | `#02066F` |
| `--secondary-color` | `#DABA52` |
| `--accent-color` | `#DABA52` |
| `--primary-dark` | `#01043D` |
| `--bg-dark` | `#001F3F` |
| `--bg-nav` | `#001F3F` |
| `--background-color` | `#FFFFFF` |
| `--white` | `#FFFFFF` |
| `--off-white` | `#F9FAFB` |
| `--neutral-light` | `#F0F0F0` |
| `--dark-color` | `#333333` |
| `--text-light` | `#495057` |
| `--accent-hover` | `#C9A83F` |
| `--accent-light` | `#E0C76A` |
| `--accent-dark` | `#A17D2D` |

### 22.2 Formal typography tokens

```text
--heading-font: Playfair Display
--body-font: Montserrat
--font-heading: Playfair Display
--font-body: Inter
--font-primary: Poppins
--font-secondary: Georgia
```

**Normalization recommendation:** public Land Space should use only Playfair + Montserrat unless a future design decision explicitly introduces another type system.

### 22.3 Formal spacing tokens

See Section 6.

### 22.4 Formal radius tokens

See Section 7.

### 22.5 Formal shadow tokens

See Section 7.

### 22.6 Container tokens

- `--max-width: 1200px`
- `--container-width: 1280px`

Actual public implementations use both 1200 and 1280 ceilings.

### 22.7 Breakpoints

No formal breakpoint token object/config is declared.

**Actual recurring media queries:**
`480`, `576`, `640`, `720`, `768`, `880`, `900`, `992`, `1024`, `1200`, with nearby `481`, `769`, `1025`.

### 22.8 Transition tokens

- fast `.2s`
- medium `.3s`
- slow `.5s`
- speed `.3s`
- all `.25s ease`
- custom `cubic-bezier(.22,1,.36,1)`

### 22.9 Admin tokens

The token file contains a separate admin palette:

- primary `#1A5F9C`
- primary hover `#0F4A7D`
- secondary `#E2A951`
- secondary hover `#C99342`
- success `#2E8B57`
- warning `#E67E22`
- danger `#C0392B`
- dark `#2C3E50`
- gray `#7F8C8D`
- light gray `#ECF0F1`
- background `#F8FAFC`

These are internal application colors, not the strongest public UrbanEdge brand reference.

### 22.10 Recommended normalization of existing patterns

```text
COLOR
  primary-navy      #02066F
  nav-navy          #001F3F
  deep-navy         #01043D
  brand-gold        #DABA52
  cta-gold-dark     #B8860B
  cta-gold-light    #CD950C
  surface-white     #FFFFFF
  surface-soft      #F9FAFB
  surface-neutral   #F0F0F0
  text-primary      #333333
  text-muted        #495057

TYPE
  heading           Playfair Display / 700
  body-ui           Montserrat / 300, 400, 600
  body-size         clamp(1rem, 1.5vw, 1.125rem)

SPACE
  xxs  6px
  xs   5–10px
  sm   10–20px
  md   15–30px
  lg   20–40px
  xl   30–60px

RADIUS
  sm       4px
  md       6px
  lg       8px
  card     12px
  property 24px
  button   30px
  pill     999px

SHADOW
  sm  0 1px 3px rgba(2,6,111,.07), 0 1px 2px rgba(2,6,111,.05)
  md  0 8px 20px rgba(2,6,111,.10)
  lg  0 16px 32px rgba(2,6,111,.12)

CONTAINER
  standard 1200px
  wide     1280px only where detail/data density needs it

BREAKPOINTS
  480 / 768 / 992 / 1200 as primary
  900 or 1024 only for content-driven transitions

MOTION
  fast   .2s
  medium .3s
  slow   .5s
  ease   cubic-bezier(.22,1,.36,1)
```

These are **recommended normalization of current patterns**, not claims that the current project already has these exact normalized tokens.

---

## 23. VISUAL CONSISTENCY AUDIT

### High

#### H1 — Competing public typography tokens

**Evidence: Confirmed from code**

`tokens.css` contains Playfair, Montserrat, Inter, Poppins, Georgia and Segoe UI-related tokens.

**Why it matters:** another developer could accidentally make the public site feel like a different product while still believing they are using the official token file.

**Action for Land Space:** lock the public family to Playfair + Montserrat.

#### H2 — Logo implementation mismatch

**Evidence: Confirmed from code**

NavigationBar uses a text lockup; Homepage/About use the image logo; Footer has no logo.

**Why it matters:** brand mark can change visually between surfaces.

**Action for Land Space:** establish one canonical logo asset implementation.

#### H3 — Breakpoint fragmentation

**Evidence: Confirmed from code**

Numerous values from `480px` through `1200px` exist.

**Why it matters:** responsive behavior may feel different across product areas.

**Action for Land Space:** centralize the common breakpoints.

#### H4 — Formal card token vs flagship card

**Evidence: Confirmed from code**

Formal `--card-radius` is `12px`, but PropertyCard uses `24px`.

**Why it matters:** developers may not know which is the intended “UrbanEdge card”.

**Action:** name the higher-emphasis property/listing card pattern explicitly in Land Space.

### Medium

#### M1 — Mixed icon libraries

Lucide and React Icons coexist.

#### M2 — Multiple bespoke buttons/cards

Shared primitives exist, but page-specific UI often bypasses them.

#### M3 — Global and local footer styling overlap

Bare `footer` is styled in `global.css` and `.footer` separately in `Footer.css`.

#### M4 — Homepage container differs from generic container

`92% / 1180px` vs `90% / 1200px`.

#### M5 — Home/global touch target declarations conflict

- `global.css`: `11px`
- `HomePage.css`: `44px`

The source comment calls the global value an accessibility guarantee, but the declared minimum itself is only `11px`.

#### M6 — Asset duplication/underuse

Duplicate logo JPGs, zero-byte `hero-bg.jpg`, and a dedicated `og-image.svg` that is not obviously used as the primary OG image.

### Low

#### L1 — Stale React starter `src/logo.svg`

Not brand-relevant and likely dead.

#### L2 — README references older build assumptions

Current project is Vite, while README text is older boilerplate.

#### L3 — Installed but unused motion dependency

`framer-motion` is present but no source imports were found.

#### L4 — Hard-coded footer year

`© 2025` is not tokenized/dynamic.

#### L5 — Legacy testimonial implementation

A newer TestimonialCarousel exists alongside an older Testimonial component/style.

### Non-issues / intentional variation

The following should **not** automatically be “fixed” for Land Space:

- different hero heights by page
- stronger PropertyCard radius
- different category colors for Rent/Commercial
- sticky detail sidebar
- blog horizontal-scroll chips
- mobile bottom-sheet filters

These are useful content-specific patterns, not merely inconsistency.

---

## 24. WHAT DEFINES THE URBANEDGE BRAND

Based strictly on repeated public implementation patterns, the strongest UrbanEdge characteristics are:

1. **Navy as the authority/base color**
   - `#02066F` and `#001F3F`

2. **Warm metallic gold as the premium accent**
   - `#DABA52`
   - deeper gold gradients for high-emphasis CTAs

3. **Playfair Display for premium headings**

4. **Montserrat for practical UI/body text**

5. **Photography with dark navy overlays**
   - especially in hero areas

6. **White elevated cards on soft neutral backgrounds**

7. **Rounded action/badge language**
   - `30px` buttons
   - `999px` status pills

8. **Short gold section underline motif**
   - visually reinforces section hierarchy

9. **Property-first information hierarchy**
   - image → type/status → location → metrics → price → action

10. **Subtle, restrained motion**
    - lift, zoom, fade, not excessive animated spectacle

### Strongest family rule

The combination is more important than any single value:

> **Navy authority + warm gold premium accent + Playfair/Montserrat + photographic storytelling + rounded elevated white surfaces + compact pill metadata + restrained motion.**

---

## 25. WHAT URBANEDGE LAND SPACE SHOULD REUSE

# Recommended Brand Continuity for UrbanEdge Land Space

## REUSE DIRECTLY / CLOSELY

### 1. Core navy/gold relationship

Use the existing public palette as the main family bridge.

Preserve:

- `#02066F`
- `#001F3F`
- `#DABA52`
- the existing darker gold CTA family

Do not create an unrelated “green land brand” or another dominant palette merely because the product concerns agriculture.

### 2. Typography

Use:

- Playfair Display for headings
- Montserrat for body/UI

This is one of the most visible continuity cues.

### 3. Container and page rhythm

Start from:

- `90%` content width
- `1200px` main ceiling
- tokenized spacing
- larger section spacing
- controlled maximum text widths

A `1280px` wide shell can be reserved for data-heavy detail views, matching the existing detail page pattern.

### 4. Button language

Retain:

- gold primary CTA
- navy secondary CTA
- navy outline
- pill radius around `30px`

### 5. Section heading pattern

Preserve:

- Playfair heading
- navy text on light content
- short gold underline

### 6. Navigation feel

Retain:

- sticky navy top bar
- gold active/CTA state
- compact desktop navigation
- hamburger/floating mobile navigation

### 7. Footer identity

Retain:

- dark navy background
- gold headings
- white supporting text
- compact multi-column desktop structure
- stacked mobile version

### 8. General surface language

Retain:

- white elevated cards
- soft neutral page backgrounds
- subtle borders
- controlled shadows
- rounded corners

---

## REUSE CONCEPTUALLY BUT ADAPT

### 1. PropertyCard → Land Listing Card

Keep the visual hierarchy:

```text
Image
  ↓
Status / type pills
  ↓
Land title
  ↓
Location
  ↓
Key metadata
  ↓
Price / POR
  ↓
Primary enquiry/contact action
```

Replace residential fields with the land information model.

The task-provided target examples include:

- area
- land type
- transaction
- district/taluka/village
- road information
- price/POR
- verification

These are **future Land Space requirements**, not fields established by the current Living Space source.

### 2. Property search → Land search

Retain the card/search relationship, but adapt filtering around land-specific decision-making.

Potential categories derived from the requested product scope:

- Agricultural
- NA
- Industrial
- Buy
- Sell
- Rent
- Lease

Then layer in practical land search dimensions appropriate to the future product.

### 3. Property detail → Land detail

Reuse the structure:

- hero/gallery
- title
- badges
- key details
- action block
- detailed sections
- related/listing information

Adapt the information model toward:

- land type
- area
- district/taluka/village
- road access/frontage
- zoning/NA information
- price/POR
- verification/legal information
- enquiry/contact

### 4. Search/filter experience

The existing PropertyFilters architecture is a good conceptual model:

- compact desktop sidebar
- mobile trigger
- bottom-sheet filter experience
- Apply controls
- visible active state

Do not copy residential filter categories.

### 5. Gallery

Retain image-led visual hierarchy, but land imagery may benefit from:

- wider panorama
- aerial context
- road/access views
- boundary/context photography

The existing gallery treatment can remain.

### 6. CTA blocks

Retain the conversion pattern:

- strong navy/gold action
- optional WhatsApp/contact support
- clear enquiry flow

Avoid making every Land Space section a CTA-heavy marketing banner.

---

## 26. WHAT LAND SPACE SHOULD NOT REUSE

# Patterns Land Space Should NOT Copy Directly

## 26.1 Residential-specific information architecture

Do not inherit:

- Bedrooms/BHK
- Bathrooms
- room-oriented amenities
- flat floor/configuration logic
- apartment-specific labels

These belong to Living Space.

## 26.2 Built-property badge semantics

Do not blindly copy:

- Residential
- Commercial
- For Rent
- For Sale
- RERA

The same component geometry can remain, but the semantics must match land transactions and verification.

## 26.3 Guaranteed-rent-specific marketing structure

The Guaranteed Rent page is a service-specific sales funnel.

Do not turn Land Space into a copy of that page simply because it is already polished.

## 26.4 Text-only logo implementation

Do not inherit the NavigationBar text lockup as a new hard rule.

Land Space should establish a canonical logo asset usage instead.

## 26.5 Multiple font systems

Do not carry forward:

- Inter
- Poppins
- Segoe UI
- arbitrary Georgia fallbacks

as interchangeable public design choices.

## 26.6 Mixed icon library without a reason

Do not automatically reproduce both Lucide and React Icons everywhere.

Pick one primary utility icon family for Land Space and retain branded external icons only where needed.

## 26.7 Current implementation debt

Do not reproduce:

- the broken `/about` route reference
- zero-byte hero placeholder
- duplicate logo assets
- duplicated/global + local footer styling
- large collection of ad hoc breakpoints
- conflicting touch-target values
- unused starter React logo
- stale README/build assumptions

## 26.8 Overly specific residential card metadata

The PropertyCard is visually valuable but some fields are not.

Keep:

- image-first design
- pill/status treatment
- title/location/meta/price/action structure
- elevated surface

Replace the data model.

## 26.9 RERA as a generic verification substitute

Do not assume that all land listings have the same regulatory/verification framework as residential property.

The UI can support a verification badge, but its criteria must be defined by the Land Space product.

---

## 27. LAND SPACE DESIGN DIRECTION

Using only the strongest current UrbanEdge conclusions:

### Preserve

- navy/gold identity
- Playfair/Montserrat typography
- photography-led presentation
- premium section hierarchy
- white elevated cards
- pill metadata
- gold underlines
- restrained motion
- sticky/navy navigation
- strong conversion CTA language

### Modernize

- unify the logo implementation
- normalize breakpoints
- consolidate public font tokens
- normalize card/button/badge primitives
- remove dead assets and duplicate logo files
- keep a single public design-token source

### Adapt

- property cards into land listing cards
- property filters into land filters
- property details into land verification/location/access details
- residential metadata into land metadata
- category badges into land-type/transaction/verification semantics

### Remove

- residential-specific data structures
- apartment-only UI
- implementation debt that is not part of the brand
- unnecessary token aliases or duplicate font systems
- legacy/dead code patterns

### Target feeling

The correct conceptual target is:

> **Same UrbanEdge company, specialist land product.**

It should be immediately recognizable as the same organization without feeling like a copy of a residential property catalog.

---

## 28. FINAL IMPLEMENTATION HANDOFF

# URBANEDGE LAND SPACE — DESIGN HANDOFF

## Must Preserve

1. **Brand palette**
   - Primary navy `#02066F`
   - Navigation/deep navy `#001F3F`
   - Gold `#DABA52`
   - Existing dark-gold CTA gradient family

2. **Typography**
   - Playfair Display for headings
   - Montserrat for body/UI

3. **Surface language**
   - white cards
   - soft neutral backgrounds
   - controlled shadows
   - rounded corners

4. **CTA language**
   - gold primary
   - navy secondary
   - pill buttons around `30px`

5. **Section pattern**
   - Playfair heading
   - navy text
   - short gold underline

6. **Image treatment**
   - cover imagery
   - navy overlays in hero sections
   - rounded clipping
   - subtle hover zoom
   - lazy loading where appropriate

7. **Responsive philosophy**
   - navigation switches around `768px`
   - content stacks at data/content-driven widths
   - mobile-first controls remain compact and usable

8. **Motion**
   - subtle lift/zoom/fade
   - approximately `.2 / .3 / .5s` transition vocabulary
   - respect reduced motion

## Should Adapt

### Listing cards

Adapt PropertyCard into a land-specific component with:

- land image
- land type
- transaction type
- title
- district/taluka/village
- area
- road/access
- price/POR
- verification/status
- contact/enquiry CTA

### Search/filter

Use the current filter architecture as the UX reference, but replace built-property filters with land-specific dimensions.

### Detail pages

Keep:

- gallery
- title/actions
- key-detail grid
- content sections
- sticky desktop action/sidebar where useful
- mobile stacking

Replace:

- BHK
- room metrics
- apartment configurations

with land-specific facts.

### Badges

Reuse the pill geometry and compact typography.

Define semantics first for:

- Agricultural
- NA
- Industrial
- Buy
- Sell
- Rent
- Lease
- Verified

Do not blindly reuse the existing Rent/Commercial colors as if they were core UrbanEdge brand colors.

## Must Avoid

- residential-only information architecture
- copied Guaranteed Rent layout
- multiple public font families
- fragmented breakpoint additions
- duplicate logo implementations
- React starter logo assets
- zero-byte media placeholders
- dead legacy visual primitives
- technical debt that exists only because the old codebase accumulated it

## Canonical Design Tokens

### Colors

```text
--ue-primary:         #02066F
--ue-nav:             #001F3F
--ue-deep:            #01043D
--ue-gold:            #DABA52
--ue-cta-gold-dark:   #B8860B
--ue-cta-gold-light:  #CD950C
--ue-surface:         #FFFFFF
--ue-surface-soft:    #F9FAFB
--ue-surface-neutral: #F0F0F0
--ue-text:            #333333
--ue-text-muted:      #495057
```

### Typography

```text
Heading: Playfair Display
Body/UI: Montserrat

Heading weight: 700
UI/body weights evidenced: 300 / 400 / 600
Body size: clamp(1rem, 1.5vw, 1.125rem)
```

### Spacing

```text
xxs: 6px
xs:  5–10px
sm:  10–20px
md:  15–30px
lg:  20–40px
xl:  30–60px
base: 20px
```

### Radius

```text
sm:       4px
md:       6px
lg:       8px
card:     12px
property: 24px
button:   30px
pill:     999px
```

### Shadow

```text
sm:
  0 1px 3px rgba(2,6,111,.07),
  0 1px 2px rgba(2,6,111,.05)

md:
  0 8px 20px rgba(2,6,111,.10)

lg:
  0 16px 32px rgba(2,6,111,.12)
```

### Container

```text
standard: 1200px
wide:     1280px for dense detail layouts where justified
```

### Breakpoints

```text
480px
768px
992px
1200px
```

Treat `900px` and `1024px` as optional content-driven breakpoints, not defaults.

## Critical Source Files

A future coding agent reviewing the Living Space project for design clarification should start with:

### Core tokens / global

- `src/styles/tokens.css`
- `src/styles/typography.css`
- `src/styles/global.css`
- `src/App.css`
- `src/main.jsx`

### Global brand chrome

- `src/components/NavigationBar.jsx`
- `src/components/NavigationBar.css`
- `src/components/Footer.jsx`
- `src/components/Footer.css`

### Flagship listing/card system

- `src/components/shared/PropertyCard.jsx`
- `src/components/shared/PropertyCard.css`
- `src/components/property/PropertyFilters.jsx`
- `src/components/property/PropertyFilters.css`

### Core UI primitives

- `src/components/ui/Button.jsx`
- `src/components/ui/Button.css`
- `src/components/ui/Card.jsx`
- `src/components/ui/Card.css`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Badge.css`
- `src/components/ui/Input.jsx`
- `src/components/ui/Input.css`
- `src/components/ui/Textarea.jsx`
- `src/components/ui/Textarea.css`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Modal.css`
- `src/components/ui/Pagination.jsx`
- `src/components/ui/Pagination.css`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/Skeleton.css`
- `src/components/ui/Spinner.jsx`
- `src/components/ui/Spinner.css`

### Page references

- `src/pages/HomePage.jsx`
- `src/pages/HomePage.css`
- `src/pages/Properties.jsx`
- `src/pages/Properties.css`
- `src/pages/PropertyDetailPage.jsx`
- `src/pages/PropertyDetailPage.css`
- `src/pages/AboutUs.jsx`
- `src/pages/AboutUs.css`
- `src/pages/ContactUs.jsx`
- `src/pages/ContactUs.css`
- `src/pages/Blog.jsx`
- `src/pages/Blog.css`
- `src/pages/BlogDetail.jsx`
- `src/pages/BlogDetail.css`

### Forms / conversion

- `src/components/forms/ContactForm.*`
- `src/components/forms/InquiryForm.*`
- `src/components/forms/SiteVisitForm.*`
- `src/components/shared/WhatsAppButton.*`

### Asset references

- `public/UrbanEdge_Living_Space_Logo_HD.jpg`
- `public/uelslogo.jpg`
- `public/favicon.ico`
- `public/logo192.png`
- `public/logo512.png`
- `public/og-image.svg`
- `src/assets/UrbanEdge_Living_Space_Logo_HD.jpg`
- `src/assets/property.jpg`
- `src/assets/property_hero_image.jpg`
- `src/assets/pexels-cmoon-12558848.jpg`
- `src/assets/whyChooseUs.jpg`

---

## 29. REPORT QUALITY / EVIDENCE NOTES

### Source completeness

The supplied project was inspected systematically rather than using only the homepage.

The report deliberately separates:

- formal token declarations
- repeated component patterns
- page-specific implementation
- internal/admin patterns
- implementation debt

### Rendered-site limitation

The supplied live URL did not yield sufficiently extractable rendered content for a reliable visual cross-check in this environment.

Therefore:

**No claim in this report depends on an unverified visual assumption about the live site.**

### Items that cannot be established from the source

**Not determinable from supplied source**

- Official brand-guideline ownership of specific color tokens
- Formal corporate minimum logo clear-space measurement
- Official logo minimum pixel dimensions
- An external brand manual not contained in the repository
- Whether every currently present asset is intentionally deployed in production
- Exact user-perceived visual result where CSS/runtime behavior could differ from static inspection without a usable rendered page

### Source-vs-recommendation distinction

The “canonical” values in this report are recommended normalization of the strongest existing UrbanEdge patterns. They are not claims that the current repository already behaves as a perfectly normalized design system.

---

## 30. OUTPUT

Requested analysis artifact:

`URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`

This document is intended to be supplied to a separate coding agent as the design-system and brand-reference handoff for **UrbanEdge Land Space**.

The existing Living Space source project was used as an analysis source only; no redesign or Land Space implementation is included here.

**End of report.**
