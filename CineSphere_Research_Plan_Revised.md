# 🎬 CineSphere — Revised Research Report & Implementation Plan
### A University Web Technology Course Project | Lahore, Pakistan
#### Version 2.0 — Audited & Corrected

---

> [!IMPORTANT]
> This is the **revised and corrected** version of the original CineSphere plan.
> It preserves all useful material from v1, fixes identified flaws, verifies research claims, and resolves internal contradictions.
> The original plan (v1) is preserved in `CineSphere_Research_Plan.md` for comparison.
> **This document is a planning report. No application code is written here.**

---

## Table of Contents

A. [Executive Summary](#a-executive-summary)
B. [Research Verification Report](#b-research-verification-report)
C. [Corrected Requirements](#c-corrected-requirements)
D. [Data Sources and Licensing](#d-data-sources-and-licensing)
E. [Corrected Data Schema](#e-corrected-data-schema)
F. [Frontend Architecture](#f-frontend-architecture)
G. [Implementation Roadmap](#g-implementation-roadmap)
H. [UI and Design Plan](#h-ui-and-design-plan)
I. [Testing Checklist](#i-testing-checklist)
J. [Future Improvements](#j-future-improvements)
K. [Remaining Uncertainties](#k-remaining-uncertainties)
L. [References](#l-references)

---

## A. Executive Summary

**CineSphere** is a frontend-only university project that demonstrates HTML5, CSS3, and Vanilla JavaScript skills through a movie discovery and local cinema information prototype. The initial evaluation targets Lahore, Pakistan.

### Corrected Direction

The original plan contained several important flaws that are corrected here:

1. **The biggest flaw corrected:** The original plan confused two completely different concepts — a movie's global *release status* and its *local screening status* at a Lahore cinema. TMDB's `now_playing` endpoint returns movies with recent theatrical release dates in a national or global window. It does **not** tell you which movies are currently screening at Cinepax or Universal Cinemas in Lahore. These must be treated as separate concepts throughout the data model and UI.

2. **The data model is redesigned:** `status: "now_showing"` has been removed from the movie record. Release status belongs to the movie. Local screening status comes from whether a demo showtime record exists for that movie. The showtime schema now uses one record per individual screening time, making filtering straightforward.

3. **TMDB attribution notice is corrected** to match the exact wording required by the official Terms of Service.

4. **Unverified cinema coordinates are removed.** Distance-based features require verified coordinates and are moved to optional scope.

5. **The timeline contradiction is resolved.** The plan now provides one realistic, consistent 6-week schedule.

### Technical Summary

| Aspect | Decision |
|---|---|
| Frontend stack | HTML5, CSS3, Vanilla JavaScript (no frameworks) |
| Movie metadata source | TMDB — metadata collected once, saved to `movies.json` |
| Cinema data source | Handcrafted `cinemas.json` with verified names and general locations |
| Showtime source | Handcrafted `showtimes.json`, all flagged as demo data |
| TMDB API at runtime | Not used — avoids key exposure; data is pre-saved |
| Module system | Vanilla JS with `<script type="module">` in HTML entry points |
| Local development server | Required (VS Code Live Server or equivalent) |
| Initial city | Lahore — manual selector, no geolocation in Phase 1 |

---

## B. Research Verification Report

This table records every important claim from the original plan, whether it was verified, and what correction was applied.

| # | Original Claim | Verification Status | Evidence | Correction Applied |
|---|---|---|---|---|
| 1 | TMDB API provides movie metadata (titles, posters, ratings, genres, release dates, cast, trailers) | ✅ **Verified** | [TMDB API docs](https://developer.themoviedb.org/) | No correction needed |
| 2 | TMDB `now_playing` endpoint gives "currently showing" movies in Lahore | ❌ **Incorrect** | TMDB docs + multiple secondary sources confirm it returns movies with recent national/global theatrical release dates, not local cinema schedules | Removed `status: "now_showing"` from movie records. Explained the distinction between release status and local screening status throughout |
| 3 | TMDB does not provide local cinema showtimes in Pakistan | ✅ **Verified** | TMDB developer docs and forum posts confirm this | No correction needed; reinforced |
| 4 | TMDB API key is "safe" to use in university demo JavaScript | ⚠️ **Partially verified** | Key is technically exposed in browser JS. Risk is low for a student demo, but ToS requires a non-commercial use context. The ToS also prohibits use on "destination websites" generating revenue. | Added explicit qualification: acceptable for a private academic demo. TMDB CDN poster URLs in saved JSON do not expose the key at runtime. Hybrid approach removes the key from production code entirely |
| 5 | TMDB attribution notice: "This product uses the TMDB API but is not endorsed or certified by TMDB." | ❌ **Incorrect wording** | Official ToS (verified directly at https://www.themoviedb.org/api-terms-of-use, Section 3) states the exact required text is: *"This [website/program/service/application/product] uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB."* | Corrected the attribution notice in the schema and blueprint sections |
| 6 | TMDB ToS allows unlimited caching of data | ❌ **Incorrect — omission** | ToS Section 1.C states: "Cache, for longer than 6 months, any information obtained through or from TMDB or the TMDB APIs" is prohibited | Added caching time limit note. For a university project, pre-saving data to JSON and using it for one semester is within 6 months and is acceptable |
| 7 | TMDB poster CDN images can be directly linked | ✅ **Verified** | TMDB API documentation and branding guidelines confirm hotlinking to `image.tmdb.org/t/p/` is the intended usage | No correction needed |
| 8 | Cinepax Pakistan operates at Packages Mall, Lahore | ✅ **Verified** | [cinepax.com](https://cinepax.com) | No correction needed |
| 9 | CineStar operates three Lahore branches (Township, Xinhua Mall, DHA Raya) | ✅ **Verified** | [cinestar.pk](https://cinestar.pk) | No correction needed |
| 10 | Universal Cinemas operates at Nishat Emporium Mall, Johar Town (9 screens, IMAX, 4DX) | ⚠️ **Location verified; details corrected** | Location confirmed. Directory listings give the mall address as 16M Abdul Haque Road, Trade Centre Commercial Area Phase 2, Johar Town. A ten-screen count was reported (Oct 2026 re-check, via a search summary of the company's About page), not nine. The "3rd Floor" detail in v2.0 could not be confirmed | `screens`, IMAX and 4DX removed from verified data. Address in `cinemas.json` changed to the directory-confirmed mall address without a floor number |
| 11 | CineGold Plex exists in Lahore | ⚠️ **Existence verified; address from third parties only** | [cinegoldplex.com](https://www.cinegoldplex.com) lists a Lahore site with phone numbers but no street address. "Sector F, Bahria Town, Mohlanwal, Lahore" comes from Cinema Treasures and Graana, not the official site. An older page says Sector B | Keep the address but treat it as third-party sourced; confirm via the site's Contact Us page before the demo |
| 12 | Cinepax has 8 screens at Packages Mall | ❌ **Incorrect / unverified** | A 2017–2018 press announcement (Box Office Pro, Daily Pakistan) describes a 10-screen multiplex there. The official site does not publish a count | `screens` field omitted from cinema JSON |
| 12a | CineStar has three Lahore branches with the addresses in the plan | ✅ **Verified** | Official cinemas page (cinestar.pk/Browsing/Cinemas) lists Township, Xinhua Mall and DHA Raya Club with matching addresses | No correction needed |
| 12b | TMDB ToS: attribution wording, 6-month caching limit, non-commercial use | ✅ **Verified (re-read Oct 2026)** | Attribution is Section 3 (with logo less prominent than your own); caching limit is Section 1.C; commercial use prohibition is Section 2.A; Section 1.D requires deleting cached content when the license ends | URL updated to https://www.themoviedb.org/api-terms-of-use. Note the 1.D deletion duty |
| 12c | `now_playing?region=PK` returns movies released in Pakistan within a recent window | ⚠️ **Not documented** | The endpoint docs only call `region` an ISO-3166-1 code and give no window definition; the page says it is a discover call filtered on release dates and release types 2\|3 | Wording softened below; treat region behaviour as something to test, not rely on |
| 13 | Cinema latitude/longitude values (e.g., `31.5204, 74.3587`) are accurate | ❌ **Unverified — removed** | These were not cited from any source in the original plan | Coordinates removed from all cinema records in Phase 1. Distance features require verified coordinates and are deferred to optional scope |
| 14 | Cinema phone numbers (`+92-42-XXXXXXX`) are placeholders | ✅ Correctly labeled in original | Already warned in the original plan | Kept as illustrative placeholders; removed from the schema to avoid confusion |
| 15 | MovieGlu API is "paid" with "limited Pakistan coverage" and "too expensive for a university project" | ⚠️ **Partially verified, oversimplified** | MovieGlu offers an evaluation key (approximately 75 real-data requests) and a sandbox (approximately 10,000 dummy requests), according to their website. Pricing is custom, not publicly listed. Pakistan coverage is not confirmed without testing. | Corrected description: MovieGlu has evaluation access, but Pakistan coverage is unconfirmed. Commercial pricing is opaque. Still not recommended for this project because the evaluation tier is very limited and coverage is uncertain |
| 16 | Kaggle "Top Movies MIT Dataset" has a direct URL | ❌ **Unverified — no URL provided** | The original plan cited only a generic search instruction. No direct dataset URL was verified | Listed as "requires manual search and verification on Kaggle" — not recommended as primary source because TMDB metadata is richer and better sourced |
| 17 | Showtimes schema with `times: ["11:00 AM", "2:30 PM", ...]` array per record is a good design | ❌ **Design flaw** | Grouping multiple times in one record makes filtering by individual screening time impossible; also mixes AM/PM strings with no consistent internal format | Corrected: each individual screening is its own record with a single `time` in HH:mm 24-hour format |
| 18 | `format: ["2D", "3D"]` belongs on the movie record | ❌ **Design flaw** | Format is a property of the individual screening, not of the movie itself. A movie can screen in 2D at one cinema and IMAX at another | Moved `format` to the showtime record only |
| 19 | `language` field on movie means screening language | ❌ **Ambiguous** | `language` on the movie should mean the movie's original production language. The language a specific screening is presented in (dubbed, subtitled, original) belongs on the showtime record | Renamed to `originalLanguage` on movie; `screeningLanguage` added to showtime record |
| 20 | `availableSeats` and `totalSeats` in demo data is appropriate | ❌ **Misleading** | These fields simulate real-time availability data, which is not achievable in a frontend-only project and could confuse the instructor | Removed from demo schema. A static demo banner is sufficient |
| 21 | JavaScript modules (`import`/`export`) work automatically | ❌ **Missing critical note** | ES modules require `<script type="module">` in the HTML file. Without this attribute, the browser does not support `import`. Also, modules are blocked by `file://` just like `fetch()` | Added explicit instruction in the architecture section |
| 22 | `innerHTML` with template literals is safe for all data | ⚠️ **Security warning missing** | Inserting untrusted data into `innerHTML` is an XSS vulnerability. For a local demo with trusted JSON data the risk is contained, but the plan should recommend `textContent` for user-visible strings | Added note recommending `textContent` for all text content and limiting `innerHTML` to structural skeleton only |
| 23 | Timeline: "Days 1–9" vs. "6 Weeks" | ❌ **Contradiction** | The phase descriptions said Days 1–9 but the summary table showed 6 weeks | Resolved: one consistent 6-week schedule provided |
| 24 | Geolocation ("Use My Location") is in the essential feature list (Phase 9) | ❌ **Misclassified** | Geolocation requires verified coordinates, HTTPS or localhost, and adds significant complexity. It is not essential for demonstrating HTML/CSS/JS skills | Moved to Phase 2 optional features. Manual city selector (default: Lahore) remains essential |

---

## C. Corrected Requirements

### Phase 1 — Required (Must work at evaluation)

These features directly demonstrate HTML structure, CSS styling, and JavaScript data manipulation. Each one is achievable by a beginner within 6 weeks.

| # | Feature | Why it is Required |
|---|---|---|
| 1 | Responsive homepage with hero section | Shows CSS layout, visual design, and responsive skills |
| 2 | Navigation bar (mobile hamburger on small screens) | Shows HTML structure and basic JS interaction |
| 3 | "Now Showing" movie section | Shows JS data loading and DOM rendering |
| 4 | "Coming Soon" movie section | Shows JS filtering and conditional rendering |
| 5 | Movie cards (poster, title, rating, genre chips) | Shows CSS components and JS template rendering |
| 6 | Search movies by title (live, no submit button) | Shows JS event handling and array filtering |
| 7 | Genre filter | Shows multi-value JS filtering |
| 8 | Movie detail view (dedicated page or modal) | Shows JS data look-up and dynamic DOM population |
| 9 | Empty state message when no results | Shows conditional rendering |
| 10 | Missing poster fallback image | Shows graceful error handling |
| 11 | Cinema listing page (Lahore) | Shows second JSON data source loading |
| 12 | Showtimes page with demo data disclaimer | Shows data joining across JSON files |
| 13 | Manual city selector (default: Lahore) | Shows simple JS state management |
| 14 | Responsive layout on desktop and mobile | Shows CSS media queries |
| 15 | TMDB attribution notice on all pages | Required by TMDB Terms of Service |
| 16 | Demo data disclaimer visible on showtimes page | Required for academic honesty |

### Phase 2 — Optional (Build if time remains)

| # | Feature | Notes |
|---|---|---|
| 17 | Watchlist saved in `localStorage` | Heart toggle on cards; persists on refresh |
| 18 | Trailer link in movie detail (opens YouTube) | Simpler than embedding an iframe |
| 19 | Movie sort (A–Z, Rating, Release date) | JS `.sort()` before rendering |
| 20 | Geolocation — "Use My Location" button | Only feasible with verified cinema coordinates; requires HTTPS or localhost |
| 21 | Dark/light theme toggle | CSS custom properties + JS class |
| 22 | Date picker for showtimes | `<input type="date">` + JS filter |

### Explicitly Out of Scope (Initial Evaluation)

| Feature | Reason |
|---|---|
| Real-time cinema showtimes | No free, documented public API exists for Pakistani cinemas |
| Ticket booking or payment | Requires backend, payment gateway, and cinema partnerships |
| User accounts and login | Requires authentication server and database |
| Backend proxy for TMDB key | Requires Node.js or serverless deployment |
| Geolocation without verified coordinates | Unverified coordinates produce wrong distance results |
| Seat map or availability display | Real availability requires live cinema API |
| Multiple cities beyond Lahore | Insufficient verified cinema data for other cities |
| Scraping any cinema website | Not permitted without explicit Terms of Service authorization |

---

## D. Data Sources and Licensing

### D.1 TMDB API — Recommended for movie metadata

**Source:** https://developer.themoviedb.org/

**What it provides:** Movie titles, overviews, poster and backdrop image URLs, release dates, genres (as IDs mapped to names), TMDB vote average and vote count, runtime, original language, cast and crew (via separate credits endpoint), and video trailer keys (via separate videos endpoint).

**What it does not provide:** Local cinema showtimes for Pakistan or any other country.

**What the `now_playing` endpoint actually means** *(Important correction from v1)*:
TMDB's `GET /movie/now_playing` returns a paginated list of movies "currently in theatres", based on release dates and theatrical release types (the docs describe it as a discover call behind the scenes). The docs do not define the exact date window, and they do not explain what the optional `region` parameter does beyond calling it an ISO-3166-1 code. Test `region=PK` yourself and do not assume it reflects Pakistani releases. Either way, appearing in this list does **not** mean the movie is currently screening at a specific cinema in Lahore tonight. For a student demo, this endpoint is a good way to find *candidates* for the "now showing" section, but the local screening status is always controlled by your demo `showtimes.json`.

**TMDB poster CDN:** Images are accessed at `https://image.tmdb.org/t/p/{size}/{poster_path}`. This is the intended usage — you do not download images separately. Sizes for posters include: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`.

**API key requirement:** Yes, a free API key is required. Register at https://www.themoviedb.org/settings/api. The recommended approach is to use the key once during data collection, save results to `movies.json`, and never embed the key in the website source code.

**Rate limits:** Soft ceiling of approximately 40 requests per second. Well within limits for a one-time data collection session.

**Caching clause (from ToS):** Data obtained from TMDB must not be cached for longer than 6 months. Pre-saving to JSON for a university semester (typically 3–4 months) is within this limit. Source: https://www.themoviedb.org/api-terms-of-use, Section 1.C. Section 1.D also requires deleting cached TMDB content once your license ends, so remove the saved data after the course.

**Attribution requirement (exact wording from ToS):** The following text must appear prominently in the application:

> *"This [website/program/service/application/product] uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB."*

The TMDB logo must also be displayed (less prominently than CineSphere's own logo). Logo download: https://www.themoviedb.org/about/logos-attribution

**Commercial use:** The free API key is for non-commercial use only. A student portfolio project with no advertising revenue or paid access qualifies as non-commercial. Source: ToS Section 2.A.

**Suitability for this project:** ✅ Best available source for rich, visually convincing movie metadata.

---

### D.2 Local Handcrafted JSON — Required for cinemas and showtimes

**What it provides:** Cinema names, general areas, official websites, and demo screening schedules that you define yourself.

**Cost/key:** None.

**Attribution:** None required.

**Accuracy:** All demo showtime data must be clearly labeled. Cinema names and general locations are modeled on real cinemas but the operational details (exact schedules, prices) are fictional.

**Suitability:** ✅ Essential for cinema and showtime data — no alternative exists.

---

### D.3 Kaggle Movie Datasets — Not recommended as primary source

General movie datasets are available on Kaggle (https://www.kaggle.com/datasets — search "movies"). Some have MIT or CC0 licenses. However, these are not recommended as the primary source because:
- TMDB metadata is richer, includes proper poster paths, and is more current.
- Kaggle datasets often contain poster URLs that link back to TMDB anyway.
- Dataset-specific URLs were not verified during this research — any recommendation would require the student to verify the specific dataset's license and content independently before use.

If TMDB API access is not possible (e.g., registration is blocked or the instructor prohibits external APIs entirely), a Kaggle dataset with verified CC0 or MIT license is a valid fallback. In that case, the student must verify the license on the dataset's own page before use.

---

### D.4 Pakistani Cinema Websites — Reference only, no API

| Cinema | Official Website | What is publicly available | API? |
|---|---|---|---|
| Cinepax | https://cinepax.com | Now showing, coming soon, showtimes on the website | ❌ No documented public API |
| CineStar | https://cinestar.pk | Showtime listings on the website | ❌ No documented public API |
| Universal Cinemas | https://universalcinemas.com | Movie listings on the website | ❌ No documented public API |
| Raiha CineGold Plex | https://www.cinegoldplex.com | Movie and showtime information | ❌ No documented public API |

**Scraping:** These websites display their data publicly, but scraping them requires reviewing each site's Terms of Service. No search conducted during this research found terms that explicitly permit scraping. Do not scrape without explicit permission.

---

### D.5 MovieGlu — Not recommended for this project

**Source:** https://www.movieglu.com

MovieGlu provides cinema showtime data for over 125 countries. They offer an evaluation API key (reported as approximately 75 real-data requests) and a sandbox environment (approximately 10,000 dummy requests). Commercial pricing is customized and not publicly published.

**Pakistan coverage:** Not confirmed from available sources. The student would need to request an evaluation key and test whether Pakistani cinema data is available.

**Recommendation:** Not suitable for this project. The evaluation limit is too low for meaningful use; commercial plans are opaque in pricing; Pakistan coverage is unconfirmed; and the requirement adds unnecessary complexity for an evaluation that only needs demo data.

---

## E. Corrected Data Schema

### E.1 Key Concept: Release Status vs. Local Screening Status

These are two different things and must not be confused:

**Release status** (belongs on the movie record):
- `"upcoming"` — The movie has not yet been released in any territory as of the current date.
- `"released"` — The movie has a past release date in at least one major territory.

**Local screening status** (determined by `showtimes.json`):
- A movie has demo screenings → it appears in the "Now Showing" section of CineSphere.
- A movie has no showtime records → it is listed under "Coming Soon" if its release date is in the future, or it appears only in the full movie catalogue if already released.

Your JavaScript reads `movies.json`, then checks `showtimes.json` to determine whether a movie has any local demo screenings. You do **not** store local screening status on the movie record itself.

```
How CineSphere determines what to show:

1. Load movies.json + showtimes.json

2. For "Now Showing" section:
   → Find movies that have at least one showtime record in showtimes.json
   → These are your "locally screening" demo movies

3. For "Coming Soon" section:
   → Find movies with no showtime record AND a future releaseDate
   → These are upcoming releases

4. Full movie catalogue: all movies regardless of showtimes
```

---

### E.2 `data/movies.json` — Corrected Schema

```json
[
  {
    "id": 1,
    "tmdbId": 945961,
    "title": "Alien: Romulus",
    "overview": "While scavenging the deep ends of a derelict space station, a group of young colonists come face to face with the most terrifying life form in the universe.",
    "posterPath": "https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg",
    "backdropPath": "https://image.tmdb.org/t/p/w1280/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
    "genres": ["Horror", "Science Fiction", "Action"],
    "releaseDate": "2024-08-14",
    "runtimeMinutes": 119,
    "tmdbRating": 7.3,
    "tmdbVoteCount": 4120,
    "originalLanguage": "en",
    "trailerKey": "wNzFNHyNBIQ",
    "cast": ["Cailee Spaeny", "David Jonsson", "Archie Renaux"],
    "director": "Fede Álvarez"
  }
]
```

**Field-by-field explanation:**

| Field | Source | Purpose | Notes |
|---|---|---|---|
| `id` | You assign it | Internal link key for showtimes | Integer, unique, sequential |
| `tmdbId` | TMDB response | Attribution / reference to original source | Record for honesty |
| `title` | TMDB | Display | — |
| `overview` | TMDB | Movie description | Use `textContent`, not `innerHTML` |
| `posterPath` | TMDB (full CDN URL) | Card and detail images | Use `https://image.tmdb.org/t/p/w500/...` |
| `backdropPath` | TMDB (full CDN URL) | Hero section background | Use `https://image.tmdb.org/t/p/w1280/...` |
| `genres` | TMDB genre names | Filter chips; displayed on cards | TMDB returns genre IDs — convert to names using the `/genre/movie/list` endpoint |
| `releaseDate` | TMDB | Date display; determines if upcoming or released | Format: `YYYY-MM-DD` |
| `runtimeMinutes` | TMDB | Display in movie detail | Integer |
| `tmdbRating` | TMDB `vote_average` | Star rating display | 0.0–10.0 |
| `tmdbVoteCount` | TMDB | Context for rating | Display as "(4,120 votes)" |
| `originalLanguage` | TMDB ISO 639-1 code | Filter by language | `"en"`, `"ur"`, `"hi"` — not the screening language |
| `trailerKey` | TMDB videos endpoint | YouTube embed or link | Key only, not full URL. URL: `https://www.youtube.com/watch?v={key}` |
| `cast` | TMDB credits endpoint | Display in detail view | Keep to 3–5 names |
| `director` | TMDB credits endpoint | Display in detail view | — |

**Removed from v1 schema:**
- `status: "now_showing"` — Removed. Local screening status comes from `showtimes.json`.
- `tagline` — Optional; can add if desired but not needed.
- `voteCount` → renamed `tmdbVoteCount` for clarity.
- `language` → renamed `originalLanguage` to prevent confusion with screening language.
- `format: ["2D", "3D"]` — Removed. Format belongs on the showtime record.

---

### E.3 `data/cinemas.json` — Corrected Schema

```json
[
  {
    "id": "C001",
    "name": "Cinepax Packages Mall",
    "city": "Lahore",
    "area": "Walton Road",
    "address": "Packages Mall, Walton Road, Lahore",
    "officialWebsite": "https://cinepax.com",
    "image": "assets/images/cinemas/cinepax-packages.jpg"
  },
  {
    "id": "C002",
    "name": "Universal Cinemas Emporium Mall",
    "city": "Lahore",
    "area": "Johar Town",
    "address": "Emporium Mall, 16M Abdul Haque Road, Trade Centre Commercial Area Phase 2, Johar Town, Lahore",
    "officialWebsite": "https://universalcinemas.com",
    "image": "assets/images/cinemas/universal-emporium.jpg"
  },
  {
    "id": "C003",
    "name": "CineStar Township",
    "city": "Lahore",
    "area": "Township",
    "address": "Plot 13/2, Ali Road, Civic Center, Commercial Area, Township, Lahore",
    "officialWebsite": "https://cinestar.pk",
    "image": "assets/images/cinemas/cinestar-township.jpg"
  },
  {
    "id": "C004",
    "name": "CineStar Xinhua Mall",
    "city": "Lahore",
    "area": "Gulberg III",
    "address": "4th Floor, Xinhua Mall, Mian Mehmood Ali Kasuri Road, Block B-2, Gulberg III, Lahore",
    "officialWebsite": "https://cinestar.pk",
    "image": "assets/images/cinemas/cinestar-xinhua.jpg"
  },
  {
    "id": "C005",
    "name": "CineStar DHA Raya Club",
    "city": "Lahore",
    "area": "DHA Phase 6",
    "address": "Sector M, Defence Raya Golf Resort, DHA Phase 6, Lahore",
    "officialWebsite": "https://cinestar.pk",
    "image": "assets/images/cinemas/cinestar-dha-raya.jpg"
  },
  {
    "id": "C006",
    "name": "Raiha CineGold Plex",
    "city": "Lahore",
    "area": "Bahria Town",
    "address": "Sector F, Bahria Town, Mohlanwal, Lahore",
    "officialWebsite": "https://www.cinegoldplex.com",
    "image": "assets/images/cinemas/cinegold-plex.jpg"
  }
]
```

**What was removed from v1 schema:**
- `screens` — Count not verified from official sources for most branches. Omitted.
- `latitude` / `longitude` — Removed. These values were unverified in v1. Distance calculation requires verified coordinates. Include only if you manually verify them from a map service. They belong in Phase 2 optional features.
- `formats` — This is a property of individual screenings, not cinemas. Some cinemas may list their available formats on their website; if so, it can be added as a display-only string like `"featuredFormats": "IMAX, 4DX, 2D, 3D"`. Do not use it for filtering.
- `amenities` — Unverified from official sources. Omitted.
- `phone` — Phone numbers were placeholders (`+92-42-XXXXXXX`). Misleading placeholders removed.

**Important:** The `address` values above are sourced from research (cited in references). They are included in good faith as of the research date. Verify against each cinema's current official website before presenting them as factual in a live demonstration, as cinema details can change.

---

### E.4 `data/showtimes.json` — Corrected Schema

> [!IMPORTANT]
> **Each record represents one individual screening.** This replaces the v1 design that grouped multiple times per record.

**Why this matters:** If a single record has `times: ["11:00 AM", "2:30 PM"]`, you cannot filter by a specific time or link to "the 11 AM screening." One record per screening makes filtering, display, and future extension straightforward.

```json
[
  {
    "id": "ST001",
    "movieId": 1,
    "cinemaId": "C001",
    "date": "2026-11-05",
    "time": "11:00",
    "format": "2D",
    "screeningLanguage": "English",
    "ticketPriceNote": "Demo price: PKR 800–1,200 (illustrative only)",
    "isDemoData": true
  },
  {
    "id": "ST002",
    "movieId": 1,
    "cinemaId": "C001",
    "date": "2026-11-05",
    "time": "14:30",
    "format": "2D",
    "screeningLanguage": "English",
    "ticketPriceNote": "Demo price: PKR 800–1,200 (illustrative only)",
    "isDemoData": true
  },
  {
    "id": "ST003",
    "movieId": 1,
    "cinemaId": "C002",
    "date": "2026-11-05",
    "time": "15:00",
    "format": "IMAX",
    "screeningLanguage": "English",
    "ticketPriceNote": "Demo price: PKR 1,500–2,200 (illustrative only)",
    "isDemoData": true
  }
]
```

**Field-by-field explanation:**

| Field | Type | Purpose |
|---|---|---|
| `id` | String | Unique ID for this specific screening |
| `movieId` | Integer | Links to `movies.json` — must match an existing `id` |
| `cinemaId` | String | Links to `cinemas.json` — must match an existing `id` |
| `date` | String `YYYY-MM-DD` | The date of this screening |
| `time` | String `HH:mm` (24-hour) | Internal storage format. Convert to "11:00 AM" only when displaying to the user |
| `format` | String | The screen format for this screening: `"2D"`, `"3D"`, `"IMAX"`, `"4DX"` |
| `screeningLanguage` | String | The language the film is presented in for this screening: `"English"`, `"Urdu"`, `"Hindi"` |
| `ticketPriceNote` | String | A note clearly stating this is a demo price. Do not store as a number — storing a number implies the price is real |
| `isDemoData` | Boolean | Always `true` — allows JavaScript to show a disclaimer banner on the showtimes page |

**What was removed from v1 schema:**
- `times: [...]` array — Replaced by single `time` per record.
- `price: { standard: 800, premium: 1200, currency: "PKR" }` — Replaced by `ticketPriceNote` string to make it obvious this is not a real price.
- `availableSeats` / `totalSeats` — Removed. These simulate real-time data that this frontend cannot provide.

---

### E.5 Data Relationships

```
movies.json                  showtimes.json              cinemas.json
──────────────               ──────────────────          ─────────────
{ id: 1, title: "..." }  ←── movieId: 1  ──────────►  cinemaId: "C001" ◄── { id: "C001", name: "..." }
{ id: 2, title: "..." }  ←── movieId: 2               cinemaId: "C002" ◄── { id: "C002", name: "..." }
                                                        ...
```

- One movie can appear in many showtime records (multiple cinemas, multiple dates, multiple times).
- One cinema can appear in many showtime records.
- A showtime record references exactly one movie and one cinema.
- A movie does not directly know which cinemas screen it — that relationship exists only through showtime records.

**Consistency rules to enforce manually before demo:**
1. Every `showtimes.movieId` must match an `id` in `movies.json`.
2. Every `showtimes.cinemaId` must match an `id` in `cinemas.json`.
3. No showtime should reference a movie with a `releaseDate` in the future (you wouldn't show an unreleased movie).
4. All dates in `showtimes.json` should be within a sensible demo window (e.g., two weeks around the demo date). Re-check this a few days before the evaluation and shift the dates if needed. The sample dates in this document (2026-11-05) are placeholders.
5. Every movie with showtimes must have a `releaseDate` on or before the earliest showtime date for it.

---

### E.6 Recommended Data Quantities

| File | Records | Notes |
|---|---|---|
| `movies.json` | 20–25 movies | Manageable to write and maintain manually |
| `cinemas.json` | 6 cinemas | All 6 verified Lahore cinemas listed above |
| `showtimes.json` | 50–70 records | Aim for 3–5 screenings per movie × 2–3 cinemas × 5–7 dates |

**Movie mix for good demo coverage:**
- 10–12 movies with showtime records → appear in "Now Showing"
- 8–10 movies with future `releaseDate` and no showtime records → appear in "Coming Soon"
- 2–4 movies with past `releaseDate` and no showtime records → appear only in full catalogue

**Genre distribution suggestion:**
Action (4), Drama (3), Horror (3), Science Fiction (3), Animation/Family (2), Thriller (3), Comedy (2), Romance (1).

**Language distribution (originalLanguage):**
English (`en`): ~15 movies; Urdu (`ur`): 4 movies; Hindi (`hi`): 2 movies.

---

## F. Frontend Architecture

### F.1 Corrected Folder Structure

The v1 structure split JavaScript across 8 files (`app.js`, `data.js`, `movies.js`, `cinemas.js`, `showtimes.js`, `search.js`, `filters.js`, `watchlist.js`, `utils.js`). For a beginner, this is harder to debug than fewer, well-organized files. The revised structure merges related concerns while keeping responsibilities clear.

```
CineSphere/
│
├── index.html               ← Homepage
├── movies.html              ← Full movie catalogue
├── cinemas.html             ← Cinema listing
├── showtimes.html           ← Showtime browser
│
├── css/
│   ├── main.css             ← Design tokens (custom properties), resets, typography
│   ├── components.css       ← Cards, badges, buttons, modals, navbar
│   └── responsive.css       ← All @media queries
│
├── js/
│   ├── data.js              ← Loads and exports movies, cinemas, showtimes JSON
│   ├── render.js            ← Creates HTML elements for movies, cinemas, showtimes
│   ├── filters.js           ← Search, genre, language, and date filter logic
│   ├── ui.js                ← Modal control, navbar toggle, theme toggle
│   ├── utils.js             ← formatDate(), formatTime(), truncate(), debounce()
│   ├── index-page.js        ← Entry point for index.html (imports the modules above)
│   ├── movies-page.js       ← Entry point for movies.html
│   ├── cinemas-page.js      ← Entry point for cinemas.html
│   └── showtimes-page.js    ← Entry point for showtimes.html
│
├── data/
│   ├── movies.json
│   ├── cinemas.json
│   └── showtimes.json
│
└── assets/
    ├── images/
    │   ├── cinemas/         ← Cinema photos (use freely licensed images only)
    │   ├── placeholder.jpg  ← Fallback for missing posters
    │   └── tmdb-logo.svg    ← Download from TMDB attribution page
    └── icons/               ← SVG icons used in UI
```

Each HTML page loads only its own entry script. That script uses `import` to pull in `data.js`, `render.js`, `ui.js`, `filters.js` and `utils.js` as needed — do not add separate `<script>` tags for them:

```html
<!-- index.html — one entry point; it imports everything else -->
<script type="module" src="js/index-page.js"></script>
```

```javascript
// js/index-page.js
import { loadAllData } from "./data.js";
import { renderNowShowing, renderComingSoon, renderCinemaPreviews } from "./render.js";
import { initNavbar } from "./ui.js";
```

> [!WARNING]
> **Critical: You must use `type="module"` on script tags if you use `import`/`export`.**
> Without `type="module"`, the browser does not support ES module syntax and will throw a syntax error.
> Also: ES modules — like `fetch()` — are blocked by the `file://` protocol. You must use a local development server.

### F.2 How Data Flows

```
User opens index.html in browser (via Live Server)
    │
    ▼
<script type="module" src="js/index-page.js"> loads
    │
    ▼
data.js: fetch("data/movies.json")   → returns movies array
data.js: fetch("data/cinemas.json")  → returns cinemas array
data.js: fetch("data/showtimes.json")→ returns showtimes array
    │   (use Promise.all() to wait for all three)
    ▼
render.js: renderNowShowing(movies, showtimes)
  → finds movieIds that appear in showtimes
  → renders movie cards into the "Now Showing" DOM container

render.js: renderComingSoon(movies, showtimes)
  → finds movies with future releaseDate AND no showtime records
  → renders their cards

render.js: renderCinemaPreviews(cinemas)
  → renders 3 cinema cards on homepage
    │
    ▼
User types in search box
    │
    ▼
filters.js: handleSearch(event, movies, showtimes)
  → debounced: waits 300ms after last keystroke
  → filters movies array by title
  → re-renders cards via render.js
    │
    ▼
User clicks a movie card
    │
    ▼
ui.js: openMovieModal(movieId, movies)
  → finds movie object by id
  → sets modal content using textContent (not innerHTML for text fields)
  → sets modal img src for poster
  → shows modal
```

### F.3 Important JavaScript Notes for Beginners

**Loading all three JSON files together:**
```javascript
// data.js
export async function loadAllData() {
  const [moviesRes, cinemasRes, showtimesRes] = await Promise.all([
    fetch("data/movies.json"),
    fetch("data/cinemas.json"),
    fetch("data/showtimes.json")
  ]);
  const movies    = await moviesRes.json();
  const cinemas   = await cinemasRes.json();
  const showtimes = await showtimesRes.json();
  return { movies, cinemas, showtimes };
}
```

**Determining which movies have local screenings:**
```javascript
// render.js — separates release status from local screening status
function getNowShowingMovies(movies, showtimes) {
  // A movie is "now showing" only if it has at least one showtime record
  const moviesWithScreenings = new Set(showtimes.map(s => s.movieId));
  return movies.filter(movie => moviesWithScreenings.has(movie.id));
}

function getComingSoonMovies(movies, showtimes) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const moviesWithScreenings = new Set(showtimes.map(s => s.movieId));
  return movies.filter(movie =>
    movie.releaseDate > today && !moviesWithScreenings.has(movie.id)
  );
}
```

**Filtering movies (all filters combined):**
```javascript
// filters.js
function filterMovies(movies, showtimes, { query, genres, minRating, language, status }) {
  let result = movies;

  if (status === "now_showing") result = getNowShowingMovies(result, showtimes);
  if (status === "coming_soon") result = getComingSoonMovies(result, showtimes);

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(q));
  }

  if (genres.length > 0) {
    result = result.filter(m => genres.some(g => m.genres.includes(g)));
  }

  if (minRating > 0) {
    result = result.filter(m => m.tmdbRating >= minRating);
  }

  if (language && language !== "all") {
    result = result.filter(m => m.originalLanguage === language);
  }

  return result;
}
```

**Displaying time to users:**
```javascript
// utils.js
export function formatTime(time24) {
  // Input: "14:30" → Output: "2:30 PM"
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}
```

**Rendering cards safely (innerHTML vs textContent):**
```javascript
// render.js
function createMovieCard(movie) {
  // Create the structural skeleton with innerHTML (this is safe — no user data here)
  const card = document.createElement("div");
  card.className = "movie-card";
  card.dataset.id = movie.id;
  card.innerHTML = `
    <div class="card-poster">
      <img class="card-img" alt="" src="">
    </div>
    <div class="card-info">
      <div class="card-rating"></div>
      <h3 class="card-title"></h3>
      <div class="card-genres"></div>
    </div>
  `;

  // Set text and attributes using safe methods (not innerHTML for data from JSON)
  const img = card.querySelector(".card-img");
  img.src = movie.posterPath || "assets/images/placeholder.jpg";
  img.alt = movie.title; // alt text is safe to set via property

  card.querySelector(".card-rating").textContent = `⭐ ${movie.tmdbRating.toFixed(1)}`;
  card.querySelector(".card-title").textContent = movie.title;

  // Genre chips — create elements individually
  const genresEl = card.querySelector(".card-genres");
  movie.genres.slice(0, 2).forEach(genre => {
    const chip = document.createElement("span");
    chip.className = "badge";
    chip.textContent = genre; // textContent is safe
    genresEl.appendChild(chip);
  });

  card.addEventListener("click", () => openMovieModal(movie.id));
  return card;
}
```

> [!NOTE]
> **Why `textContent` instead of `innerHTML` for data?**
> If you write `element.innerHTML = movie.title` and the title somehow contained `<script>alert(1)</script>`, it would execute. `textContent` treats everything as plain text — it never executes HTML. For a local JSON demo the real risk is very low, but using `textContent` consistently is a good habit and shows the instructor you understand the distinction.

**Handling missing poster:**
```javascript
img.onerror = () => {
  img.src = "assets/images/placeholder.jpg";
  img.alt = "Poster not available";
};
```

**Joining showtimes with movies and cinemas for display:**
```javascript
// render.js
function getShowtimesWithDetails(showtimes, movies, cinemas) {
  return showtimes.map(showtime => {
    const movie  = movies.find(m => m.id === showtime.movieId);
    const cinema = cinemas.find(c => c.id === showtime.cinemaId);
    return { ...showtime, movie, cinema };
  }).filter(s => s.movie && s.cinema); // remove any with missing references
}
```

**Filtering showtimes by date:**
```javascript
function getShowtimesForDate(showtimes, dateString) {
  // dateString: "2026-11-05"
  return showtimes.filter(s => s.date === dateString);
}
```

**LocalStorage for watchlist (optional Phase 2):**
```javascript
const WATCHLIST_KEY = "cinesphere-watchlist";

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
  } catch {
    return []; // handle corrupted stored value
  }
}

function toggleWatchlist(movieId) {
  const list = getWatchlist();
  const index = list.indexOf(movieId);
  if (index === -1) list.push(movieId); else list.splice(index, 1);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}
```

### F.4 What Works Without Internet

Once movies, cinemas, and showtimes are saved to local JSON files:
- Search, filtering, and sorting work offline.
- Cinema and showtime pages work offline.
- **Movie poster and backdrop images DO require internet** if they are TMDB CDN URLs. To support fully offline demos, download the poster images during data preparation and store them locally in `assets/images/posters/`.

### F.5 Running the Project

```bash
# Option 1 — VS Code (Recommended for beginners)
# Right-click index.html → "Open with Live Server"

# Option 2 — Node.js live-server
npm install -g live-server
live-server CineSphere/

# Option 3 — Python (built in, no install required)
cd CineSphere/
python3 -m http.server 8000
# Then open http://localhost:8000 in the browser
```

> [!CAUTION]
> **Never open HTML files by double-clicking them during development.**
> `fetch()` and ES modules are both blocked by the `file://` protocol. Always use a local HTTP server. This is the most common mistake beginners make.

---

## G. Implementation Roadmap

*One consistent schedule. The day estimates assume focused work sessions of 3–5 hours. Total: 6 weeks, part-time. "Day N" means the Nth work session, not a calendar day, so a week holds a different number of sessions depending on its workload (Week 1: 4, Week 2: 4, Week 3: 3, Week 4: 5, Week 5: 3, Week 6: 6).*

### Week 1 — Foundation

**Step 1: Project setup (Day 1 — 2 hours)**
- Goal: Organized project that opens in a browser.
- Tasks: Create all folders and empty files. Install VS Code Live Server. Verify `fetch("data/movies.json")` works with 2 test records.
- Files created: Full folder structure, `index.html` (skeleton), `data/movies.json` (2 test records).
- Done when: Page opens at `localhost` without console errors.

**Step 2: Data collection and preparation (Days 2–4 — 6 hours total)**
- Goal: Three complete, internally consistent JSON files.
- Tasks:
  - Register for a TMDB API key at https://www.themoviedb.org/settings/api.
  - Browse TMDB to choose 20–25 movies for your demo (mix of recent releases and upcoming titles) and note their TMDB ids.
  - Write a small one-off script (Node or Python, kept outside the website folder, with the API key in an environment variable) that fetches `/movie/{id}`, `/movie/{id}/credits` and `/movie/{id}/videos` for each id and writes `movies.json` with the fields in Section E.2. This avoids hand-copying about 12 fields × 25 movies and keeps the key out of the site code.
  - Build full poster URLs in the script: `https://image.tmdb.org/t/p/w500/{poster_path}`.
  - Spot-check the generated `movies.json` by hand (genre names, trailer keys, missing posters).
  - Create `cinemas.json` using the 6 cinemas from Section E.3.
  - Create `showtimes.json` with ~60 records. Pick dates relative to your actual evaluation date (the 7 days starting the day before it), not fixed dates. Set every record's `isDemoData: true`.
  - Validation pass: check every `movieId` and `cinemaId` reference is correct.
- Files created: `data/movies.json`, `data/cinemas.json`, `data/showtimes.json`.
- Done when: All three files load without errors and every reference is valid.

### Week 2 — HTML Structure + CSS Design System

**Step 3: CSS design system (Days 5–6 — 4 hours)**
- Goal: Visual foundation with design tokens and reusable components.
- Tasks: Write `css/main.css` (custom properties, reset, typography, Google Fonts link). Write `css/components.css` (navbar, cards, badges, buttons, modal structure). Test static components in browser.
- Done when: You can view a static movie card in the browser and it looks polished.

**Step 4: HTML page structures (Days 7–8 — 4 hours)**
- Goal: All four pages with correct semantic HTML and placeholder sections.
- Tasks: Write `index.html`, `movies.html`, `cinemas.html`, `showtimes.html`. Add `<meta>` tags, page titles, Google Fonts `<link>`, TMDB attribution footer, demo disclaimer on `showtimes.html`. Add `<script type="module">` tags for JS files.
- Done when: All four pages render with correct structure and styling (placeholder content).

### Week 3 — Data Loading + Movie Cards

**Step 5: Data loading (Day 9 — 3 hours)**
- Goal: JSON files load and data is available to all pages.
- Tasks: Write `data.js` with `loadAllData()` using `Promise.all()`. Add `console.log()` to verify data loads. Write `utils.js` with `formatDate()`, `formatTime()`, `truncate()`.
- Done when: Console shows all three arrays loaded correctly.

**Step 6: Movie card rendering (Days 10–11 — 4 hours)**
- Goal: "Now Showing" and "Coming Soon" sections populated dynamically.
- Tasks: Write `render.js` with `createMovieCard()` using `textContent` for data. Write `getNowShowingMovies()` and `getComingSoonMovies()` functions. Render cards into their containers. Add `onerror` fallback for missing posters. Write `css/responsive.css` for card grid breakpoints.
- Done when: Homepage shows real movie cards from JSON, with correct poster images.

### Week 4 — Search, Filters, Movie Detail

**Step 7: Search and filters (Days 12–14 — 5 hours)**
- Goal: Users can find movies by title, genre, language, and release status.
- Tasks: Write `filters.js` with `filterMovies()` combining all filter dimensions. Add debounced search input event listener. Add genre chip toggle (multi-select). Add language and status selectors. Add "No results found" empty state with reset button. Wire all filters to re-render cards on change.
- Done when: Combining title search + genre + language filter works correctly and shows empty state when appropriate.

**Step 8: Movie detail (Days 15–16 — 4 hours)**
- Goal: Clicking any movie card opens a rich detail view.
- Tasks: Write `ui.js` with `openMovieModal()` and `closeMovieModal()`. Populate: backdrop, poster, title, rating, genres, runtime, overview, cast, director, release date. Use `textContent` for all text fields. Set `img.src` for images. Add trailer button (opens `https://www.youtube.com/watch?v={trailerKey}` in a new tab). Close modal on: X button click, Escape key, backdrop click.
- Done when: Clicking different movie cards shows correct data each time. Escape closes the modal.

### Week 5 — Cinemas, Showtimes, City Selector

**Step 9: Cinema page (Day 17 — 3 hours)**
- Goal: All 6 cinemas displayed as cards.
- Tasks: Render cinema cards from `cinemas.json`. Add city selector (default: Lahore). Filter cinema cards by selected city. Write empty state for "no cinemas in selected city." Add "View Showtimes" link for each cinema.
- Done when: 6 cinema cards appear. City selector filters them.

**Step 10: Showtimes page (Days 18–19 — 5 hours)**
- Goal: Showtimes browser with demo data disclaimer.
- Tasks: Load all three JSON files. Join showtimes with movie and cinema details. Group display by cinema (cinema name as header, movie rows below). Display individual screening times formatted as "2:30 PM" using `formatTime()`. Add date picker (default: first date in your demo data that has screenings). Add "no screenings available" empty state for selected date. Show demo disclaimer banner prominently at top.
- Done when: Selecting different dates filters the showtime list. Demo banner is clearly visible.

### Week 6 — Responsive Polish, Optional Features, Testing

**Step 11: Responsive layout (Day 20 — 3 hours)**
- Goal: All pages work correctly at mobile (375px), tablet (768px), and desktop (1024px+).
- Tasks: Complete `css/responsive.css`. Test hamburger navigation on mobile. Ensure modal is scrollable on small screens. Fix any horizontal scroll issues.

**Step 12: Optional features (Days 21–22 — 4 hours if time allows)**
- Watchlist: heart toggle on cards, saved to `localStorage`, survives page refresh.
- Dark/light theme: toggle button, CSS custom properties switch on `<body>` class change.
- Trailer embed: add YouTube iframe inside modal (optional — test cross-origin policy).

**Step 13: Final testing and demo preparation (Days 23–25 — 4 hours)**
- Run through the full Testing Checklist (Section I).
- Fix data inconsistencies.
- Add explanatory comments to each JS function.
- Prepare 5-minute demo walkthrough (see Section I for script).
- Confirm TMDB attribution appears on all pages.

---

### What to Cut If Time Is Limited

Cut in this order — the remaining features still demonstrate HTML/CSS/JS adequately:
1. Dark/light theme toggle
2. Watchlist `localStorage` (keep the heart icon visible but non-functional)
3. Showtimes grouping toggle (show by cinema only, drop the "by movie" option)
4. Date picker (show all demo data; explain date filtering exists in the code)
5. Genre filter (keep search bar at minimum)

The minimum viable demo still needs: homepage, movie cards, search, movie detail modal, cinema page, and showtimes page with disclaimer banner.

---

## H. UI and Design Plan

The UI design from v1 was strong and is retained here with minor corrections. The design goals remain: premium dark theme, South Asian entertainment platform feel, achievable with pure HTML/CSS/JavaScript.

### H.1 Design Philosophy

CineSphere should feel like a professional entertainment product, not a homework assignment. The visual reference points are:
- IMDb's cinematic dark theme and gold rating system
- BookMyShow's South Asian flair and city selector
- Fandango's location-first showtime discovery

### H.2 Color System (CSS Custom Properties)

```css
/* css/main.css — Design Tokens */
:root {
  /* Backgrounds */
  --color-bg-primary:    #0A0E1A;   /* Deep navy-black — page background */
  --color-bg-secondary:  #111827;   /* Dark navy — panels and sidebars */
  --color-bg-card:       #1A2235;   /* Card surface */
  --color-bg-overlay:    rgba(0, 0, 0, 0.7); /* Modal backdrop */

  /* Accent Colors */
  --color-accent-red:    #E50914;   /* Primary CTA — "Now Showing" */
  --color-accent-gold:   #F5C518;   /* Star ratings */
  --color-accent-cyan:   #06B6D4;   /* Secondary highlights — "Coming Soon" */

  /* Text */
  --color-text-primary:  #F8FAFC;   /* Headings and important labels */
  --color-text-secondary:#94A3B8;   /* Body text and metadata */
  --color-text-muted:    #475569;   /* Timestamps, minor labels */

  /* Borders */
  --color-border:        rgba(255, 255, 255, 0.08);

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;
}
```

### H.3 Typography

```html
<!-- Add to <head> of every HTML page -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

- **Headings (h1–h3):** `Outfit` — geometric, cinematic weight.
- **Body and UI text:** `Inter` — neutral, highly readable.
- **Base font size:** `16px`, with `clamp()` for responsive scaling on h1.

### H.4 Page Layouts (Corrected from v1)

**`index.html` — Homepage**
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: [🎬 CineSphere] [Movies] [Cinemas] [Showtimes]│
│          [🔍 Search]  (Phase 2: [🌙 Theme] [❤ Watchlist])│
├─────────────────────────────────────────────────────────┤
│  HERO: full-width backdrop of a featured movie          │
│  Gradient overlay → [Poster] Title, rating, genres      │
│  [▶ Trailer] button links to YouTube (opens new tab)    │
├─────────────────────────────────────────────────────────┤
│  SEARCH + QUICK FILTERS (inline, below hero)            │
│  [🔍 Search...] [Genre ▾] [Status ▾] [Language ▾]      │
├─────────────────────────────────────────────────────────┤
│  NOW SHOWING  ─────────────────── [Browse All →]        │
│  Horizontal scroll row of 5–6 movie cards               │
├─────────────────────────────────────────────────────────┤
│  COMING SOON  ─────────────────── [Browse All →]        │
│  Horizontal scroll row of 4–5 movie cards               │
├─────────────────────────────────────────────────────────┤
│  CINEMAS IN LAHORE ──────────────── [View All →]        │
│  Grid of 3 cinema cards (preview)                       │
├─────────────────────────────────────────────────────────┤
│  FOOTER: © CineSphere | TMDB Attribution | Demo Notice  │
└─────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **Correction from v1:** The hero "Add to Watchlist" button is moved to Phase 2 optional features. The trailer button now links to YouTube (opens in new tab) rather than embedding an iframe, which simplifies implementation and avoids iframe cross-origin issues.

**`movies.html` — Movie Catalogue**
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├─────────────────────────────────────────────────────────┤
│  PAGE HEADER: "Movies" | Results count: (24 found)     │
├─────────────────────────────────────────────────────────┤
│  FILTER BAR (horizontal on desktop, collapsible mobile) │
│  Status: [All][Now Showing][Coming Soon]                │
│  Genre: [Action][Horror][Drama]... (toggleable chips)   │
│  Language: [All][English][Urdu][Hindi]                  │
│  Sort: [Relevance ▾]                                    │
│                              [Reset Filters]            │
├─────────────────────────────────────────────────────────┤
│  MOVIE GRID (responsive: 4 cols → 2 cols → 1 col)      │
│  [Card] [Card] [Card] [Card]                           │
│  [Card] [Card] [Card] [Card]                           │
│  ── or ──                                               │
│  [Empty state: "No movies match your filters."]        │
│  [Reset Filters button]                                 │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

**Movie Detail Modal**
```
┌───────────────────────────────────────────────────────┐
│ [backdrop image — full modal width, 200px height]     │
│ [× Close]                              (top-right)    │
├───────────────────────────────────────────────────────┤
│ [Poster]  Title                                       │
│           ⭐ 7.3 (4,120 votes)                        │
│           2h 3m  ·  Released: Aug 14, 2024            │
│           Original language: English                  │
│           [Horror] [Science Fiction] [Action]         │
│                                                       │
│  Overview:                                            │
│  While scavenging the deep ends of...                 │
│                                                       │
│  Director: Fede Álvarez                               │
│  Cast: Cailee Spaeny, David Jonsson, Archie Renaux    │
│                                                       │
│  [▶ Watch Trailer ↗]   [🎟 View Showtimes]            │
└───────────────────────────────────────────────────────┘
```

**`cinemas.html`**
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├─────────────────────────────────────────────────────────┤
│  "Cinemas in" [Lahore ▾]  (city selector, default Lahore│
├─────────────────────────────────────────────────────────┤
│  CINEMA CARDS GRID (2-col desktop / 1-col mobile)       │
│  ┌────────────────────────────┐                         │
│  │ [Cinema Image]             │                         │
│  │ Cinepax Packages Mall      │                         │
│  │ 📍 Walton Road, Lahore     │                         │
│  │ cinepax.com [↗]           │                         │
│  │ [View Showtimes]           │                         │
│  └────────────────────────────┘                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

**`showtimes.html`**
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├─────────────────────────────────────────────────────────┤
│  ⚠️ DEMO DATA BANNER (styled, always visible)           │
│  "Showtimes shown are for demonstration purposes only   │
│   and do not represent actual cinema schedules."        │
├─────────────────────────────────────────────────────────┤
│  CONTROLS: [📅 Date: 2026-11-05]  [Cinema: All ▾]      │
│            → Show for date: [empty-state if no results] │
├─────────────────────────────────────────────────────────┤
│  GROUPED BY CINEMA                                      │
│  ──────────────────────────────────────────────────     │
│  🏛️ Cinepax Packages Mall                              │
│     Alien: Romulus  [2D · English]                     │
│     [11:00 AM] [2:30 PM] [6:00 PM] [9:30 PM]          │
│                                                         │
│     Deadpool & Wolverine  [3D · English]               │
│     [1:00 PM] [5:00 PM] [9:00 PM]                      │
│  ──────────────────────────────────────────────────     │
│  🏛️ Universal Cinemas Emporium Mall                     │
│     ...                                                 │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

> [!NOTE]
> The "By Movie / By Cinema" grouping toggle from v1 has been simplified. Start with "grouped by cinema" only. Adding the "by movie" grouping toggle is a Phase 2 optional polish item.

### H.5 Movie Card Design

```
┌──────────────────┐
│                  │  ← Poster (2:3 aspect ratio, object-fit: cover)
│  [Horror]        │  ← Genre chip (top-left overlay)
│                  │
│                  │
│                  │
├──────────────────┤
│  ⭐ 7.3          │
│  Alien: Romulus  │  ← textContent (never innerHTML)
│  [Horror][Sci-Fi]│  ← Genre chips (2 max)
│  2h 3m           │
└──────────────────┘
  Hover: slight lift + border glow
```

### H.6 Responsive Breakpoints

| Min Width | Movie Grid | Cinema Grid | Nav |
|---|---|---|---|
| Default (< 480px) | 1 column | 1 column | Hamburger |
| 480px | 2 columns | 1 column | Hamburger |
| 768px | 3 columns | 2 columns | Full nav |
| 1024px+ | 4 columns | 3 columns | Full nav |

---

## I. Testing Checklist

Run through every item before the evaluation. For each test, the expected result is stated.

### Data and Content

- [ ] All movie cards display the correct poster, title, and rating. **Expected:** Each card matches its record in `movies.json`.
- [ ] "Now Showing" shows only movies that have at least one record in `showtimes.json`. **Expected:** No movie appears here unless a showtime record references its `id`.
- [ ] "Coming Soon" shows only movies with a future `releaseDate` and no showtime records. **Expected:** Released movies or movies with screenings do not appear here.
- [ ] Every showtime record's `movieId` matches a movie. **Expected:** No "Unknown Movie" appears anywhere on the showtimes page.
- [ ] Every showtime record's `cinemaId` matches a cinema. **Expected:** No "Unknown Cinema" appears.
- [ ] No demo showtime references a movie whose `releaseDate` has not yet passed. **Expected:** All screened movies are already released.

### Search and Filters

- [ ] Typing a partial title ("Ali") returns only movies containing that text. **Expected:** Instant filter, no page reload.
- [ ] Clearing the search restores all movies. **Expected:** All movies visible again.
- [ ] Typing a string that matches no movie shows the empty state. **Expected:** A helpful message and a "Reset" button appear.
- [ ] Selecting genre "Horror" shows only Horror movies. **Expected:** Non-Horror movies disappear.
- [ ] Selecting multiple genres (Horror + Action) shows movies matching any selected genre. **Expected:** Movies tagged with either genre appear.
- [ ] Combining search text and genre filter works correctly. **Expected:** Only movies matching both criteria appear.
- [ ] Clicking "Reset Filters" clears all active filters. **Expected:** All movies visible, all chips deselected, search cleared.
- [ ] Language filter works independently. **Expected:** Selecting "Urdu" shows only movies with `originalLanguage: "ur"`.

### Movie Detail

- [ ] Clicking a movie card opens the detail modal or page. **Expected:** The correct movie's data is displayed.
- [ ] Clicking a different movie card shows different data. **Expected:** Title, poster, overview, and cast update correctly.
- [ ] The trailer button links to the correct YouTube URL. **Expected:** Correct video opens in a new tab (or is labeled as unavailable if no `trailerKey`).
- [ ] The modal closes when pressing Escape. **Expected:** Modal disappears without error.
- [ ] The modal closes when clicking the X button. **Expected:** Same.
- [ ] The modal closes when clicking outside the modal content. **Expected:** Same.

### Cinemas

- [ ] All 6 cinemas appear on the cinemas page. **Expected:** 6 cards rendered from `cinemas.json`.
- [ ] The city selector defaults to "Lahore". **Expected:** All 6 cinemas are visible on page load.
- [ ] Selecting a city with no data shows an empty state. **Expected:** Message: "No cinemas found in [city]."
- [ ] Each cinema card links correctly to its official website. **Expected:** Link opens official website in new tab.

### Showtimes

- [ ] The demo data banner is clearly visible on the showtimes page. **Expected:** Banner cannot be missed; uses a warning color.
- [ ] Selecting a date that has screenings shows results. **Expected:** Showtime groups for that date appear.
- [ ] Selecting a date with no screenings shows an empty state. **Expected:** "No screenings available for this date." message appears.
- [ ] Times are displayed in 12-hour format (e.g., "2:30 PM"). **Expected:** No times shown as "14:30" to the user.

### Responsiveness

- [ ] Homepage hero section looks correct at 375px width. **Expected:** No horizontal scroll, text readable.
- [ ] Movie grid is 1 column at 375px. **Expected:** Single column layout.
- [ ] Movie grid is 2 columns at 480px. **Expected:** Two-column layout.
- [ ] Movie grid is 4 columns at 1024px+. **Expected:** Four-column layout.
- [ ] Navbar collapses to hamburger on mobile. **Expected:** Menu icon appears; clicking it shows nav links.
- [ ] Movie detail modal is fully scrollable on small screens. **Expected:** Can scroll through long overview on iPhone SE.

### Error Handling

- [ ] A movie record with no `posterPath` shows the placeholder image. **Expected:** `assets/images/placeholder.jpg` displayed; no broken image icon.
- [ ] A movie with a broken poster URL (simulate by temporarily editing JSON) shows the placeholder. **Expected:** `onerror` handler fires and swaps image.
- [ ] The console has no red errors during normal browsing. **Expected:** Clean console.
- [ ] Refreshing the page does not break any feature. **Expected:** All features work on reload.
- [ ] If `localStorage` is available and contains a watchlist, it loads correctly on page refresh. (Phase 2 only.) **Expected:** Watchlist state restored.

### Accessibility

- [ ] All images have a meaningful `alt` attribute. **Expected:** Poster images use the movie title; placeholder uses "Poster not available".
- [ ] All interactive buttons (nav links, filter chips, close buttons) are reachable with the Tab key. **Expected:** Keyboard-only navigation works for main features.
- [ ] Focused elements have a visible focus indicator. **Expected:** No CSS rule hides `outline` without a custom replacement.
- [ ] TMDB attribution notice is present on every page. **Expected:** Text reads: "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB."

---

### How to Present to Your Instructor (Demo Script)

1. Open `index.html` via Live Server, not by double-clicking.
2. Show the homepage hero, "Now Showing" rows, and "Coming Soon" rows. Explain that cards are rendered by JavaScript reading `movies.json`.
3. Type a partial movie title in the search box. Show instant filtering.
4. Select a genre chip. Show how the filter combines with the search.
5. Click on a movie card. Walk through the modal — point out that each field comes from a specific JSON property. Show that clicking a different card changes the content.
6. Navigate to Cinemas. Show 6 cards. Explain that these are modeled on real Lahore cinemas but the data is from `cinemas.json`.
7. Navigate to Showtimes. Immediately point out the demo data disclaimer. Explain the date picker. Show that each screening row comes from a joined query across all three JSON files.
8. Open DevTools (F12). Go to the Network tab and reload — show the three JSON files loading. Go to the Console tab — show it is free of errors.
9. Resize the browser window to mobile width (DevTools → Toggle Device Toolbar). Show the responsive layout and hamburger menu.
10. If watchlist is implemented, demonstrate saving a movie and refreshing — show `localStorage` persistence in DevTools → Application → Local Storage.

---

## J. Future Improvements

These features are not needed for the initial evaluation but explain how CineSphere could grow:

### Making Showtimes Real
The current gap is that no free, public, documented API exists for Pakistani cinema schedules. Future options include:
1. **Formal data agreement with Cinepax/CineStar/Universal Cinemas** — their development teams would need to provide an API or data feed. This requires business negotiation, not engineering.
2. **MovieGlu API** (https://www.movieglu.com) — provides showtimes in some markets. Pakistan coverage needs to be confirmed with them directly. Requires a paid plan.
3. **Backend that scrapes with permission** — If a cinema chain grants explicit permission for data access, a backend service could collect and serve showtimes. This is not a frontend task.

### Moving to a Live API (TMDB at Runtime)
In the current design, the TMDB API key is used once for data collection and never embedded in the website. If future requirements allow a backend:
- A Node.js/Express proxy server could make TMDB API calls server-side, keeping the key secret.
- The frontend would call your backend (`/api/now-playing`) instead of TMDB directly.
- Platforms like Vercel or Netlify offer free serverless functions that can serve as this proxy.

### Adding More Cities
The architecture already supports multiple cities — `cinemas.json` has a `city` field and the city selector can be extended with additional options. The constraint is that cinema data for other cities (Karachi, Islamabad, Rawalpindi) would need to be collected and verified using the same process used for Lahore.

### Replacing Local Data Without Rewriting the UI
The data layer is cleanly separated in `data.js`. When real data sources become available, only `data.js` needs to change — switching from `fetch("data/movies.json")` to `fetch("/api/movies")` does not require rewriting any rendering or filtering code. This is why the separation of concerns in the folder structure matters.

---

## K. Remaining Uncertainties

| Uncertainty | Safe Practical Workaround |
|---|---|
| Exact cinema screen counts at Packages Mall, Xinhua Mall, and other branches | Omit screen count from cinema cards. Do not display unverified numbers. |
| Exact cinema addresses (addresses may change) | Verify against each cinema's current official website before demo. Display only general area if in doubt. |
| Cinema latitude/longitude for distance calculation | Omit coordinates and distance features from Phase 1. If added in Phase 2, obtain coordinates from a verified map service (e.g., Google Maps "Share → Copy coordinates") and document the source. |
| Pakistan-specific TMDB data via `region=PK` parameter | The docs do not explain what `region` does for `now_playing`; it certainly does not give local showtimes. It may return fewer results than `region=US`. During data collection, if `now_playing?region=PK` returns too few results, supplement with `popular` or `upcoming` endpoints or use US release data and note that these are global releases, not specifically Pakistani cinema releases. |
| MovieGlu Pakistan coverage | Unconfirmed without signing up for an evaluation key. Not recommended for this project. |
| Whether specific Kaggle datasets are current and licensed for this use | Do not use any dataset without checking its specific license on its Kaggle dataset page. |
| Whether TMDB poster CDN URLs remain stable for 6+ months | Risk is low (TMDB has maintained these URLs for years), but download critical poster images locally if fully offline demo is required. |

---

## L. References

| # | Source | URL | Used For | Status |
|---|---|---|---|---|
| 1 | TMDB Developer Documentation | https://developer.themoviedb.org/ | API endpoints, image URLs, authentication | ✅ Verified primary source |
| 2 | TMDB API Terms of Use | https://www.themoviedb.org/api-terms-of-use | Attribution requirements, commercial use restrictions, caching limits | ✅ Verified — read directly |
| 3 | TMDB Branding / Attribution | https://www.themoviedb.org/about/logos-attribution | Logo download and branding rules | ✅ Verified primary source |
| 4 | TMDB `now_playing` endpoint | https://developer.themoviedb.org/reference/movie-now-playing-list | Endpoint parameters, response format, limitations | ✅ Verified — read directly |
| 5 | TMDB `upcoming` endpoint | https://developer.themoviedb.org/reference/movie-upcoming-list | Upcoming release data | ✅ Verified primary source |
| 6 | Cinepax Official Website | https://cinepax.com | Cinema name, Packages Mall branch, Lahore | ✅ Verified |
| 7 | CineStar Official Website | https://cinestar.pk/Browsing/Cinemas | Three Lahore branch names and addresses | ✅ Verified |
| 8 | Universal Cinemas Official Website | https://universalcinemas.com | Emporium Mall branch | ✅ Verified (location only) |
| 9 | Nishat Emporium Mall | https://nishatemporium.com | Mall address (cross-checked with Graana and Kupi directory listings) | ⚠️ Directory-confirmed |
| 10 | Raiha CineGold Plex Official Website | https://www.cinegoldplex.com | Lahore site exists; street address from Cinema Treasures / Graana | ⚠️ Address third-party |
| 11 | IMDb | https://www.imdb.com | UI reference — card design, watchlist, dark theme | Reference only |
| 12 | Fandango | https://www.fandango.com | UI reference — location selector, showtime UX | Reference only |
| 13 | BookMyShow | https://in.bookmyshow.com | UI reference — South Asian entertainment platform patterns | Reference only |
| 14 | MDN — Geolocation API | https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API | Geolocation implementation guidance | ✅ Verified MDN docs |
| 15 | web.dev — Secure Contexts | https://web.dev/articles/secure-contexts | HTTPS / localhost geolocation requirement | ✅ Verified |
| 16 | Google Fonts | https://fonts.google.com | Outfit + Inter typography | ✅ Verified |
| 17 | MovieGlu | https://www.movieglu.com | Showtime API evaluation tier and pricing model | ⚠️ Partially verified — pricing requires direct inquiry |

---

*Document version 2.0 | Prepared: October 2026*
*CineSphere — Web Technology Course Project, University Semester*

*Research conducted using live primary sources. All claims are marked with their verification status.*
*TMDB attribution — this planning document uses TMDB research for educational purposes.*
*The website built from this plan must display: "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB."*
