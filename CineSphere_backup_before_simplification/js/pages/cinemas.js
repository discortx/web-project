import { initApp, getCity } from "../app.js";
import { loadCatalog } from "../api.js";
import { scopeFor } from "../data.js";
import { el, debounce, plural, readParams, writeParams } from "../utils.js";
import { cinemaRow, cinemaStats, emptyState, errorState } from "../components.js";

initApp();

const $ = id => document.getElementById(id);
const list = $("list");
const params = readParams();
const state = { q: params.get("q") || "", area: params.get("area") || "" };
let catalog = null;

async function init() {
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    list.replaceChildren(el("li"));
    list.firstElementChild.appendChild(errorState({ title: "We couldn't load the cinemas", text: "The cinema data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: init }));
    return;
  }
  $("q").value = state.q;
  render();
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.area) p.set("area", state.area);
  writeParams(p);
}

function render() {
  const city = getCity();
  const scope = scopeFor(catalog, city);
  $("city-line").textContent = city;

  // Area filter is built from the cinemas that exist in the selected city.
  const areas = [...new Set(scope.cinemas.map(c => c.area))].sort();
  if (state.area && !areas.includes(state.area)) state.area = "";
  const areaSelect = $("area");
  areaSelect.replaceChildren(new Option("All areas", ""), ...areas.map(a => new Option(a, a)));
  areaSelect.value = state.area;

  const q = state.q.trim().toLowerCase();
  const matches = scope.cinemas.filter(c => (!state.area || c.area === state.area) && (!q || `${c.name} ${c.area} ${c.address}`.toLowerCase().includes(q)));
  $("count").textContent = scope.cinemas.length ? `${plural(matches.length, "cinema")}` : "";
  $("clear").disabled = !state.q && !state.area;

  if (!matches.length) {
    list.replaceChildren(el("li"));
    list.firstElementChild.appendChild(emptyState(scope.cinemas.length
      ? { title: "No cinemas match", text: "Try a different name or area.", action: { label: "Clear filters", onClick: clearAll } }
      : { title: `No verified cinemas for ${city} yet`, text: "The directory currently covers Lahore. Switch the location to Lahore to see its cinemas." }));
    return;
  }
  list.replaceChildren(...matches.map((cinema, i) => cinemaRow(cinema, i, cinemaStats(cinema.id, scope.showtimes))));
}

function clearAll() {
  state.q = "";
  state.area = "";
  $("q").value = "";
  syncUrl();
  render();
}

$("q").addEventListener("input", debounce(event => { state.q = event.target.value; syncUrl(); render(); }, 150));
$("area").addEventListener("change", event => { state.area = event.target.value; syncUrl(); render(); });
$("clear").addEventListener("click", clearAll);
document.addEventListener("citychange", () => { if (catalog) render(); });
init();
