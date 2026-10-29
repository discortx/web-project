import { initApp, getCity } from "../app.js";
import { loadCatalog } from "../api.js";
import { scopeFor, nowShowing, comingSoon, screeningCounts } from "../data.js";
import { el, formatRuntime, languageName, yearOf, plural, todayISO } from "../utils.js";
import { movieUrl, posterCard, stillCard, createHeroMedia, metaRow, emptyState, errorState, skeletons, initRail, revealIn, cinemaRow, cinemaStats } from "../components.js";

initApp();

const $ = id => document.getElementById(id);
const rail = $("now-rail");
const railControls = $("rail-controls");
const railUpdate = initRail(rail, $("rail-prev"), $("rail-next"));

async function render() {
  rail.replaceChildren(...skeletons(6));
  $("upcoming-grid").replaceChildren(...skeletons(4, true));

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    showError();
    return;
  }

  const city = getCity();
  const scope = scopeFor(catalog, city);
  const showing = nowShowing(catalog.movies, scope.showtimes);
  const upcoming = comingSoon(catalog.movies, catalog.showtimes);

  renderHero(catalog, scope, showing);
  renderRail(showing, scope, city);
  renderUpcoming(upcoming);
  renderSpotlight(showing);
  renderCinemas(scope, city);
  revealIn(document);
}

function showError() {
  const retry = () => render();
  const box = errorState({ title: "We couldn't load the films", text: "The film data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: retry });
  rail.replaceChildren(box);
  railControls.hidden = true;
  $("upcoming-grid").replaceChildren(errorState({ title: "We couldn't load upcoming releases", onRetry: retry }));
  $("spotlight-section").hidden = true;
  $("cinema-list").replaceChildren();
}

// ---------------------------------------------------------------- hero slideshow
const HERO_FILMS = 5;      // how many films take turns on the cover
const HERO_DELAY = 6000;   // milliseconds each film stays
let heroTimer = null;      // kept at module level so a re-render never leaves two timers running

// Five distinct films: the ones with the most screenings first, playful animation last so the cover opens on a serious film.
function pickHeroFilms(catalog, showing) {
  const today = todayISO();
  const released = [...catalog.movies].filter(m => m.releaseDate && m.releaseDate <= today).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  const ordered = [...showing.filter(m => !m.genres.includes("Animation")), ...showing.filter(m => m.genres.includes("Animation")), ...released];
  const seen = new Set();
  return ordered.filter(m => !seen.has(m.id) && seen.add(m.id)).slice(0, HERO_FILMS);
}

const ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

function renderHero(catalog, scope, showing) {
  clearInterval(heroTimer);
  const films = pickHeroFilms(catalog, showing);
  if (!films.length) return; // keep the static hero

  // One layer per film, stacked; only the active layer is visible (CSS cross-fade on opacity).
  const slides = films.map((movie, i) => {
    const media = createHeroMedia(movie);
    const layer = el("div", "hero__slide");
    layer.appendChild(media.node);
    const img = layer.querySelector("img");
    if (img && i > 0) { img.loading = "lazy"; img.fetchPriority = "low"; } // only the first image is urgent
    return { movie, layer, isArt: media.isArt };
  });
  $("hero-media").replaceChildren(...slides.map(slide => slide.layer));

  // The headline and both calls to action stay fixed so the page always says what CineSphere is for.
  // Below them: the film currently on the cover, and the slideshow controls.
  const cover = el("div", "hero__cover");
  const feature = el("a", "hero__feature");
  const label = el("span", "", "On the cover");
  const name = document.createTextNode("");
  feature.append(label, name);

  const dots = el("div", "hero__dots");
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Choose the cover film");
  const arrow = (icon, label, step) => {
    const button = el("button", "round-btn hero__arrow");
    button.type = "button";
    button.innerHTML = icon;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", () => { show(current + step); restart(); });
    return button;
  };
  const track = el("div", "hero__dots-track");
  const dotButtons = slides.map((slide, i) => {
    const dot = el("button", "hero__dot");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${slide.movie.title}`);
    dot.addEventListener("click", () => { show(i); restart(); });
    track.appendChild(dot);
    return dot;
  });
  dots.append(arrow(ICON_PREV, "Previous film", -1), track, arrow(ICON_NEXT, "Next film", 1));
  cover.append(feature, dots);
  $("hero-content").querySelector(".hero__cover")?.remove();
  $("hero-content").appendChild(cover);

  let current = 0;
  const autoplay = !matchMedia("(prefers-reduced-motion: reduce)").matches; // reduced motion: only the arrows and dots change the film
  let held = false;                                                        // pointer over the hero text, or focus inside it

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.layer.classList.toggle("is-active", i === current));
    dotButtons.forEach((dot, i) => { if (i === current) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current"); });
    const { movie, isArt } = slides[current];
    feature.href = movieUrl(movie.id);
    name.textContent = `${movie.title} (${yearOf(movie)}) · ${movie.genres.slice(0, 2).join(", ")}`;
    $("hero-credit").hidden = !isArt;
  }

  function restart() {
    clearInterval(heroTimer);
    if (!autoplay || slides.length < 2) return;
    heroTimer = setInterval(() => { if (!held && !document.hidden) show(current + 1); }, HERO_DELAY);
  }

  const content = $("hero-content");
  content.addEventListener("mouseenter", () => { held = true; });
  content.addEventListener("mouseleave", () => { held = false; });
  content.addEventListener("focusin", () => { held = true; });
  content.addEventListener("focusout", () => { held = false; });

  dots.hidden = slides.length < 2;
  show(0);
  restart();
}

// ---------------------------------------------------------------- now showing
function renderRail(showing, scope, city) {
  if (!showing.length) {
    railControls.hidden = true;
    rail.replaceChildren(emptyState(scope.cinemas.length
      ? { title: "Nothing on the schedule", text: "No films are scheduled at the moment." }
      : { title: `No cinema data for ${city} yet`, text: "CineSphere currently has verified cinemas for Lahore only.", action: { label: "Browse all films", href: "discover.html" } }));
    return;
  }
  railControls.hidden = false;
  const counts = screeningCounts(scope.showtimes);
  rail.replaceChildren(...showing.slice(0, 12).map(movie => {
    const card = posterCard(movie, { tag: plural(counts.get(movie.id), "screening"), showtimesLink: true });
    return card;
  }));
  rail.scrollLeft = 0;
  railUpdate();
}

// ---------------------------------------------------------------- upcoming
function renderUpcoming(upcoming) {
  const grid = $("upcoming-grid");
  if (!upcoming.length) {
    grid.replaceChildren(emptyState({ title: "No upcoming releases", text: "There are no upcoming films in the catalogue right now." }));
    return;
  }
  grid.replaceChildren(...upcoming.slice(0, 4).map(movie => {
    const card = stillCard(movie);
    return card;
  }));
}

// ---------------------------------------------------------------- editor's pick
function renderSpotlight(showing) {
  const section = $("spotlight-section");
  const lead = showing[0];
  // Prefer a local-language film so the pick says something about Lahore; otherwise the next film on the schedule.
  const pick = showing.find(m => m.originalLanguage === "ur") || showing.find(m => m.id !== (lead && lead.id));
  section.hidden = !pick;
  if (!pick) return;

  const media = el("div", "spotlight__media");
  media.appendChild(createHeroMedia(pick).node);
  media.dataset.reveal = "";

  const panel = el("div", "spotlight__panel");
  panel.dataset.reveal = "";
  const facts = el("dl", "facts-inline");
  [["Director", pick.director], ["Runtime", formatRuntime(pick.runtimeMinutes)], ["Language", languageName(pick.originalLanguage)]]
    .filter(([, value]) => value).forEach(([label, value]) => {
      const item = el("div");
      item.append(el("dt", "", label), el("dd", "", value));
      facts.appendChild(item);
    });
  const link = el("a", "btn");
  link.href = movieUrl(pick.id);
  link.textContent = "Read more";
  panel.append(el("p", "eyebrow eyebrow--accent", "Editor's pick"), el("h3", "", pick.title), el("p", "lede", pick.overview), facts, link);
  $("spotlight").replaceChildren(media, panel);
}

// ---------------------------------------------------------------- cinemas
function renderCinemas(scope, city) {
  const list = $("cinema-list");
  if (!scope.cinemas.length) {
    list.replaceChildren(el("li"));
    list.firstElementChild.appendChild(emptyState({ title: `No verified cinemas for ${city} yet`, text: "The directory currently covers Lahore.", action: { label: "Browse all films", href: "discover.html" } }));
    return;
  }
  list.replaceChildren(...scope.cinemas.map((cinema, i) => cinemaRow(cinema, i, cinemaStats(cinema.id, scope.showtimes))));
}

document.addEventListener("citychange", render);
render();
