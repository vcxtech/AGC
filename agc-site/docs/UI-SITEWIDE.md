# Sitewide UI (editorial / human-development)

Shared patterns so inner pages match the homepage—not generic “AI template.”

## Layout primitives (`src/lib/page-layout.ts`)

| Export | Use |
|--------|-----|
| `PAGE_GUTTER_CLASS` | Horizontal padding for header, listing pages, article detail (`px-6 … 2xl:px-24`) |
| `PAGE_LISTING_SECTION_CLASS` | White listing band below `PageHero` |
| `PAGE_LISTING_INNER_CLASS` | Centered container with gutters — used by `ListingPageSection` |
| `ARTICLE_DETAIL_BODY_CLASS` | News/publications detail body container |
| `ARTICLE_PROSE_CLASS` | Shared Tailwind Typography classes for article HTML bodies |
| `MOBILE_BOTTOM_NAV_CLEARANCE` | Bottom padding when fixed mobile nav is present |

## React components

| Component | Use |
|-----------|-----|
| `ListingPageSection` | News, publications, events listing pages |
| `EmptyListingCard` | Unified empty state + contact CTA |
| `ArticleDetailShell` | Hero image + body wrapper for news/publications detail |
| `ArticleDownloadSection` | PDF / document download cards (uses `Button` primary) |
| `Button` | Default `rounded-none`; primary uses `accent-600` |

## CSS utilities (`globals.css`)

| Class | Use |
|-------|-----|
| `page-section-paper` | Cream panel `#fffcf7` — optional warm sections |
| `page-section-warm` | Soft warm wash + border |
| `page-prose` / `page-prose-tight` | Body copy (stone, comfortable line height) |
| `page-heading` | Fraunces-style section titles |
| `page-card` | Bordered card on paper |

Listing and detail pages use **white** (`bg-white`) bands by default; paper/warm utilities remain for legal, errors, and optional editorial bands.

## Brand surfaces (logo teal `#2e728c` → `accent-*`)

- **Deep band:** `bg-accent-900` (`#0e1f26`) + cream text + **teal** micro-labels (`text-accent-300`)
- **Hero overlays:** `HeroDarkScrim` on image heroes; gradient heroes use stone/accent stops
- **CTAs:** `Button` primary (`accent-600`); avoid raw `accent-700` anchors except where legacy cards use inline styles

## CMS slug → public URL

| Admin slug | Public route |
|------------|--------------|
| `programs` | `/our-work/programs` |
| `projects` | `/our-work/projects` |
| `research` | `/our-work/research` |
| `training` | `/our-work/training` |
| `advisory` | `/our-work/advisory` |
| `our-work-partnership` | `/our-work/partnership` |
| `about` | `/about` (columns: intro, description, mission; JSON: delivery points, team) |

Legacy `our-work-*` slugs are renamed to canonical slugs on admin load via `ensure-missing-page-rows.ts`.

## CMS rich text (TipTap)

Editors use **visual rich text**, not JSON, for long-form copy. Raw JSON is collapsed under **Advanced: raw JSON (optional)** on Page Content forms.

| Admin area | Rich text fields |
|------------|------------------|
| **News** | Short description (excerpt), full article body |
| **Publications** | Excerpt / summary |
| **Events** | Full description |
| **Team** | Bio |
| **About Settings** | Lead copy, mission, strategic objectives, delivery card bodies, partnerships |
| **Page Content** | Page intro, descriptions, support body (per-slug helpers) |

Components: `CmsRichTextField` (admin), `RichTextContent` (public, sanitized). Legacy plain text is auto-wrapped on display.

## When adding a page

1. Use `PageHero` (`compact` / `minimal` / default).
2. Listing content: wrap in `ListingPageSection`.
3. Article detail: use `ArticleDetailShell` + `ARTICLE_PROSE_CLASS`.
4. Empty lists: `EmptyListingCard` with site settings email.
5. Prefer `page-card` over raw `bg-white border-slate-200`.
6. Section labels: `text-xs font-semibold uppercase tracking-wider text-black` or `text-accent-800`.
