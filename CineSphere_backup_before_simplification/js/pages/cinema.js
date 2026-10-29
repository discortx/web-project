import { initApp } from "../app.js";
import { loadCatalog } from "../api.js";
import { el, readParams } from "../utils.js";
import { icon } from "../icons.js";
import { createShowtimePanel, emptyState, errorState } from "../components.js";

initApp();

const root = document.getElementById("cinema-root");

async function render() {
  const id = readParams().get("id");
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return notFound("That cinema link isn't valid", "The address is missing a cinema identifier, or it contains unexpected characters.");

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error(error);
    root.replaceChildren(el("div", "container section section--last"));
    root.firstElementChild.appendChild(errorState({ title: "We couldn't load this cinema", text: "The cinema data didn't load. Check your connection, or serve this folder from a local web server, then try again.", onRetry: render }));
    return;
  }

  const cinema = catalog.cinemaById.get(id);
  if (!cinema) return notFound("We couldn't find that cinema", "It isn't in the directory. It may have been removed or the link may be mistyped.");

  document.title = `${cinema.name} | CineSphere`;
  const head = el("header", "container page-head");
  const back = el("a", "link-arrow page-head__back");
  back.href = "cinemas.html";
  back.append(icon("prev"), "All cinemas");
  const facts = el("div", "movie-actions");
  if (cinema.officialWebsite) {
    const site = el("a", "btn btn--ghost");
    site.href = cinema.officialWebsite;
    site.target = "_blank";
    site.rel = "noopener noreferrer";
    site.append("Official website", icon("external"));
    facts.appendChild(site);
  }
  head.append(back, el("p", "eyebrow eyebrow--accent", cinema.area), el("h1", "", cinema.name), el("p", "lede", cinema.address), facts);

  const body = el("div", "container section--last");
  const times = el("section", "cinema-showtimes");
  times.appendChild(el("h2", "", "Showtimes"));
  times.appendChild(createShowtimePanel({ mode: "cinema", subject: cinema, showtimes: catalog.showtimes, cinemaById: catalog.cinemaById, movieById: catalog.movieById, emptyText: "No screenings are scheduled at this cinema in the demonstration data." }));
  body.appendChild(times);

  root.replaceChildren(head, body);
}

function notFound(title, text) {
  document.title = "Cinema not found | CineSphere";
  const wrap = el("div", "container section section--last");
  wrap.appendChild(emptyState({ title, text, action: { label: "Browse cinemas", href: "cinemas.html" } }));
  root.replaceChildren(wrap);
}

render();
