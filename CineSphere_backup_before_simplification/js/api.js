// All data access lives here. Today the "API" is three local JSON files; to move to a live service,
// change the URLs (or the fetch logic) in this file only. Nothing else in the site knows where data comes from.

const URLS = { movies: "data/movies.json", cinemas: "data/cinemas.json", showtimes: "data/showtimes.json" };

export class DataError extends Error {}

async function getJSON(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (cause) {
    throw new DataError(`Could not reach ${url}. If you opened this page from disk, serve the folder with a local web server instead.`, { cause });
  }
  if (!res.ok) throw new DataError(`${url} responded with HTTP ${res.status}.`);
  try {
    return await res.json();
  } catch (cause) {
    throw new DataError(`${url} is not valid JSON.`, { cause });
  }
}

// Give every record the fields the UI relies on, and drop records that cannot be used.
function normalizeMovie(m) {
  if (!m || typeof m !== "object" || !Number.isInteger(m.id) || !m.title) return null;
  return {
    ...m,
    overview: m.overview || "",
    genres: Array.isArray(m.genres) ? m.genres : [],
    cast: Array.isArray(m.cast) ? m.cast : [],
    releaseDate: typeof m.releaseDate === "string" ? m.releaseDate : "",
    runtimeMinutes: m.runtimeMinutes || 0,
    originalLanguage: m.originalLanguage || "",
    posterPath: m.posterPath || null,
    backdropPath: m.backdropPath || null,
    trailerKey: m.trailerKey || null,
    director: m.director || "",
    tmdbRating: typeof m.tmdbRating === "number" ? m.tmdbRating : null,
    dataSource: m.dataSource || "seed"
  };
}

async function fetchCatalog() {
  const [rawMovies, rawCinemas, rawShowtimes] = await Promise.all([getJSON(URLS.movies), getJSON(URLS.cinemas), getJSON(URLS.showtimes)]);
  if (![rawMovies, rawCinemas, rawShowtimes].every(Array.isArray)) throw new DataError("Data files must contain lists.");

  const movies = rawMovies.map(normalizeMovie).filter(Boolean);
  const cinemas = rawCinemas.filter(c => c && c.id && c.name);
  const movieIds = new Set(movies.map(m => m.id));
  const cinemaIds = new Set(cinemas.map(c => c.id));
  // A showtime that points at a missing film or cinema would render as a broken row, so it is dropped.
  const showtimes = rawShowtimes.filter(s => s && movieIds.has(s.movieId) && cinemaIds.has(s.cinemaId) && s.date && s.time);

  return {
    movies,
    cinemas,
    showtimes,
    movieById: new Map(movies.map(m => [m.id, m])),
    cinemaById: new Map(cinemas.map(c => [c.id, c]))
  };
}

let catalogPromise = null;

// Loaded once and shared by every caller on the page. A failed load is not cached, so Retry works.
export function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog().catch(error => {
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}
