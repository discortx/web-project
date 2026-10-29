// DOM builders shared by every page. Data goes in through textContent/properties, never innerHTML.
import { el, yearOf, ratingOf, dateParts, formatDate, formatTime, formatRuntime, todayISO } from "./utils.js";
import { icon } from "./icons.js";
import { createKeyArt } from "./keyart.js";
import { tmdbSrcset, POSTER_WIDTHS, BACKDROP_WIDTHS } from "./images.js";
import { isUnconfirmedDate } from "./data.js";

export const movieUrl = id => `movie.html?id=${encodeURIComponent(id)}`;
export const cinemaUrl = id => `cinema.html?id=${encodeURIComponent(id)}`;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- imagery
// Poster image, or composed key art when the film has no poster yet (or the image fails to load).
export function createPoster(movie, { eager = false } = {}) {
  const frame = el("div", "poster");
  const showArt = () => {
    frame.querySelector("img")?.remove();
    frame.appendChild(createKeyArt(movie, "poster"));
  };
  if (movie.posterPath) {
    const img = el("img");
    img.alt = `${movie.title} poster`;
    img.width = 400;
    img.height = 600;
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.addEventListener("error", showArt, { once: true });
    const posterSet = tmdbSrcset(movie.posterPath, POSTER_WIDTHS);
    if (posterSet) { img.srcset = posterSet; img.sizes = "(max-width: 640px) 45vw, 220px"; }
    img.src = movie.posterPath;
    frame.appendChild(img);
  } else {
    showArt();
  }
  return frame;
}

// 16:9 still: the film's backdrop, or key art. kind: "thumb" | "wide"
export function createStill(movie, { kind = "thumb", eager = false } = {}) {
  const frame = el("div", "still");
  const showArt = () => {
    frame.querySelector("img")?.remove();
    frame.appendChild(createKeyArt(movie, kind));
  };
  if (movie.backdropPath) {
    const img = el("img");
    img.alt = "";
    img.width = 1280;
    img.height = 720;
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.addEventListener("error", showArt, { once: true });
    const stillSet = tmdbSrcset(movie.backdropPath, BACKDROP_WIDTHS);
    if (stillSet) { img.srcset = stillSet; img.sizes = "(max-width: 860px) 100vw, 600px"; }
    img.src = movie.backdropPath;
    frame.appendChild(img);
  } else {
    showArt();
  }
  return frame;
}

// ---------------------------------------------------------------- cards
export function posterCard(movie, { tag = "", showtimesLink = false } = {}) {
  const card = el("article", "poster-card");
  const link = el("a", "poster-card__link");
  link.href = movieUrl(movie.id);
  link.appendChild(createPoster(movie));

  const body = el("div", "poster-card__body");
  body.appendChild(el("h3", "poster-card__title", movie.title));
  const meta = el("p", "poster-card__meta");
  meta.append([yearOf(movie), movie.genres[0]].filter(Boolean).join(" · "));
  const rating = ratingOf(movie);
  if (rating) meta.append(" · ", el("span", "score", `★ ${rating.toFixed(1)}`));
  body.appendChild(meta);
  if (tag) body.appendChild(el("p", "poster-card__tag", tag));
  link.appendChild(body);
  card.appendChild(link);

  if (showtimesLink) {
    const a = el("a", "link-arrow");
    a.href = `${movieUrl(movie.id)}#showtimes`;
    a.append("Showtimes", icon("arrow"));
    card.appendChild(a);
  }
  return card;
}

// Upcoming release: the date leads, then the still.
export function stillCard(movie) {
  const card = el("article", "still-card");
  const link = el("a", "still-card__link");
  link.href = movieUrl(movie.id);

  const date = el("div", "still-card__date");
  if (movie.releaseDate) {
    const { day, month } = dateParts(movie.releaseDate);
    date.append(el("span", "still-card__day", `${day} ${month}`), el("span", "still-card__when", movie.releaseDate.slice(0, 4)));
  } else {
    date.append(el("span", "still-card__day", "TBA"), el("span", "still-card__when", "Date to be announced"));
  }
  link.append(date, createStill(movie));
  link.appendChild(el("h3", "still-card__title", movie.title));
  link.appendChild(el("p", "still-card__meta", [movie.genres.slice(0, 2).join(" / "), formatRuntime(movie.runtimeMinutes)].filter(Boolean).join(" · ")));
  if (movie.releaseDate && isUnconfirmedDate(movie)) link.appendChild(el("span", "note-flag", "Date unconfirmed"));
  card.appendChild(link);
  return card;
}

export function metaRow(items) {
  const list = el("ul", "meta-row");
  items.filter(Boolean).forEach(text => list.appendChild(el("li", "", text)));
  return list;
}

// ---------------------------------------------------------------- states
export function emptyState({ title, text, action }) {
  const box = el("div", "state");
  box.setAttribute("role", "status");
  box.append(el("h3", "", title), el("p", "", text));
  if (action) {
    const control = el(action.href ? "a" : "button", action.href ? "link-arrow" : "btn btn--ghost btn--small", action.label);
    if (action.href) control.href = action.href;
    else { control.type = "button"; control.addEventListener("click", action.onClick); }
    box.appendChild(control);
  }
  return box;
}

export function errorState({ title = "We couldn't load this", text = "Something went wrong while loading the data.", onRetry } = {}) {
  const box = el("div", "state");
  box.setAttribute("role", "alert");
  box.append(el("h3", "", title), el("p", "", text));
  if (onRetry) {
    const retry = el("button", "btn btn--ghost btn--small", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () => {
      retry.disabled = true;
      retry.textContent = "Loading…";
      onRetry();
    });
    box.appendChild(retry);
  }
  return box;
}

export const skeletons = (count, wide = false) => Array.from({ length: count }, () => el("div", wide ? "skeleton skeleton--wide" : "skeleton"));

// ---------------------------------------------------------------- horizontal rail
export function initRail(rail, prev, next) {
  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth - 1;
    prev.disabled = rail.scrollLeft <= 0;
    next.disabled = rail.scrollLeft >= max;
  };
  const step = direction => rail.scrollBy({ left: direction * rail.clientWidth * 0.85, behavior: reducedMotion() ? "auto" : "smooth" });
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  let frame = 0;
  rail.addEventListener("scroll", () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);
  update();
  return update;
}

// ---------------------------------------------------------------- scroll reveal
// Elements are only hidden once this function has taken control of them, so content never stays invisible if it fails.
export function revealIn(root = document) {
  if (!("IntersectionObserver" in window) || reducedMotion()) return;
  const targets = [...root.querySelectorAll("[data-reveal]:not(.reveal-ready)")];
  if (!targets.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); observer.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px" });
  targets.forEach((target, i) => {
    target.classList.add("reveal-ready");
    target.style.setProperty("--delay", `${(i % 6) * 60}ms`);
    observer.observe(target);
  });
}

// ---------------------------------------------------------------- showtime panel
// mode "movie": one film across cinemas. mode "cinema": one cinema across films.
export function createShowtimePanel({ mode, subject, showtimes, cinemaById, movieById, emptyText }) {
  const panel = el("div", "panel");
  const list = showtimes.filter(s => (mode === "movie" ? s.movieId === subject.id : s.cinemaId === subject.id));
  if (!list.length) {
    panel.appendChild(emptyState({ title: "No screenings scheduled", text: emptyText }));
    return panel;
  }

  const dates = [...new Set(list.map(s => s.date))].sort();
  let day = dates.includes(todayISO()) ? todayISO() : dates[0];
  let filmId = "";

  const controls = el("div", "panel__controls");
  const strip = el("div", "day-strip");
  strip.setAttribute("role", "group");
  strip.setAttribute("aria-label", "Choose a date");
  dates.forEach(date => {
    const { weekday, day: num, month } = dateParts(date);
    const btn = el("button", "day");
    btn.type = "button";
    btn.dataset.date = date;
    btn.setAttribute("aria-label", formatDate(date));
    btn.append(el("span", "day__dow", weekday), el("span", "day__num", num), el("span", "day__mon", month));
    btn.addEventListener("click", () => { day = date; render(); });
    strip.appendChild(btn);
  });
  controls.appendChild(strip);

  if (mode === "cinema") {
    const field = el("div", "field");
    const label = el("label", "", "Film");
    label.htmlFor = "panel-film";
    const select = el("select");
    select.id = "panel-film";
    select.appendChild(new Option("All films", ""));
    [...new Set(list.map(s => s.movieId))].map(id => movieById.get(id)).sort((a, b) => a.title.localeCompare(b.title))
      .forEach(m => select.appendChild(new Option(m.title, String(m.id))));
    select.addEventListener("change", () => { filmId = select.value; render(); });
    field.append(label, select);
    controls.appendChild(field);
  }

  const results = el("div", "panel__results");
  results.setAttribute("aria-live", "polite");
  const note = el("p", "panel__note");
  note.append(el("strong", "", "Demonstration schedule. "), "These are not live cinema listings and nothing here can be booked. Check the cinema's own website for real times and tickets.");

  function render() {
    strip.querySelectorAll(".day").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.date === day)));
    const todays = list.filter(s => s.date === day && (!filmId || String(s.movieId) === filmId));
    results.replaceChildren();
    if (!todays.length) {
      results.appendChild(emptyState({ title: "No screenings on this date", text: mode === "cinema" && filmId ? "Try another date or choose All films." : "Try another date." }));
      return;
    }
    const groups = new Map();
    todays.forEach(s => {
      const key = mode === "movie" ? s.cinemaId : s.movieId;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    });
    [...groups.entries()].forEach(([key, shows]) => {
      const group = el("section", "showtime-group");
      const head = el("div");
      const title = el("h3");
      const link = el("a");
      if (mode === "movie") {
        const cinema = cinemaById.get(key);
        link.href = cinemaUrl(cinema.id);
        link.textContent = cinema.name;
        head.append(title, el("p", "showtime-group__sub", cinema.area));
        title.appendChild(link);
        if (cinema.officialWebsite) {
          const site = el("a", "showtime-group__site");
          site.href = cinema.officialWebsite;
          site.target = "_blank";
          site.rel = "noopener noreferrer";
          site.append("Cinema website ", icon("external"));
          head.appendChild(site);
        }
      } else {
        const movie = movieById.get(key);
        link.href = movieUrl(movie.id);
        link.textContent = movie.title;
        title.appendChild(link);
        head.append(title, el("p", "showtime-group__sub", [formatRuntime(movie.runtimeMinutes), movie.genres[0]].filter(Boolean).join(" · ")));
      }
      const stubs = el("div", "stub-list");
      shows.sort((a, b) => a.time.localeCompare(b.time)).forEach(s => {
        const stub = el("div", "stub");
        stub.append(el("span", "stub__time", formatTime(s.time)), el("span", "stub__info", `${s.format} · ${s.screeningLanguage}`));
        stubs.appendChild(stub);
      });
      group.append(head, stubs);
      results.appendChild(group);
    });
  }

  panel.append(controls, results, note);
  render();
  return panel;
}


// ---------------------------------------------------------------- hero image and cinema rows
// Large image behind a hero: the film's backdrop, or its key art. Returns { node, isArt }.
export function createHeroMedia(movie) {
  const art = () => createKeyArt(movie, matchMedia("(max-width: 860px)").matches ? "poster" : "wide");
  if (!movie.backdropPath) return { node: art(), isArt: true };
  const img = el("img");
  img.alt = "";
  img.width = 1280;
  img.height = 720;
  img.decoding = "async";
  img.fetchPriority = "high"; // the hero image is the largest paint on the page, so it is never lazy-loaded
  img.addEventListener("error", () => img.replaceWith(art()), { once: true });
  const heroSet = tmdbSrcset(movie.backdropPath, BACKDROP_WIDTHS);
  if (heroSet) { img.srcset = heroSet; img.sizes = "100vw"; }
  img.src = movie.backdropPath;
  return { node: img, isArt: false };
}

// One row of the cinema directory. stats: { screenings, films }
export function cinemaRow(cinema, index, stats) {
  const row = el("li", "cinema-row");
  row.appendChild(el("span", "cinema-row__index", String(index + 1).padStart(2, "0")));

  const name = el("div");
  const heading = el("h3", "cinema-row__name");
  const link = el("a", "", cinema.name);
  link.href = cinemaUrl(cinema.id);
  heading.appendChild(link);
  name.append(heading, el("p", "cinema-row__area", cinema.area));
  row.appendChild(name);

  row.appendChild(el("p", "cinema-row__address", cinema.address));

  const stat = el("p", "cinema-row__stat");
  stat.append(el("strong", "", String(stats.screenings)), stats.screenings === 1 ? "demo screening" : "demo screenings");
  row.appendChild(stat);

  const links = el("div", "cinema-row__links");
  const showtimes = el("a", "link-arrow");
  showtimes.href = cinemaUrl(cinema.id);
  showtimes.append("Showtimes", icon("arrow"));
  links.appendChild(showtimes);
  row.appendChild(links);
  return row;
}

export function cinemaStats(cinemaId, showtimes) {
  const list = showtimes.filter(s => s.cinemaId === cinemaId);
  return { screenings: list.length, films: new Set(list.map(s => s.movieId)).size };
}
