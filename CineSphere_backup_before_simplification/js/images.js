// TMDB serves every image in several widths from the same path, so one stored URL can drive a responsive srcset.
const TMDB = /^(https:\/\/image\.tmdb\.org\/t\/p\/)w\d+(\/.+)$/;

export const POSTER_WIDTHS = [185, 342, 500];
export const BACKDROP_WIDTHS = [300, 780, 1280];

// Returns a srcset string for TMDB URLs, or "" for any other URL (which then simply uses `src`).
export function tmdbSrcset(url, widths) {
  const match = TMDB.exec(url || "");
  return match ? widths.map(w => `${match[1]}w${w}${match[2]} ${w}w`).join(", ") : "";
}
