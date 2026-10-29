# CineSphere Design System (Master): Cinematic Neumorphism

> Produced with the UI/UX Pro Max skill (`.claude/skills/ui-ux-pro-max/scripts/search.py`):
> `--design-system --persist -p "CineSphere" --page home` for "cinema movie discovery neumorphism dark soft ui cinematic editorial",
> plus `--domain style`, `--domain ux` and `--domain typography` searches. Raw generator output is kept in
> `MASTER.generated.md`; it was **validated and corrected** as described below. The earlier editorial-flat system is in `MASTER.previous.md`.
> `pages/*.md` are from that earlier system; where they disagree with this file (shape, shadow, colour), this file wins.

## 1. Concept

A premium cinema lounge as a tactile object: one charcoal material, sculpted with a single light source (top-left).
Film artwork and Playfair headlines carry the drama; neumorphism carries the *interface*.

## 2. What the skill said, and what we did with it

| Skill output | Decision |
|---|---|
| **Neumorphism** style entry: "Accessibility: Low contrast", radius 12-16px, multi-layer light/dark shadows, 150ms press | **Adopted** (12px controls, paired shadows, 150ms press) with the contrast problem corrected below. |
| **Soft UI Evolution** entry: "WCAG AA+", "clearer than neumorphism", focus 2-3px | **Adopted as the accessibility layer**: quiet edges, 3px focus rings, 3:1 outlines on inputs, state never by shadow alone. |
| Generator palette: indigo `#1E1B4B` + gold `#CA8A04`, bg `#0F0F23` | **Rejected.** Contradicts the brief and the single-material rule of neumorphism. Its gold button also fails 4.5:1. |
| Generator typography: Varela Round / Nunito Sans | **Rejected** for the editorial intent. The `typography` search returned **Classic Elegant (Playfair Display + Inter)**, adopted. |
| Generator pattern "Horizontal Scroll Journey" | Used only for the Now Showing rail. |
| Generator style "Dark Mode (OLED)", pure black | Adopted as low-emission dark, **not** pure black: neumorphism needs a mid-dark surface so light shadows read. |
| Anti-patterns "Poor booking UX, No trailers" | No fake booking anywhere; trailer links are real YouTube searches, labelled as such. |

## 3. Colour (measured contrast)

| Role | Token | Value | Contrast on bg / raised / inset |
|---|---|---|---|
| Page | `--bg` | `#202126` | |
| Raised surface | `--bg-2` | `#26272D` | |
| Recessed surface | `--inset` | `#1B1C21` | |
| Hover | `--surface` | `#2C2D34` | |
| Text | `--text` | `#F3F0ED` | 14.2 / 13.1 / 15.0 |
| Secondary | `--text-2` | `#B6B6BE` | 8.0 / 7.4 / 8.4 |
| Muted | `--text-3` | `#9D9DA7` | 6.0 / 5.5 / 6.3 |
| Accent (marks, lines, dots) | `--accent` | `#D92D4B` | 3.4 / 3.1 / 3.6 (non-text, needs 3:1) |
| Button fill | `--accent-fill` | `#C42A42` | off-white label 4.7:1 (`#D92D4B` gave only about 4.2) |
| Input outline | `--control` | `#72727D` | 3.2 / 3.0 / 3.4 |

Crimson appears only on: the primary button, the current-page dot, selected chip dots, selected day underline, showtime stub underlines, eyebrow rules.

## 4. Neumorphic surface system

Light from top-left: dark shadow bottom-right, light shadow top-left.

| Token | Use |
|---|---|
| `--shadow-raised-sm` | buttons, chips, day buttons, showtime stubs, round buttons, posters at rest |
| `--shadow-raised` | the filter panel, a hovered poster |
| `--shadow-raised-lg` | editor's-pick panel and image, search dialog, poster on the film page |
| `--shadow-inset`, `--shadow-inset-sm` | search fields, selects, current nav item, selected chips/days, empty states, facts panel, CTA trough, date plates |
| groove (`inset 0 2px 0 dark, inset 0 3px 0 light`) | engraved dividers: section heads, cinema rows, footer |

Rules, to keep it from going muddy:
- **Raised = can be pressed. Inset = typed into, selected, or informational.** Pressing a raised control swaps to inset (150ms, 1px shift).
- Posters are objects resting on the surface (small raised shadow), never inside a bulky card. Type, dividers and imagery stay flat or engraved.
- **Selected state has multiple cues**: pressed-in shape, crimson dot (chips) or underline (days), bolder label, and `aria-pressed`.
- Text inputs and selects carry a 3:1 outline, because the skill flags neumorphism's weak edges. Buttons are identified by their labels.
- Focus: 3px solid off-white ring, offset 2-3px, never removed. `forced-colors` mode gets real borders.
- Large raised panels are limited to: filter bar, editor's pick, search dialog. Everything else is flat, engraved or recessed.

## 5. Typography (skill: Classic Elegant)

Playfair Display (500/600, italic emphasis) for headlines, film titles, dates, numerals. Inter (400/500/600) for navigation, body, controls, metadata. Fluid `clamp()` scale, body 16px, line-height 1.6, prose max 68ch. Fallbacks Georgia / system-ui, `font-display: swap`. Uppercase only for 12px labels.

## 6. Shape, spacing, motion

- Radii: `--radius` 12px (controls), `--radius-lg` 22px (large panels), `--radius-img` 10px (artwork); round buttons are circles.
- Spacing `--space-1..9` = 4 to 112px. Container 1240px, fluid gutter.
- Motion: press 150ms, state 250ms, image zoom 400ms, reveals 450ms; only `transform`, `opacity`, `box-shadow`; no looping animation except the loading shimmer; `prefers-reduced-motion` collapses it.
- Touch: 44px minimum targets on small and coarse-pointer screens.

## 7. Content honesty

Showtimes are demonstration data, labelled wherever shown. Upcoming dates are marked unconfirmed. No ratings. Key art is generated SVG, labelled "illustrated artwork" in the hero, until real TMDB artwork is synced (see README).
