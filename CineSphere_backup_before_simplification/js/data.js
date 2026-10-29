// Pure functions that answer questions about the catalogue (no DOM here).
import { todayISO, ratingOf } from "./utils.js";

// ---- Location scope: showtimes only exist for cinemas in the selected city ----
export function scopeFor(catalog, city) {
  const cinemas = catalog.cinemas.filter(c => c.city === city);
  const ids = new Set(cinemas.map(c => c.id));
  return { city, cinemas, showtimes: catalog.showtimes.filter(s => ids.has(s.cinemaId)) };
}

export const screeningCounts = showtimes => showtimes.reduce((map, s) => map.set(s.movieId, (map.get(s.movieId) || 0) + 1), new Map());

// "Now showing" means the film has at least one screening in the schedule. Release status is a separate idea.
export function nowShowing(movies, showtimes) {
  const counts = screeningCounts(showtimes);
  return movies.filter(m => counts.has(m.id)).sort((a, b) => counts.get(b.id) - counts.get(a.id) || b.releaseDate.localeCompare(a.releaseDate));
}

export function comingSoon(movies, showtimes) {
  const counts = screeningCounts(showtimes);
  const today = todayISO();
  return movies.filter(m => m.releaseDate > today && !counts.has(m.id)).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}

export const isUnconfirmedDate = movie => movie.dataSource !== "tmdb";

// ---- Search and filtering ----
const norm = text => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchMovies(movies, query) {
  const q = norm(query.trim());
  if (!q) return movies;
  return movies.filter(m => norm(m.title).includes(q) || m.genres.some(g => norm(g).includes(q)) || norm(m.director).includes(q) || m.cast.some(c => norm(c).includes(q)));
}

// filters: { q, genres[], year, status: all|now|soon|saved, sort }
export function filterMovies(movies, { q = "", genres = [], year = "", status = "all", sort = "newest" }, { showtimes = [], saved = [] } = {}) {
  let result = searchMovies(movies, q);
  if (genres.length) result = result.filter(m => genres.every(g => m.genres.includes(g)));
  if (year) result = result.filter(m => m.releaseDate.startsWith(year));
  if (status === "now") {
    const ids = new Set(nowShowing(result, showtimes).map(m => m.id));
    result = result.filter(m => ids.has(m.id));
  } else if (status === "soon") {
    const ids = new Set(comingSoon(result, showtimes).map(m => m.id));
    result = result.filter(m => ids.has(m.id));
  } else if (status === "saved") {
    result = result.filter(m => saved.includes(m.id));
  }
  return sortMovies(result, sort);
}

export function sortMovies(movies, sort) {
  const list = [...movies];
  const by = {
    newest: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
    oldest: (a, b) => a.releaseDate.localeCompare(b.releaseDate),
    title: (a, b) => a.title.localeCompare(b.title),
    rating: (a, b) => (ratingOf(b) ?? -1) - (ratingOf(a) ?? -1)
  };
  return list.sort(by[sort] || by.newest);
}

export const uniqueGenres = movies => [...new Set(movies.flatMap(m => m.genres))].sort();
export const uniqueYears = movies => [...new Set(movies.map(m => m.releaseDate.slice(0, 4)).filter(Boolean))].sort().reverse();
export const hasRatings = movies => movies.some(m => ratingOf(m) !== null);

// Films that share the most genres with `movie`
export function relatedMovies(movie, movies, limit = 8) {
  return movies
    .filter(m => m.id !== movie.id)
    .map(m => ({ m, shared: m.genres.filter(g => movie.genres.includes(g)).length }))
    .filter(x => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.m.releaseDate.localeCompare(a.m.releaseDate))
    .slice(0, limit)
    .map(x => x.m);
}

// ---- Saved films (kept in this browser only) ----
const SAVED_KEY = "cinesphere-saved";
export function getSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(SAVED_KEY));
    return Array.isArray(list) ? list.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}
// Returns true when the film is saved after the call.
export function toggleSaved(movieId) {
  const list = getSaved();
  const index = list.indexOf(movieId);
  if (index === -1) list.push(movieId); else list.splice(index, 1);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
  return index === -1;
}
