# CineSphere

A film discovery and cinema showtime guide for Lahore, Pakistan. University Web Technology course project.
Plain HTML5, CSS3 and vanilla JavaScript (ES modules). No frameworks, no build step.
The research and planning behind it is in `../CineSphere_Research_Plan_Revised.md`.

## Run it

`fetch()` and ES modules don't work from `file://`, so serve the folder:

- VS Code: right-click `index.html` and choose **Open with Live Server**, or
- `python -m http.server 8000` in this folder, then open http://localhost:8000

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Cover hero, now showing rail, upcoming releases, editor's pick, cinema directory |
| `discover.html` | Search, genre / year / status filters, sorting, load more. State lives in the URL (`?q=&genre=&year=&status=&sort=`) |
| `movie.html?id=N` | Film detail, facts, showtimes for the selected city, related films, save |
| `now-showing.html` | Films with screenings in the selected city |
| `coming-soon.html` | Upcoming releases grouped by month |
| `cinemas.html` | Cinema directory with search and area filter |
| `cinema.html?id=C001` | One cinema: film and date selection |
| `404.html` | Not-found page |

Invalid or unknown ids on `movie.html` and `cinema.html` show a designed not-found state.

## Structure

```
css/   reset.css, styles.css (tokens, type, layout), components.css, responsive.css
js/    api.js (the only file that knows where data comes from), data.js (pure selectors),
       components.js (DOM builders), app.js (header, menu, location, search dialog, footer),
       keyart.js (generated artwork), utils.js, icons.js, pages/*.js (one per page)
data/  movies.json, cinemas.json, showtimes.json
tools/ seed-movies.mjs, fetch-tmdb.mjs, generate-showtimes.mjs (run once with Node; not part of the site)
```

HTML pages share identical header, footer and search dialog markup, written as static HTML so navigation works before JavaScript loads.

## Data, and what is and isn't real

- `data/movies.json` is **seed data**. Titles, years and genres are real; cast, directors and runtimes were written by hand; **ratings are left out** because they weren't from a reliable source; **upcoming release dates are unconfirmed** and the UI says so. There are no poster or backdrop URLs yet.
- `data/showtimes.json` is **demonstration data**, labelled as such wherever it appears. It is not a real cinema schedule and nothing can be booked.
- `data/cinemas.json`: cinema names and addresses were checked against official sites and directories where possible. Verify them before presenting.

### Getting real posters, backdrops and ratings

A free TMDB API key is used only on the command line, never in the site:

```powershell
$env:TMDB_API_KEY="your_v3_key"; node tools/fetch-tmdb.mjs
node tools/generate-showtimes.mjs 2026-11-05   # first demo date; only released films get showtimes
```

This writes posters, backdrops, trailer keys, ratings and release dates into `data/movies.json` and marks records `dataSource: "tmdb"`. The site then shows real images, ratings and trailer buttons, and drops the "unconfirmed" labels, with no code change. Until then, composed SVG key art (`js/keyart.js`) stands in; it carries no text and is not presented as an official poster.

TMDB terms: keep the attribution in the footer, don't cache TMDB data for more than 6 months, delete it after the course, and download the official TMDB logo from https://www.themoviedb.org/about/logos-attribution if you want to show the logo (the terms require the logo to be displayed).

## Design system: Cinematic Neumorphism

Documented in `design-system/cinesphere/MASTER.md` (generated with the UI/UX Pro Max skill, then corrected against its own accessibility ratings; raw output in `MASTER.generated.md`).

- **Material:** one charcoal family (`#202126` page, `#26272D` raised, `#1B1C21` recessed) lit from the top-left. Raised = pressable, inset = typed into or selected. Posters rest on the surface; only the filter bar, editor's pick and search dialog are large raised panels.
- **Accessibility compensation:** 3:1 outlines on inputs, 3px focus rings, selected states carry a pressed shape, a crimson dot or underline and bolder text, `aria-pressed`, 44px touch targets, reduced motion.
- **Type:** Playfair Display + Inter. **Accent:** crimson `#D92D4B` for marks, `#C42A42` for button fills (4.7:1 with the label).
- **Tokens:** `css/styles.css` (`:root`). Components: `css/components.css`. Breakpoints: `css/responsive.css`.
