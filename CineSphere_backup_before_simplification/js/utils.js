// Small helpers shared by every page.

// Create an element with optional class and text (text is set with textContent, never innerHTML).
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function debounce(fn, wait = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// ---- Dates (ISO "YYYY-MM-DD" strings are parsed as local dates, never as UTC) ----
const parseISO = iso => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const formatDate = iso => parseISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const formatMonth = iso => parseISO(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
export function dateParts(iso) {
  const d = parseISO(iso);
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
    day: String(d.getDate()),
    month: d.toLocaleDateString("en-GB", { month: "short" })
  };
}

// "14:30" -> "2:30 PM"
export function formatTime(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export function formatRuntime(totalMinutes) {
  return totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : "";
}

// ---- Movie fields ----
const LANGUAGES = { en: "English", ur: "Urdu", hi: "Hindi", pa: "Punjabi" };
export const languageName = code => LANGUAGES[code] || (code ? code.toUpperCase() : "");
export const yearOf = movie => (movie.releaseDate ? movie.releaseDate.slice(0, 4) : "");
// A rating is only shown when the data carries a real one.
export const ratingOf = movie => (typeof movie.tmdbRating === "number" && movie.tmdbRating > 0 ? movie.tmdbRating : null);
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Stable 0-5 index from a title (picks the key-art palette)
export function toneOf(title) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return hash % 6;
}

// ---- URL state ----
export const readParams = () => new URLSearchParams(location.search);
export function writeParams(params) {
  const qs = params.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}
