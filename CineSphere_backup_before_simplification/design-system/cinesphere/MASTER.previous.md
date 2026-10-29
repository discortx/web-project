# CineSphere Design System (Master)

> Source of truth for the whole site. Page files in `pages/` override only where they say so.
> Generated with the UI/UX Pro Max skill (`.claude/skills/ui-ux-pro-max/scripts/search.py`, query:
> "cinema movie discovery editorial film festival dark cinematic premium", persisted 2026-10-29), then
> **validated and refined** against the skill's own accessibility rules. Raw skill output was not adopted
> blindly; see "What the skill said, and what we did with it" below.

## 1. Concept

**An independent film journal meets a practical cinema guide.** A printed film programme on graphite stock.
Dark and quiet; imagery and typography carry the drama. Not a streaming clone, not a card dashboard.

- Style (skill, `style` + `product` domains): **Dark Mode (OLED) + Editorial Grid / Magazine**. Asymmetric grid, large imagery, `figure`/`figcaption`, hairline dividers.
- Page pattern: hero-led, then distinct section compositions. The skill's "Horizontal Scroll Journey" is used only where it helps (the Now Showing poster rail).
- **Rejected by the skill's own ratings:** Parallax Storytelling (Performance: Poor, Accessibility: Poor).

## 2. Colour (semantic roles, with measured contrast)

| Role | Token | Hex | Notes |
|---|---|---|---|
| Page ground | `--bg` | `#101114` | |
| Elevated panel | `--bg-2` | `#18191E` | spotlight panel, inputs, dialog |
| Surface | `--surface` | `#202127` | skeletons, hover fills |
| Text | `--text` | `#F1F0EB` | 16.6:1 on bg |
| Secondary text | `--text-2` | `#AAAAB2` | 8.2:1 on bg, 7.0:1 on surface |
| Muted text | `--text-3` | `#8C8C96` | **refined from `#85858F`** (failed 4.5:1 on `--surface`: 4.39). Now 5.7 / 5.3 / 4.8 on bg / panel / surface |
| Accent | `--accent` | `#C72C41` | fill, line, outline only. Off-white text on it is 4.76:1 |
| Accent hover | `--accent-hover` | `#A9233A` | |
| Decorative hairline | `--line` | `#34343B` | dividers only (1.5:1, deliberately quiet) |
| Control outline | `--control` | `#6B6B75` | **added**: form controls, chips, icon buttons. 3.6 / 3.3 / 3.1 on bg / panel / surface (needs 3:1 for UI components) |

Rules:
- **Crimson is never body-size text** (3.47:1 on bg). It marks primary actions, the active nav item, selected filters, and small highlights.
- Status is never communicated by colour alone (selected chips also change fill and carry `aria-pressed`; the active day also changes fill).
- Gradients only where they protect text legibility over imagery (hero and film-page scrims).

## 3. Typography (skill `typography` result "Classic Elegant")

- Display: **Playfair Display** (500, 600; italic 400/500 for emphasis). Headlines, film titles, large numerals.
- Interface: **Inter** (400, 500, 600). Navigation, body, buttons, search, filters, metadata, showtimes.
- Fluid scale with `clamp()`: `--fs-display` 2.9-6.4rem, `--fs-h1` 2.6-5rem, `--fs-h2` 2-3.5rem, `--fs-h3` 1.25-1.625rem, `--fs-lead` 1-1.1875rem, body 1rem (never below 16px), small 0.875rem, meta 0.75rem (uppercase labels only).
- Body line-height 1.6; prose width capped at 68ch (skill: 65-75).
- Serif is used selectively: never for buttons, inputs, nav, or small metadata.
- Fallbacks: Georgia / Times for display, system-ui for body. `font-display: swap`.

## 4. Spacing, grid, shape, depth

- Spacing scale `--space-1..9` = 4, 8, 12, 16, 24, 32, 48, 72, 112px.
- Container `--container: 1200px` (skill: one consistent max-width), gutter `clamp(1.25rem, 4vw, 3rem)`, 12-column grid for editorial sections.
- Corners: `--radius: 2px` (print-like, square). No pill buttons, no heavy rounding.
- Depth by hairlines and tone, not shadows. The only shadow is a soft lift under the large poster on the film page.
- Z-index scale: `--z-content 10`, `--z-nav-panel 40`, `--z-header 50`, `--z-skip 100` (dialogs use the browser top layer).

## 5. Imagery

- Real posters (2:3) and backdrops (16:9) from TMDB when synced; sized with `srcset`/`sizes`, `width`/`height` set, below-the-fold images lazy, the hero image `fetchpriority="high"` and never lazy.
- Until then: composed SVG key art (`js/keyart.js`) per film, with a very light static film grain (skill: "Vintage Analog / Retro Film" effect, used on artwork only). It carries no text, is never called an official poster, and the hero says so.
- Failed images fall back to key art; layout never shifts (aspect ratios reserved).

## 6. Components

- **Buttons:** primary = crimson fill, off-white text, 0.1em tracked caps; ghost = transparent with a 40% off-white outline. Min height 48px (44px for `--small`). Disabled = 45% opacity, no pointer events.
- **Inputs:** 48px high, `--bg-2` fill, `--control` outline, visible label above (never placeholder-only), `:focus-visible` 2px off-white outline.
- **Chips:** `aria-pressed` toggles; selected = crimson fill.
- **Poster item:** poster is the object (no card chrome); title (Inter 600), year and first genre beneath; rating only if real.
- **Still card (upcoming):** date leads (Playfair), then 16:9 still, then title.
- **Showtime panel:** day strip + grouped stubs; always carries the "Demonstration schedule" note.
- **States:** skeleton (shimmer) while loading; empty = message + action (+ suggestions on Discover); error = message + working Retry that disables while loading.
- **Touch:** interactive targets are at least 44x44px on small and coarse-pointer screens, with at least 8px between neighbours.

## 7. Motion (skill `ux` domain)

- Micro-interactions 150-250ms, image zoom and reveals at most 450ms (skill: never over 500ms for UI), ease-out on entry. No linear UI motion.
- Animate only `transform` and `opacity`. **At most one or two things per view:** section headings and the editor's pick reveal on scroll; posters only zoom on hover (pointer devices only). No looping animation.
- `prefers-reduced-motion`: all transitions collapse, reveals are never applied (content is simply visible).
- Content is never hidden until JavaScript confirms it controls it, so a failed script cannot leave a blank page.

## 8. Anti-patterns (from the skill, with how CineSphere answers them)

- **"Poor booking UX"**: CineSphere does not take bookings. Every showtime block says so plainly and links to the cinema's official website, the only real destination.
- **"No trailers"**: a Watch trailer button appears whenever TMDB supplies a trailer key; otherwise a clearly labelled "Find trailer on YouTube" search link is offered (never a fake player).
- No emoji icons (inline SVG only), no layout-shifting hovers, no invisible focus, no instant state changes, no low-contrast text, `cursor: pointer` on every clickable control.

## 9. What the skill said, and what we did with it

| Skill output | Decision |
|---|---|
| Typography: Playfair Display + Inter | **Adopted** as generated. |
| Style: Dark Mode (OLED) + Editorial Grid / Magazine | **Adopted**, on charcoal `#101114` as the brief specifies. |
| Palette: indigo `#1E1B4B` + gold `#CA8A04`, bg `#0F0F23` | **Not adopted.** The brief asks for charcoal/off-white/crimson, and the skill's own gold button spec (white on `#CA8A04`) measures 2.94:1 and fails its own 4.5:1 rule. Its streaming red `#E11D48` with off-white text is 4.12:1, also failing. The brief's `#C72C41` passes at 4.76:1. |
| Component specs (white modal, `#E2E8F0` input border, card = page background) | **Not adopted**: written for a light UI. Replaced by the specs above. |
| "Page Pattern" block | **Discarded**: three raw CSV rows (Bento Grid, 3D Configurator, AI-Driven Landing) leaked into the file through an unescaped comma in the skill's data. |
| Page overrides (discover: "Become a host/seller", "Trust/Safety") | **Only the applicable lines kept** (no-results suggestions, live search, WebP/sizing, active nav). |
| Persist location | The skill writes to `design-system/<project-slug>/MASTER.md`, not `design-system/MASTER.md` as its docs say. |

## 10. How the five required styles combine (styles.csv entries read: nos. 7, 8, 16, 19, 27)

| Style (styles.csv) | Role in CineSphere |
|---|---|
| Dark Mode (OLED), no. 7 | Foundation: layered charcoal `--bg` / `--bg-2` / `--surface` instead of pure black; no neon, no glow. |
| Soft UI Evolution, no. 19 | **Selective only**: search field (recessed `--shadow-inset`), selects, genre chips, header tool buttons, rail arrows (raised `--shadow-raised`, `--radius-soft: 8px`). Solid `--control` outlines stay, so state never relies on shadow. Posters and editorial sections remain flat. |
| Storytelling-Driven, no. 27 | Homepage composition: cover hero, then numbered chapters (No. 01 to 03) with a different layout each (poster rail, staggered stills, layered editor's pick, ruled cinema list). Reveals via IntersectionObserver; the parallax variant (no. 49) is rejected as Poor for accessibility and performance. |
| Accessible & Ethical, no. 8 | 2px focus ring, skip link, 44px targets, `aria-pressed` chips, labelled controls, reduced motion, honest demo-data labels. |
| Micro-interactions, no. 16 | `:active` press (1px) on buttons/chips, 150-250ms transitions, hover effects only under `@media (hover: hover)`. The skill suggests 50-100ms; 150ms is the floor here so state changes stay legible. |
