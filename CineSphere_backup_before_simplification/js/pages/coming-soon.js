import { initApp } from "../app.js";
import { loadCatalog } from "../api.js";
import { comingSoon, isUnconfirmedDate } from "../data.js";
import { el, formatMonth, plural } from "../utils.js";
import { stillCard, emptyState, errorState, skeletons } from "../components.js";

initApp();

const $ = id => document.getElementById(id);
const groups = $("groups");
let upcoming = null;

async function init() {
  groups.replaceChildren(el("div", "month-group__grid"));
  groups.firstElementChild.append(...skeletons(6, true));
  try {
    const catalog = await loadCatalog();
    upcoming = comingSoon(catalog.movies, catalog.showtimes);
  } catch (error) {
    console.error(error);
    groups.replaceChildren(errorState({ title: "We couldn't load upcoming releases", text: "The film data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: init }));
    return;
  }
  $("date-notice").hidden = !upcoming.some(isUnconfirmedDate);
  render();
}

function render() {
  if (!upcoming.length) {
    $("count").textContent = "";
    groups.replaceChildren(emptyState({ title: "No upcoming releases", text: "There are no upcoming films in the catalogue right now.", action: { label: "Discover films", href: "discover.html" } }));
    return;
  }
  $("count").textContent = `${plural(upcoming.length, "upcoming film")}`;
  const list = $("sort").value === "latest" ? [...upcoming].reverse() : upcoming;

  const byMonth = new Map();
  list.forEach(movie => {
    const key = movie.releaseDate ? movie.releaseDate.slice(0, 7) : "tba";
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(movie);
  });
  groups.replaceChildren(...[...byMonth.entries()].map(([key, movies]) => {
    const section = el("section", "month-group");
    section.setAttribute("aria-label", key === "tba" ? "Date to be announced" : formatMonth(`${key}-01`));
    const head = el("div", "month-group__head");
    head.append(el("h2", "", key === "tba" ? "Date to be announced" : formatMonth(`${key}-01`)), el("span", "eyebrow", plural(movies.length, "film")));
    const grid = el("div", "month-group__grid");
    movies.forEach(movie => {
      const card = stillCard(movie);
      grid.appendChild(card);
    });
    section.append(head, grid);
    return section;
  }));
}

$("sort").addEventListener("change", () => { if (upcoming) render(); });
init();
