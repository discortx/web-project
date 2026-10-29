// One-off: enriches data/movies.json with real TMDB data (ids, ratings, posters, trailers, cast).
// Usage (PowerShell):  $env:TMDB_API_KEY="your_v3_key"; node tools/fetch-tmdb.mjs
// The key is read from the environment and never written into the website files.
import { readFileSync, writeFileSync } from "node:fs";

const KEY = process.env.TMDB_API_KEY;
if (!KEY) { console.error("Set TMDB_API_KEY first."); process.exit(1); }

const file = new URL("../data/movies.json", import.meta.url);
const movies = JSON.parse(readFileSync(file, "utf8"));

async function api(path, params = {}) {
  const url = new URL("https://api.themoviedb.org/3" + path);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

for (const m of movies) {
  try {
    const year = m.releaseDate.slice(0, 4);
    const hit = m.tmdbId ? { id: m.tmdbId } : (await api("/search/movie", { query: m.title, year })).results[0];
    if (!hit) { console.warn("No match:", m.title); continue; }
    const d = await api(`/movie/${hit.id}`, { append_to_response: "credits,videos" });
    const trailer = d.videos.results.find(v => v.site === "YouTube" && v.type === "Trailer");
    Object.assign(m, {
      tmdbId: d.id,
      overview: d.overview || m.overview,
      posterPath: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
      backdropPath: d.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : null,
      genres: d.genres.length ? d.genres.map(g => g.name) : m.genres,
      releaseDate: d.release_date || m.releaseDate,
      runtimeMinutes: d.runtime || m.runtimeMinutes,
      tmdbRating: d.vote_average > 0 ? Math.round(d.vote_average * 10) / 10 : null,
      tmdbVoteCount: d.vote_count,
      dataSource: "tmdb",
      originalLanguage: d.original_language,
      trailerKey: trailer ? trailer.key : null,
      cast: d.credits.cast.slice(0, 4).map(c => c.name),
      director: (d.credits.crew.find(c => c.job === "Director") || {}).name || m.director
    });
    console.log("OK  ", m.title);
  } catch (e) { console.warn("FAIL", m.title, e.message); }
}
writeFileSync(file, JSON.stringify(movies, null, 2) + "\n");
console.log("Saved. Now re-run: node tools/generate-showtimes.mjs <first-demo-date>");
