# NERF_FINAL_REPORT.md

Pre-NERF copy of the project: `../CineSphere_backup_before_nerf/`. All "original" numbers below come from that copy. `CineSphere_backup_before_simplification/` (the older version) was not touched.

## 1. Project summary
CineSphere is a film guide for Lahore. It is plain HTML, CSS and JavaScript with no build step and no API calls.
- Every page loads `data.js` (the movies, cinemas and demo showtimes), then `main.js`, then its own page script.
- The pages are Home (slideshow, rail, coming soon, editor's pick, cinemas), Discover (search, genre, sort), Now Showing, Coming Soon, Cinemas, Cinema detail, Movie detail and 404.

## 2. Files modified
- **8 HTML files:** removed the `preconnect` lines. `index.html` also lost the outdated "Illustrated artwork" note.
- **`css/style.css`:** removed the unused `.note` rules, the SVG hover zoom, a duplicate nav background, duplicate phone-width grid rules, the `.hero-note` rule and the SVG selectors.
- **`js/main.js`:** removed the SVG fallback artwork (`makeArt`, `getArtColors`, `artCount`, `makeStill`). Added the shared helpers `findShowtimes`, `makeCinemaRow` and `makeGenreButtons`. Rewrote `makeDateRows`. Shortened some functions.
- **`home.js`, `cinemas.js`:** use `makeCinemaRow` instead of their own copies of the row HTML.
- **`discover.js`, `now-showing.js`:** use `makeGenreButtons` instead of their own copies of the chip code.
- **`movie.js`, `cinema.js`:** use `findShowtimes` instead of their own filter loops.
- **`README.md` and a `data.js` comment:** now say every film needs a poster and a backdrop.
- Not changed: the `data.js` data, `coming-soon.js`, the design-system notes, and `VIVA_GUIDE.md`.

## 3. Code reduction (measured)
"Code" excludes blank lines and comment-only lines.

| File | Original total | Final total | Original code | Final code | Code lines reduced |
|---|---:|---:|---:|---:|---:|
| 8 HTML files | 770 | 753 | 725 | 708 | 17 |
| style.css | 1,204 | 1,167 | 958 | 929 | 29 |
| main.js | 378 | 311 | 279 | 225 | 54 |
| home.js | 168 | 157 | 126 | 115 | 11 |
| discover.js | 113 | 86 | 78 | 58 | 20 |
| now-showing.js | 60 | 44 | 46 | 32 | 14 |
| cinemas.js | 61 | 50 | 49 | 38 | 11 |
| cinema.js | 74 | 67 | 58 | 53 | 5 |
| movie.js | 151 | 141 | 114 | 106 | 8 |
| coming-soon.js | 19 | 19 | 14 | 14 | 0 |
| data.js | 174 | 174 | 162 | 162 | 0 |
| **Total** | **3,172** | **3,003** | **2,609** | **2,440** | **169** |

- JS code without `data.js`: 764 → 641 (−16%).
- The whole project is 6.5% smaller in code lines.
- This is below my Phase 1 estimates (JS about 580, CSS about 800). The code was already simple, and I kept readability ahead of line count.

## 4. JavaScript simplification
- **Duplicate logic removed:**
  - Four copies of the "find screenings" loop (two in `movie.js`, one in `cinema.js`, plus the count functions in `main.js`) became one function, `findShowtimes(movieId, cinemaId)`. The word `"any"` means "do not check this one".
  - Two copies of the genre-chip builder became `makeGenreButtons`.
  - Two copies of the cinema-row HTML became `makeCinemaRow`.
- **Dead code removed:** about 60 lines of SVG artwork. Every film has a real image, so this code never ran.
- **`makeDateRows`** used to build `</div></div>` strings across loop passes. It now first lists the different dates, then builds the time boxes for each date, which is easier to follow.
- **Shorter without being cryptic:** one-line `sort` callbacks, `classList.toggle` for the header, and `formatRuntime`/`formatDate` without temporary variables.
- **Advanced techniques replaced:** none were in use. The code already used basic loops, `if/else` and `addEventListener`. The two things a student must now explain are passing a function as an argument (`makeGenreButtons(..., pickGenre)`, like `addEventListener` already does) and the `"any"` convention.

## 5. Functionality verification
**How it was tested:**
- Headless Google Chrome (this machine has no Node or jsdom).
- A test page loaded each site page in an iframe, performed actions (clicks, typing, changing the sort, the Escape key) and checked the results. About 70 checks were run, plus 2 targeted checks of the rail buttons.
- The Chrome log showed no console errors.
- 18 screenshots (9 pages at 1280px and 400px) were compared with the originals.

| Feature | Status |
|---|---|
| Home slideshow: 5 slides, next, prev with wrap-around, dots, cover label and link | Passed |
| Home rail: 12 cards with screening counts; arrow buttons call `scrollBy` ±600 smooth | Passed. The scrolling itself was not observed, because smooth scroll does not advance in headless virtual time. I checked the call arguments instead, and that the rail overflows |
| Home coming soon, editor's pick, 6 cinema rows, footer cinema links, all images load | Passed |
| Slideshow auto-advance every 5 s and pause on hover | **Not tested** (code unchanged) |
| Mobile menu open, Escape closes it, `aria-expanded` | Passed. The test ran in a wide window, so the open menu was not looked at at phone width |
| Header turns solid on scroll | Passed |
| Discover: 22 cards, count, sort (newest, oldest, A–Z), genre filter, search by actor and director (case-insensitive), genre and search combined, both clear buttons, no-match box, form submit prevented | Passed |
| Discover `?q=dune` and `?genre=Drama` | Passed |
| Now Showing: counts, tags, genre filter and reset | Passed |
| Coming Soon: cards, count, date plate | Passed |
| Cinemas: list, search, numbering restarts at 01, no-match box, both clear buttons | Passed |
| Cinema detail: heading, title, posters, date rows, not-found (bad id and no id) | Passed |
| Movie detail: title, facts, formats and tickets, ticket status classes, time format, trailer link, related films, images, unreleased-film message, not-found | Passed |
| 404 page | Passed |
| Appearance | 14 of 18 screenshots pixel-identical (explained below) |
| Hover and active styles, 900px tablet width, a real phone or touch device | **Not tested** |

The 4 screenshots that differ:
- Home 1280px: the slideshow was on a different slide in each shot.
- Home 400px: shifted because the outdated note was removed on purpose. I looked at it.
- Now Showing 400px and Cinema 400px: they look identical side by side. I assume the small differences are anti-aliasing or lazy-load noise, because an unchanged page also differed from itself between runs.

One check failed on the first run because my own threshold was wrong: the facts panel has 9 entries, and I had expected 10 or more. I checked it against the code and did not change the code.

## 6. Remaining complex code
- **`makeGenreButtons(box, genres, selected, onClick)`** takes a function as an argument. It is the one concept beyond plain loops.
- **Template strings with `${...}`** build HTML in every page script. This is the simplest way to do it without a framework, but the strings are long.
- **`show.tickets.toLowerCase().replace(" ", "-")`** turns "Sold out" into the CSS class `sold-out`.
- **`getToday()`** uses `toISOString().slice(0, 10)`, which gives the UTC date. Near midnight in Pakistan (UTC+5), "now showing" and "coming soon" can therefore be one day off. This was already the behaviour and I kept it.
- **The repeated header, footer and `<head>` in all 8 HTML pages** were left in place on purpose, because removing them needs JavaScript or a server.
- **`data.js`** is about 90 showtime lines of data, not logic.

## 7. Final assessment
- The JavaScript is about 640 logic lines. Each function is short, uses `for` loops and `if/else`, and has a comment.
- It was already beginner-level before this work. The gain is that each repeated block now exists once, so a student explains the "find screenings", "genre buttons" and "cinema row" helpers once instead of three or four times.
- **`VIVA_GUIDE.md` is out of date.** It was written for the earlier code and mentions functions that no longer exist (`countMovieShowtimes`, `countCinemaShowtimes`, `makeArt`, `makeStill`, `sortShowtimes`). Update it before the viva. I have not touched it.
- **There is no fallback picture any more.** A film added to `data.js` without `poster` and `backdrop` will show a broken image.
