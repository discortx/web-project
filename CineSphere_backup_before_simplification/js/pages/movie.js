import { initApp, getCity } from "../app.js";
import { loadCatalog } from "../api.js";
import { scopeFor, relatedMovies, getSaved, toggleSaved, isUnconfirmedDate } from "../data.js";
import { el, formatDate, formatRuntime, languageName, ratingOf, yearOf, readParams, todayISO } from "../utils.js";
import { icon } from "../icons.js";
import { createPoster, createHeroMedia, createShowtimePanel, posterCard, metaRow, emptyState, errorState } from "../components.js";

initApp();

const root = document.getElementById("movie-root");

// A valid id is a whole number written with digits only ("3", not "3abc", "-1" or "").
function parseId(raw) {
  return /^\d+$/.test(raw || "") ? Number(raw) : null;
}

async function render() {
  const id = parseId(readParams().get("id"));
  if (id === null) return notFound("That film link isn't valid", "The address is missing a film number, or the number isn't valid.");

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    root.replaceChildren(el("div", "container section section--last"));
    root.firstElementChild.appendChild(errorState({ title: "We couldn't load this film", text: "The film data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: render }));
    return;
  }

  const movie = catalog.movieById.get(id);
  if (!movie) return notFound("We couldn't find that film", `There is no film with the number ${id} in the catalogue.`);

  document.title = `${movie.title} (${yearOf(movie) || "film"}) | CineSphere`;
  const city = getCity();
  const scope = scopeFor(catalog, city);
  root.replaceChildren(buildHero(movie), buildBody(movie, catalog, scope, city));
  // Honour #showtimes when arriving from a poster card.
  if (location.hash === "#showtimes") document.getElementById("showtimes")?.scrollIntoView();
}

function notFound(title, text) {
  document.title = "Film not found | CineSphere";
  const wrap = el("div", "container section section--last");
  wrap.appendChild(emptyState({ title, text, action: { label: "Discover films", href: "discover.html" } }));
  root.replaceChildren(wrap);
}

function buildHero(movie) {
  const hero = el("header", "movie-hero");
  const media = el("div", "hero__media");
  media.appendChild(createHeroMedia(movie).node);

  const inner = el("div", "container");
  const back = el("a", "link-arrow movie-hero__back");
  back.href = "discover.html";
  back.append(icon("prev"), "Back to Discover");
  inner.append(back, el("h1", "", movie.title), metaRow([yearOf(movie), formatRuntime(movie.runtimeMinutes), movie.genres.slice(0, 3).join(", "), languageName(movie.originalLanguage)]));
  hero.append(media, inner);
  return hero;
}

function buildBody(movie, catalog, scope, city) {
  const layout = el("div", "container movie-layout");

  // ---- left: poster and save
  const aside = el("aside", "movie-aside");
  aside.appendChild(createPoster(movie, { eager: true }));

  // ---- right: story, actions, facts
  const main = el("div", "movie-main");
  main.appendChild(el("p", "lede", movie.overview || "No synopsis is available for this film yet."));

  const actions = el("div", "movie-actions");
  if (movie.trailerKey) {
    const trailer = el("a", "btn");
    trailer.href = `https://www.youtube.com/watch?v=${encodeURIComponent(movie.trailerKey)}`;
    trailer.target = "_blank";
    trailer.rel = "noopener noreferrer";
    trailer.append(icon("play"), "Watch trailer");
    actions.appendChild(trailer);
  } else {
    // No trailer id in the data: offer a clearly labelled YouTube search instead of a fake player.
    const search = el("a", "btn");
    search.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${yearOf(movie)} official trailer`)}`;
    search.target = "_blank";
    search.rel = "noopener noreferrer";
    search.append("Find trailer on YouTube", icon("external"));
    actions.appendChild(search);
  }
  actions.appendChild(saveButton(movie));
  main.appendChild(actions);

  main.appendChild(buildFacts(movie));

  // ---- showtimes
  const times = el("section", "movie-block");
  times.id = "showtimes";
  times.appendChild(el("h2", "", `Showtimes in ${city}`));
  const hasCinemas = scope.cinemas.length > 0;
  const emptyText = hasCinemas
    ? (movie.releaseDate > todayISO() ? "This film hasn't been released yet, so it has no screenings." : "This film isn't in the demonstration schedule.")
    : `CineSphere doesn't have verified cinema data for ${city} yet.`;
  times.appendChild(createShowtimePanel({ mode: "movie", subject: movie, showtimes: scope.showtimes, cinemaById: catalog.cinemaById, movieById: catalog.movieById, emptyText }));
  main.appendChild(times);

  // ---- related films
  const related = relatedMovies(movie, catalog.movies, 4);
  if (related.length) {
    const block = el("section", "movie-block");
    block.appendChild(el("h2", "", "More like this"));
    const grid = el("div", "poster-grid");
    related.forEach(m => grid.appendChild(posterCard(m)));
    block.appendChild(grid);
    main.appendChild(block);
  }

  if (movie.dataSource !== "tmdb") {
    const note = el("p", "notice notice--spaced", "Details on this page come from CineSphere's demonstration dataset. They are placeholders until the film data is synced from TMDB, and ratings are left out for that reason.");
    main.appendChild(note);
  }

  layout.append(aside, main);
  return layout;
}

function saveButton(movie) {
  const button = el("button", "btn btn--ghost");
  button.type = "button";
  const paint = () => {
    const saved = getSaved().includes(movie.id);
    button.setAttribute("aria-pressed", String(saved));
    button.replaceChildren(icon("heart"), saved ? "Saved" : "Save film");
  };
  button.addEventListener("click", () => { toggleSaved(movie.id); paint(); });
  paint();
  return button;
}

function buildFacts(movie) {
  const facts = el("dl", "facts");
  const rating = ratingOf(movie);
  const release = movie.releaseDate
    ? `${formatDate(movie.releaseDate)}${movie.releaseDate > todayISO() && isUnconfirmedDate(movie) ? " (date unconfirmed)" : ""}`
    : "To be announced";
  const rows = [
    ["Director", movie.director],
    ["Release", release],
    ["Runtime", formatRuntime(movie.runtimeMinutes)],
    ["Language", languageName(movie.originalLanguage)],
    ["Rating", rating ? `${rating.toFixed(1)} / 10 on TMDB` : ""],
    ["Genres", movie.genres.join(", ")],
    ["Cast", movie.cast.join(", "), true]
  ];
  rows.filter(([, value]) => value).forEach(([label, value, wide]) => {
    const row = el("div", wide ? "wide" : "");
    row.append(el("dt", "", label), el("dd", "", value));
    facts.appendChild(row);
  });
  return facts;
}

document.addEventListener("citychange", render);
window.addEventListener("hashchange", () => { if (location.hash === "#showtimes") document.getElementById("showtimes")?.scrollIntoView(); });
render();
