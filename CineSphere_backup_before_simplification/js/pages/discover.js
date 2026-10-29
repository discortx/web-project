import { initApp, getCity } from "../app.js";
import { loadCatalog } from "../api.js";
import { scopeFor, filterMovies, uniqueGenres, uniqueYears, hasRatings, getSaved } from "../data.js";
import { el, debounce, readParams, writeParams } from "../utils.js";
import { posterCard, emptyState, errorState, skeletons } from "../components.js";

initApp();

const PAGE_SIZE = 12;
const $ = id => document.getElementById(id);
const grid = $("grid");

const params = readParams();
const state = {
  q: params.get("q") || "",
  genres: (params.get("genre") || "").split(",").filter(Boolean),
  year: params.get("year") || "",
  status: ["all", "now", "soon", "saved"].includes(params.get("status")) ? params.get("status") : "all",
  sort: params.get("sort") || "newest"
};
let visible = PAGE_SIZE;
let catalog = null;

const DEFAULTS = { q: "", genres: [], year: "", status: "all", sort: "newest" };
const isActive = () => state.q || state.genres.length || state.year || state.status !== "all" || state.sort !== "newest";

function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.genres.length) p.set("genre", state.genres.join(","));
  if (state.year) p.set("year", state.year);
  if (state.status !== "all") p.set("status", state.status);
  if (state.sort !== "newest") p.set("sort", state.sort);
  writeParams(p);
}

async function init() {
  grid.replaceChildren(...skeletons(8));
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    grid.replaceChildren(errorState({ title: "We couldn't load the films", text: "The film data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: init }));
    $("result-count").textContent = "";
    $("load-more").hidden = true;
    return;
  }
  buildControls();
  render();
}

function buildControls() {
  $("q").value = state.q;

  const years = $("year");
  years.replaceChildren(new Option("Any year", ""), ...uniqueYears(catalog.movies).map(y => new Option(y, y)));
  years.value = state.year;

  // Only offer sorting by rating if the data actually contains ratings.
  const sort = $("sort");
  sort.replaceChildren(new Option("Newest first", "newest"), new Option("Oldest first", "oldest"), new Option("Title A to Z", "title"));
  if (hasRatings(catalog.movies)) sort.appendChild(new Option("Highest rated", "rating"));
  if (![...sort.options].some(o => o.value === state.sort)) state.sort = "newest";
  sort.value = state.sort;

  $("status").value = state.status;

  const chips = $("genre-chips");
  chips.replaceChildren(...uniqueGenres(catalog.movies).map(genre => {
    const chip = el("button", "chip", genre);
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(state.genres.includes(genre)));
    chip.addEventListener("click", () => {
      state.genres = state.genres.includes(genre) ? state.genres.filter(g => g !== genre) : [...state.genres, genre];
      chip.setAttribute("aria-pressed", String(state.genres.includes(genre)));
      change();
    });
    return chip;
  }));
}

function change() {
  visible = PAGE_SIZE;
  syncUrl();
  render();
}

function render() {
  const scope = scopeFor(catalog, getCity());
  const saved = getSaved();
  $("status").querySelector("[value='saved']").textContent = `Saved (${saved.length})`;

  const results = filterMovies(catalog.movies, state, { showtimes: scope.showtimes, saved });
  const total = catalog.movies.length;
  const shown = results.slice(0, visible);

  $("result-count").replaceChildren("Showing ", el("strong", "", String(shown.length)), ` of ${results.length}${results.length === total ? "" : ` (${total} in the catalogue)`}`);
  $("clear-filters").disabled = !isActive();
  $("filters-count").textContent = activeFilterCount() ? ` (${activeFilterCount()})` : "";

  if (!results.length) {
    const box = emptyState(state.status === "saved" && !saved.length && !state.q && !state.genres.length && !state.year
      ? { title: "No saved films yet", text: "Open a film and choose Save film to keep it here.", action: { label: "Clear filters", onClick: clearAll } }
      : { title: "No films match", text: "Try a different title, remove a genre, or clear the filters.", action: { label: "Clear all filters", onClick: clearAll } });
    box.appendChild(suggestions());
    grid.replaceChildren(box);
    $("load-more").hidden = true;
    return;
  }
  grid.replaceChildren(...shown.map(movie => {
    const card = posterCard(movie);
    return card;
  }));
  $("load-more").hidden = shown.length >= results.length;
}

// "No results" should never be a dead end: offer the genres with the most films as one-click starting points.
function suggestions() {
  const counts = new Map();
  catalog.movies.forEach(m => m.genres.forEach(g => counts.set(g, (counts.get(g) || 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([g]) => g);
  const wrap = el("div", "state__suggest");
  wrap.appendChild(el("span", "eyebrow", "Or try a genre"));
  const chips = el("div", "chips");
  top.forEach(genre => {
    const chip = el("button", "chip", genre);
    chip.type = "button";
    chip.addEventListener("click", () => {
      Object.assign(state, { ...DEFAULTS, genres: [genre] });
      $("q").value = "";
      $("year").value = "";
      $("status").value = "all";
      $("sort").value = "newest";
      $("genre-chips").querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c.textContent === genre)));
      change();
    });
    chips.appendChild(chip);
  });
  wrap.appendChild(chips);
  return wrap;
}

const activeFilterCount = () => state.genres.length + (state.year ? 1 : 0) + (state.status !== "all" ? 1 : 0) + (state.sort !== "newest" ? 1 : 0);

function clearAll() {
  Object.assign(state, { ...DEFAULTS, genres: [] });
  $("q").value = "";
  $("year").value = "";
  $("status").value = "all";
  $("sort").value = "newest";
  $("genre-chips").querySelectorAll(".chip").forEach(chip => chip.setAttribute("aria-pressed", "false"));
  change();
}

$("q").addEventListener("input", debounce(event => { state.q = event.target.value; change(); }, 200));
$("year").addEventListener("change", event => { state.year = event.target.value; change(); });
$("status").addEventListener("change", event => { state.status = event.target.value; change(); });
$("sort").addEventListener("change", event => { state.sort = event.target.value; change(); });
$("clear-filters").addEventListener("click", clearAll);
$("load-more-button").addEventListener("click", () => {
  const before = visible;
  visible += PAGE_SIZE;
  syncUrl();
  render();
  // Move focus to the first newly added poster so keyboard users continue where the list grew.
  grid.querySelectorAll(".poster-card__link")[before]?.focus();
});
$("filters-toggle").addEventListener("click", () => {
  const open = $("toolbar").classList.toggle("is-open");
  $("filters-toggle").setAttribute("aria-expanded", String(open));
});
$("toolbar").addEventListener("submit", event => event.preventDefault());
document.addEventListener("citychange", () => { if (catalog) render(); });

init();
