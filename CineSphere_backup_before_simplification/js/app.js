// Behaviour shared by every page: navigation, header, location selector, search dialog, footer.
import { loadCatalog } from "./api.js";
import { searchMovies } from "./data.js";
import { el, debounce, yearOf } from "./utils.js";
import { movieUrl, cinemaUrl } from "./components.js";

export const CITIES = ["Lahore", "Karachi", "Islamabad"];
const CITY_KEY = "cinesphere-city";

export function getCity() {
  try {
    const saved = localStorage.getItem(CITY_KEY);
    return CITIES.includes(saved) ? saved : "Lahore";
  } catch {
    return "Lahore";
  }
}

export function initApp() {
  initNavigation();
  initHeader();
  initLocation();
  initSearch();
  initFooter();
}

// ---------------------------------------------------------------- navigation
function initNavigation() {
  const current = document.body.dataset.nav;
  document.querySelectorAll("a[data-nav]").forEach(link => {
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
  });

  const button = document.getElementById("menu-button");
  const nav = document.getElementById("primary-nav");
  if (!button || !nav) return;
  const setOpen = open => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); button.focus(); } });
  matchMedia("(min-width: 961px)").addEventListener("change", event => { if (event.matches) setOpen(false); });
}

// The header is transparent over the home hero and turns solid once the page has scrolled.
function initHeader() {
  const header = document.getElementById("site-header");
  const sentinel = document.getElementById("top-sentinel");
  if (!header || !sentinel) return;
  if (!("IntersectionObserver" in window)) { header.classList.add("is-scrolled"); return; }
  new IntersectionObserver(([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting)).observe(sentinel);
}

// ---------------------------------------------------------------- location
function initLocation() {
  const selects = document.querySelectorAll("[data-location]");
  const city = getCity();
  selects.forEach(select => {
    select.replaceChildren(...CITIES.map(name => new Option(name === "Lahore" ? name : `${name} (no data yet)`, name)));
    select.value = city;
    select.addEventListener("change", () => {
      try { localStorage.setItem(CITY_KEY, select.value); } catch { /* storage unavailable */ }
      selects.forEach(other => { other.value = select.value; });
      document.dispatchEvent(new CustomEvent("citychange", { detail: select.value }));
    });
  });
}

// ---------------------------------------------------------------- search dialog
function initSearch() {
  const dialog = document.getElementById("search-dialog");
  const open = document.getElementById("search-open");
  if (!dialog || !open) return;
  const input = dialog.querySelector("input[name='q']");
  const results = dialog.querySelector(".search-dialog__results");
  const all = dialog.querySelector("#search-all");
  let catalog = null;
  let loadFailed = false;

  const hint = text => results.replaceChildren(el("p", "search-dialog__hint", text));

  function render() {
    const query = input.value.trim();
    all.href = query ? `discover.html?q=${encodeURIComponent(query)}` : "discover.html";
    if (!query) return hint("Start typing a title, genre, director or actor.");
    if (loadFailed) return hint("Suggestions are unavailable right now. Press Enter to search the full catalogue.");
    if (!catalog) return hint("Loading…");
    const matches = searchMovies(catalog.movies, query).slice(0, 6);
    if (!matches.length) return hint(`No films match “${query}”.`);
    results.replaceChildren(...matches.map(movie => {
      const link = el("a");
      link.href = movieUrl(movie.id);
      link.append(el("span", "", movie.title), el("small", "", [yearOf(movie), movie.genres[0]].filter(Boolean).join(" · ")));
      return link;
    }));
  }

  open.addEventListener("click", () => {
    dialog.showModal();
    input.focus();
    input.select();
    if (!catalog && !loadFailed) loadCatalog().then(data => { catalog = data; render(); }).catch(() => { loadFailed = true; render(); });
    render();
  });
  input.addEventListener("input", debounce(render, 120));
  dialog.querySelector(".search-dialog__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    const box = dialog.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener("close", () => open.focus());
}

// ---------------------------------------------------------------- footer
function initFooter() {
  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = String(new Date().getFullYear()); });
  const list = document.querySelector("[data-footer-cinemas]");
  if (!list) return;
  // Enhancement only: if the data cannot load, the footer keeps its static "All cinemas" link.
  loadCatalog().then(catalog => {
    catalog.cinemas.filter(c => c.city === "Lahore").slice(0, 6).forEach(cinema => {
      const item = el("li");
      const link = el("a", "", cinema.name);
      link.href = cinemaUrl(cinema.id);
      item.appendChild(link);
      list.appendChild(item);
    });
  }).catch(() => {});
}
