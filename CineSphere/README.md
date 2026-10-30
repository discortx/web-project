# CineSphere

A film discovery and cinema guide for Lahore, Pakistan. University Web Technology course project.
Plain HTML5, CSS3 and vanilla JavaScript. No frameworks, no build step, no server needed.

## Run it

Double-click `index.html`. (Optionally: `python -m http.server 8000` in this folder, then open http://localhost:8000.)

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Cover slideshow (5 films), now showing, coming soon, editor's pick, cinemas |
| `discover.html` | Search, genre filter, sorting. `?q=dune` and `?genre=Drama` also work |
| `movie.html?id=3` | One film: facts, showtimes, related films |
| `now-showing.html` | Films that have screenings, with a genre filter |
| `coming-soon.html` | Films released after today |
| `cinemas.html` | Cinema list with a search box |
| `cinema.html?id=C001` | One cinema and its screenings |
| `404.html` | Page not found |

## Files

```
css/style.css   all styles, in numbered sections
js/data.js      the three data lists: movies, cinemas, showtimes
js/main.js      shared functions, menu, header, footer
js/<page>.js    one small script per page
```

Every page loads `data.js`, then `main.js`, then its own script.
`VIVA_GUIDE.md` explains the code in simple language and lists likely viva questions.

## What is real and what is demonstration

- Movie titles, years and genres are real. Cast, directors and runtimes were written by hand. There are no ratings.
- Upcoming release dates are unconfirmed and the site says so.
- **Showtimes are demonstration data.** They are not real schedules and nothing can be booked.
- Cinema names and addresses were checked against official sites and directories. Verify them before presenting.
- Posters and backdrops are in `assets/posters/` and `assets/backdrops/` (`.webp`, named after the film). They come from TMDB.  Every film in `js/data.js` needs both a `poster` and a `backdrop`.
- This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

## Design

Cinematic Neumorphism: one charcoal colour family (`#202126` page, `#26272D` raised, `#1B1C21` pressed in), lit from the top left, with crimson used only for the main button, small marks and selected states. Playfair Display for headings, Inter for text. The decisions and contrast measurements are in `design-system/cinesphere/MASTER.md`; it was produced with the UI/UX Pro Max skill and corrected against that skill's own accessibility ratings. (The files in `design-system/cinesphere/pages/` belong to an earlier design and are out of date.)
