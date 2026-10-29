import { initApp, getCity } from "../app.js";
import { loadCatalog } from "../api.js";
import { scopeFor, nowShowing, screeningCounts, uniqueGenres } from "../data.js";
import { el, plural } from "../utils.js";
import { posterCard, emptyState, errorState, skeletons } from "../components.js";

initApp();

const $ = id => document.getElementById(id);
const grid = $("grid");
let catalog = null;
let genre = "";

async function init() {
  grid.replaceChildren(...skeletons(8));
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    $("genre-chips").replaceChildren();
    grid.replaceChildren(errorState({ title: "We couldn't load the schedule", text: "The film data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: init }));
    return;
  }
  render();
}

function render() {
  const city = getCity();
  const scope = scopeFor(catalog, city);
  const showing = nowShowing(catalog.movies, scope.showtimes);
  $("city-line").textContent = city;

  const genres = uniqueGenres(showing);
  if (genre && !genres.includes(genre)) genre = "";
  const chips = $("genre-chips");
  chips.replaceChildren(...(genres.length ? ["", ...genres] : []).map(name => {
    const chip = el("button", "chip", name || "All");
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(name === genre));
    chip.addEventListener("click", () => { genre = name; render(); });
    return chip;
  }));

  const visible = genre ? showing.filter(m => m.genres.includes(genre)) : showing;
  $("count").textContent = showing.length ? `${plural(visible.length, "film")} now showing` : "";

  if (!visible.length) {
    grid.replaceChildren(emptyState(scope.cinemas.length
      ? { title: "No films in this genre", text: "Choose another genre or show all films.", action: { label: "Show all genres", onClick: () => { genre = ""; render(); } } }
      : { title: `No cinema data for ${city} yet`, text: "CineSphere currently has verified cinemas for Lahore only. Switch the location to Lahore to see what's showing.", action: { label: "Browse all films", href: "discover.html" } }));
    return;
  }
  const counts = screeningCounts(scope.showtimes);
  grid.replaceChildren(...visible.map(movie => {
    const card = posterCard(movie, { tag: plural(counts.get(movie.id), "screening"), showtimesLink: true });
    return card;
  }));
}

document.addEventListener("citychange", () => { if (catalog) render(); });
init();
