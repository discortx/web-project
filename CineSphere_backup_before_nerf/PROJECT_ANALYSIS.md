# PROJECT_ANALYSIS.md — NERF MODE, Phase 1 (read-only)

Nothing in the project was modified to produce this report.

## 0. Key finding: the project is already simplified

`CineSphere/` is the output of an earlier simplification pass. The pre-simplification version is kept in `CineSphere_backup_before_simplification/`.

| | Backup (older) | Current `CineSphere/` |
|---|---|---|
| CSS files | 4 (`reset`, `styles`, `components`, `responsive`) = 667 lines | 1 (`style.css`) = 1,204 lines |
| JS files | 17 (`api.js`, `components.js`, `keyart.js`, `utils.js`, `pages/*` ...) | 9 files |
| Data | `data/*.json`, loaded with `fetch` | `js/data.js`, plain arrays |
| Build tools | `tools/*.mjs` (TMDB fetch, seed, showtimes generator) | none |

The current code is already plain `let`, `function`, `for` loops and `addEventListener`. There are no arrow functions, classes, `async`/`await` or ternary chains.

The remaining savings are therefore smaller than the prompt assumes. Most of them are in the CSS, in `main.js`, and in repeated HTML.

Two points about "Original LOC" in the final report:
- I will use the **current `CineSphere/` folder** as the baseline, because that is the project you submit.
- The backup folder will not be touched.

## 1. Folder structure

```
web-project/
├── CineSphere/                  <- the live website (analysed)
│   ├── index.html discover.html now-showing.html coming-soon.html
│   ├── cinemas.html cinema.html movie.html 404.html
│   ├── css/style.css
│   ├── js/data.js main.js home.js discover.js now-showing.js
│   │       coming-soon.js cinemas.js cinema.js movie.js
│   ├── assets/posters/*.webp (22)   assets/backdrops/*.webp (22)
│   ├── design-system/cinesphere/    MASTER*.md, pages/*.md  (notes only, not used by the site)
│   ├── README.md  VIVA_GUIDE.md (modified, uncommitted in git)
├── CineSphere_backup_before_simplification/   old version, not used
├── CineSphere_Research_Plan_Revised.md        research document
├── .claude/skills/ui-ux-pro-max/              tooling for Claude, unrelated to the site
└── .git/                                      one commit ("gg")
```

Entry point: `index.html`. There is no server, build step or package manager.

**External dependencies:** Google Fonts only (Inter, Playfair Display), loaded with `<link>` in every page. There are no JS libraries or frameworks. There are no API calls: no `fetch`, `localStorage` or `sessionStorage` anywhere.

**Unused or unnecessary files:**
- `design-system/` is documentation only.
- The `CineSphere_backup_...` folder is a duplicate old version.
- `.claude/skills/...` is not part of the website.

I propose to leave all of these alone, because the rules say not to delete files without a reason.

## 2. How the site works

Every page loads three scripts in this order: `data.js`, then `main.js`, then its own page script.

1. **`data.js`** creates three global arrays: `movies` (22), `cinemas` (6), `showtimes` (hand-written demo screenings).
2. **`main.js`** adds shared helper functions and runs the shared header and footer code on every page.
3. **`<page>.js`** reads the arrays, builds HTML strings and writes them into empty containers in the page with `innerHTML`.

Each HTML page is a static shell: header, `<main>` with empty containers, footer.

**Page-to-page links:**
- Pages link to each other through the nav.
- `movie.html?id=N` and `cinema.html?id=Cxxx` read the id from the URL with `URLSearchParams`.
- The header search form submits `?q=` to `discover.html`.
- `discover.html?genre=X` is read by `discover.js`.

## 3. HTML review

Eight pages. Each one repeats the same `<head>` (about 10 lines), header (about 20 lines) and footer (about 30 lines). That is **roughly 60 lines × 8 pages of duplicated markup**.

With no framework, no build step and no server, this repetition cannot be removed without JavaScript. This is a trade-off, described in section 8.

Specific observations:
- Every page has a long inline-SVG `data:` favicon, two `preconnect` links, and a meta description.
- Header, nav, search form, footer and skip link are identical on all pages apart from `aria-current` and the `solid` class.
- The footer's `<ul id="footer-cinemas">` is filled by `main.js`.
- `index.html` has 6 sections: hero, now showing, coming soon, editor's pick, cinemas and a call to action.
- The wrapper elements are mostly semantic (`section`, `header`, `nav`, `article`).
- A few wrappers are cosmetic: `.section-head > div`, `.hero-overlay`, `.hero-slides`, `.pick-picture`.
- Every page JS-critical id must be kept (list in section 7).

## 4. CSS review (`style.css`, 1,204 lines, about 958 code lines)

- It has 11 numbered sections and is already well commented.
- It uses the neumorphism design, which is built on 4 shadow custom properties and 12 colour/size variables.
- Responsive behaviour is two `@media` blocks (900px, 600px) and one `prefers-reduced-motion` block.
- No frameworks, no `!important`, no `calc()`, no deep nesting.

Simplification candidates:
- The 4 shadow variables, `--radius`, and about 10 colour variables could be replaced by direct values. This is borderline. Variables are easy to explain, so I would keep the colour variables and only inline the single-use ones.
- Pseudo-elements are limited to `::placeholder`.
- The following can be removed or merged: the `.note` rule (check it is unused), the `prefers-reduced-motion` block, and the SVG zoom transitions.
- The `:hover`, `:active` and focus styles can be merged where they are identical.
- The 900px and 600px blocks repeat some declarations (the `.poster-grid` and `.upcoming-list` columns are set twice in the 600px block).
- Many multi-line rules could be one-line rules. The line count would fall but readability would too, so I will only do this lightly.

Realistic target: **about 10–20% fewer lines** with no visible change.

## 5. JavaScript review (current LOC, comments and blanks excluded)

| File | Total | Code | Purpose |
|---|---:|---:|---|
| `data.js` | 174 | 162 | Data arrays |
| `main.js` | 378 | 279 | Helpers, SVG artwork, cards, showtime rows, menu, header scroll, footer |
| `home.js` | 168 | 126 | Slideshow, now-showing rail, coming soon, editor's pick, cinema list |
| `movie.js` | 151 | 114 | Movie detail page |
| `discover.js` | 113 | 78 | Search, genre chips, sort, clear, `?q=` and `?genre=` |
| `cinema.js` | 74 | 58 | Cinema detail page |
| `cinemas.js` | 61 | 49 | Cinema search |
| `now-showing.js` | 60 | 46 | Genre chips + grid |
| `coming-soon.js` | 19 | 14 | Upcoming grid |

**Duplicated logic worth merging:**
1. `discover.js` and `now-showing.js` have almost identical `showGenreButtons()` (about 25 lines each).
2. `cinemas.js` and `home.js` build the same `<li class="cinema-row">` block.
3. `movie.js` and `cinema.js` each have a `makeShowtimeSection()`, and both loop over `showtimes` to filter by movie and cinema.
4. `getMovieById` / `getCinemaById` are nearly identical, and so are `countMovieShowtimes` / `countCinemaShowtimes`.
5. The "not found" box is written out in both `movie.js` and `cinema.js`.
6. `makeFormatFact()` in `movie.js` and the "count showtimes" helpers all loop over `showtimes`.
7. The header scroll (`updateHeader`) and menu code in `main.js` can be shortened.

**Complex or advanced code:**
- `makeArt()`: the SVG artwork generator, about 40 lines. It is only used for films without a poster. **All 22 films currently have posters and backdrops**, so `makeArt`, `getArtColors`, the `artCount` counter and the SVG `if`-branches in `makePoster`/`makeBackdrop`/`makeStill` are effectively dead code (about 60 lines). This is the biggest single saving. Removing it means a film without an image will show a blank box, and I need your approval for that.
- `makeDateRows()` builds nested `</div></div>` strings across loop iterations. It is hard to read and easy to break.
- `statusClass = show.tickets.toLowerCase().replace(" ", "-")` is a small string trick that needs explaining.
- `sort()` with a comparison function appears in 5 places.
- `scrollBy({left, behavior:"smooth"})` and `matchMedia` (reduced motion) are modern APIs, but each is a single line.
- `array.includes`, `slice`, `join` and `concat` are used. These are fine for this level.
- `data.js` has about 90 repeated showtime lines. It is data, not logic, so I would not change it.

Realistic JS target: **about 20–25% fewer code lines** (about 170 lines out of about 730 excluding data), mainly from the dead SVG art, the merged chip builder and the merged showtime filter.

## 6. Complete feature list (baseline, must not break)

**Pages:** Home, Discover, Now Showing, Coming Soon, Cinemas, Cinema detail, Movie detail, 404.

**Features:**
- Hero slideshow: 5 films, prev/next arrows, clickable dots, 5-second auto-advance, pause on hover over the text, off if the visitor prefers reduced motion, and an "On the cover" link that updates.
- Scrollable "now showing" rail with 2 arrow buttons.
- Coming-soon cards (4 on Home, all on its own page).
- Editor's pick (first Urdu film showing).
- Cinema list with live screening counts.
- Discover page:
  - live text search over title, genre, director and cast
  - genre chips
  - sort (newest, oldest, title)
  - result count
  - "Clear all filters"
  - "No films match" box
  - the `?q=` and `?genre=` URL parameters
- Now Showing page: genre chips, count, and posters with screening counts.
- Cinemas page: search over name, area and address, count, clear, empty state.
- Movie detail page:
  - hero backdrop
  - facts panel (director, release, runtime, age rating, language, formats, tickets left, genres, cast)
  - YouTube trailer search link
  - showtimes grouped by cinema and date, with ticket status (Available, Few left, Sold out)
  - "More like this"
  - a not-found message
- Cinema detail page: address, website link, showtimes grouped by movie, with a not-found message.
- Mobile menu (toggle, `aria-expanded`, Escape to close).
- Header turns solid on scroll.
- Footer cinema links on every page.
- Header search form on every page.
- Skip link and focus outlines.
- Responsive layout at 900px and 600px.

**External integrations:** Google Fonts, YouTube search link (a plain link), links to cinema websites. There are no API calls and nothing to authenticate.

## 7. IDs and classes JavaScript depends on (must be preserved in Phase 2)

- All pages: `menu-button`, `nav`, `site-header`, `footer-cinemas`, and classes `open`, `scrolled`.
- Home: `hero-slides`, `hero-dots`, `hero-content`, `hero-prev`, `hero-next`, `hero-film`, `hero-film-name`, `now-rail`, `rail-prev`, `rail-next`, `upcoming-list`, `pick`, `cinema-list`, and classes `hero-slide`, `dot`, `active`.
- Discover: `search`, `sort`, `genre-buttons`, `movie-grid`, `result-count`, `clear-filters`, `filter-form`.
- Now Showing: `genre-buttons`, `movie-grid`, `result-count`.
- Coming Soon: `upcoming-list`, `result-count`.
- Cinemas: `search`, `cinema-list`, `result-count`, `clear-search`, `search-form`.
- Movie and Cinema: `movie-page`, `cinema-page`.
- Classes written by JS and styled by CSS: `chip`, `selected`, `poster-card`, `poster`, `still`, `backdrop-image`, `tag`, `date-row`, `date-label`, `times`, `time`, `few-left`, `sold-out`, `ticket-status`, `show-group`, `show-movie`, `show-poster`, `cinema-row`, `cinema-number`, `empty`, `facts`, `movie-hero`, `movie-layout`, and others.

## 8. Risks of simplification

1. **The code is already simple.** The biggest risk is churn. The prompt asks me to "reduce lines", and further cutting trades readability for length. I will follow the rule that readability wins over line count.
2. **Repeated header, footer and head across 8 pages.** Removing the duplication needs JavaScript injection (or `<iframe>`/`fetch`, which fails on `file://`). That would be harder to explain and would break the double-click-to-open workflow. I recommend **leaving the HTML duplication as is** and only trimming genuinely unneeded attributes and lines.
3. **Dead SVG artwork removal** changes behaviour only if a film has no poster or backdrop. The README says that fallback is a feature. I need your decision (question 1 below).
4. **Merging the duplicate functions** (chips, cinema row, showtime lookup) means moving code into `main.js`, which every page loads. I must be careful about global name clashes. For example `movie`, `cinema`, `page`, `parameters`, `selectedGenre` and `nowShowing` are top-level `let` variables in different page scripts, and a clash in `main.js` would throw a `SyntaxError`.
5. **`innerHTML +=` inside loops** re-parses the DOM each time. It is simple and works, but a new element-building style would be harder for a beginner. I would keep it.
6. **CSS responsive rules** (poster grid 6 → 3 → 2 columns, sticky sidebar, stacked layouts) are easy to break when merging rules, so each change needs checking at three widths.
7. **Testing:** there is no test suite. I can check syntax with `node --check`. I can also run the page scripts against a DOM in Node (jsdom is not installed and I will not install it). Real browser testing needs a browser. Please tell me if one is available (question 2).
8. **`VIVA_GUIDE.md` and `README.md`** describe the code line by line. If functions are renamed or removed, those documents become inaccurate. `VIVA_GUIDE.md` also has uncommitted changes. I will not edit it unless you ask.
9. **Dates:** the data uses fixed dates (30 Oct – 5 Nov 2026) and `getToday()` uses the real clock. Output and the "now showing" / "coming soon" lists depend on the date the site is opened. That is existing behaviour and I will preserve it.

## 9. Baseline

**Existing errors found by reading (no browser available to confirm):**
- None that block functionality.
- `style.css` is probably missing a `:focus-visible` distinction (cosmetic).
- `.note` appears unused (to be verified in Phase 2).
- The 600px media block sets `.poster-grid` columns and `.upcoming-list` columns twice (harmless).

**Line counts** (total / code lines without comments and blanks):

| Group | Total | Code |
|---|---:|---:|
| 8 HTML files | 770 | 725 |
| `style.css` | 1,204 | 958 |
| 9 JS files | 1,198 | 926 |
| of which `data.js` | 174 | 162 |
| JS without data | 1,024 | 764 |

## 10. Proposed plan and expected results

- **Phase 2 (HTML/CSS):** HTML 725 → about 690 lines (remove unneeded attributes, preconnects and meta description lines). CSS 958 → about 800 lines (remove dead rules, merge duplicates, inline single-use variables, simplify the hover transforms). No redesign.
- **Phase 3 (JS):** 764 → about 580 code lines, excluding `data.js`.
- Phase 3 would include: remove the SVG art, merge the chip builder, merge the cinema-row builder, merge the showtime lookup, simplify `makeDateRows`, and shorten the menu/header code.
- I will back up the current folder to `CineSphere_backup_before_nerf/` before editing anything.

## Decisions needed before Phase 2

1. **SVG fallback artwork:** may I remove it (about 60 lines)? All 22 films have real images today.
2. **HTML duplication:** is it OK to leave the repeated header and footer in all 8 pages?
3. **Testing:** is a browser (or Playwright/Chromium) available, or should I test only with `node --check` and a Node-based DOM check?
