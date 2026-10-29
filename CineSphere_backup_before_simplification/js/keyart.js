// Film key art drawn as SVG when a film has no TMDB poster or backdrop yet.
// The motif follows the film's genre and the palette follows its title, so every film gets its own composed image.
// Real posters/backdrops replace this automatically once `posterPath` / `backdropPath` exist in movies.json.
import { toneOf } from "./utils.js";

const PALETTES = [
  { bg: "#1a0f0c", mid: "#7a3320", light: "#f6b46b" }, // ember
  { bg: "#071419", mid: "#14515d", light: "#9fdde3" }, // teal
  { bg: "#14140a", mid: "#58571d", light: "#ecd982" }, // brass
  { bg: "#100b1e", mid: "#46327d", light: "#cdb4ff" }, // violet
  { bg: "#08150f", mid: "#21663f", light: "#a8e8bd" }, // forest
  { bg: "#1b0810", mid: "#7a1f35", light: "#ff97a8" }  // crimson
];

const SIZES = { poster: [400, 600, 0.5], wide: [1600, 900, 0.7], spread: [1600, 740, 0.88], thumb: [640, 360, 0.62] };
let uid = 0;

function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}

function rng(seed) {
  let s = seed || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

const f = n => n.toFixed(1);

// Science fiction: a planet over layered dunes, with a lone figure for scale.
function horizon({ W, H, fx, pal, r, id }) {
  const cx = W * fx, cy = H * 0.5, R = Math.min(W, H * 1.3) * 0.24;
  let stars = "";
  for (let i = 0; i < 46; i++) stars += `<circle cx="${f(r() * W)}" cy="${f(r() * H * 0.55)}" r="${f(r() * 1.4 + 0.4)}" fill="${pal.light}" opacity="${(r() * 0.6 + 0.15).toFixed(2)}"/>`;
  const dune = (y, amp, col, op) => `<path d="M0 ${f(H * y)} Q ${f(W * 0.25)} ${f(H * (y - amp))} ${f(W * 0.5)} ${f(H * y)} T ${W} ${f(H * (y - amp * 0.6))} L ${W} ${H} L 0 ${H} Z" fill="${col}" opacity="${op}"/>`;
  return `<defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.bg}"/><stop offset="1" stop-color="${pal.mid}"/></linearGradient>
    <radialGradient id="${id}d" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${pal.light}"/><stop offset="1" stop-color="${pal.mid}"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}s)"/>${stars}
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.45)}" fill="none" stroke="${pal.light}" stroke-opacity=".2"/>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="url(#${id}d)"/>
    ${dune(0.68, 0.07, pal.mid, 0.9)}${dune(0.76, 0.06, pal.bg, 0.8)}${dune(0.87, 0.05, pal.bg, 1)}
    <rect x="${f(cx * 0.6)}" y="${f(H * 0.7)}" width="${f(W * 0.006)}" height="${f(H * 0.055)}" fill="${pal.bg}"/>
    <circle cx="${f(cx * 0.6 + W * 0.003)}" cy="${f(H * 0.695)}" r="${f(W * 0.004)}" fill="${pal.bg}"/>`;
}

// Horror and thriller: a lit doorway at the end of a dark corridor.
function doorway({ W, H, fx, pal, r, id }) {
  const x = W * fx, top = H * 0.2, bottom = H * 0.72, sw = W * 0.05;
  let bars = "";
  for (let i = 1; i <= 6; i++) {
    const t = 1 - Math.pow(0.7, i);
    const y = top * t;
    const half = (W * 0.5 - sw) * (1 - t) * 0.5 + sw * 0.8;
    bars += `<rect x="${f(x - half)}" y="${f(y)}" width="${f(half * 2)}" height="${f(Math.max(2, H * 0.012 * (1 - t)))}" fill="${pal.light}" opacity="${(0.35 - i * 0.04).toFixed(2)}"/>`;
  }
  return `<defs>
    <radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${pal.light}" stop-opacity=".8"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="${pal.bg}"/>
    <polygon points="0,0 ${f(x - sw)},${f(top)} ${f(x - sw)},${f(bottom)} 0,${H}" fill="${pal.mid}" opacity=".3"/>
    <polygon points="${W},0 ${f(x + sw)},${f(top)} ${f(x + sw)},${f(bottom)} ${W},${H}" fill="${pal.mid}" opacity=".55"/>
    ${bars}
    <ellipse cx="${f(x)}" cy="${f((top + bottom) / 2)}" rx="${f(W * 0.3)}" ry="${f(H * 0.3)}" fill="url(#${id}g)"/>
    <rect x="${f(x - sw)}" y="${f(top)}" width="${f(sw * 2)}" height="${f(bottom - top)}" fill="${pal.light}"/>
    <polygon points="${f(x - sw)},${f(bottom)} ${f(x + sw)},${f(bottom)} ${f(x + W * 0.22)},${H} ${f(x - W * 0.22)},${H}" fill="url(#${id}f)"/>
    <rect x="${f(x - 1.5)}" y="${f(bottom - H * 0.12)}" width="3" height="${f(H * 0.09)}" fill="${pal.bg}"/>
    <circle cx="${f(x)}" cy="${f(bottom - H * 0.13)}" r="${f(H * 0.013)}" fill="${pal.bg}"/>`;
}

// Action: rays fanning out behind a city skyline.
function rays({ W, H, fx, pal, r, id }) {
  const cx = W * fx, cy = H * 0.66, n = 26, L = Math.max(W, H) * 1.4;
  let beams = "";
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI * (1 + i / n), a1 = Math.PI * (1 + (i + 0.45) / n);
    beams += `<polygon points="${f(cx)},${f(cy)} ${f(cx + Math.cos(a0) * L)},${f(cy + Math.sin(a0) * L)} ${f(cx + Math.cos(a1) * L)},${f(cy + Math.sin(a1) * L)}" fill="${pal.light}" opacity="${i % 2 ? 0.1 : 0.22}"/>`;
  }
  let skyline = "", x = 0;
  while (x < W) {
    const w = W * (0.04 + r() * 0.05), h = H * (0.1 + r() * 0.24);
    skyline += `<rect x="${f(x)}" y="${f(H - h)}" width="${f(w)}" height="${f(h)}" fill="#000" opacity=".88"/>`;
    x += w + W * 0.004;
  }
  return `<defs><radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${pal.light}"/><stop offset=".25" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.mid}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.bg}"/><stop offset="1" stop-color="${pal.mid}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}s)"/>${beams}
    <ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(W * 0.3)}" ry="${f(H * 0.22)}" fill="url(#${id}g)"/>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(W, H) * 0.07)}" fill="${pal.light}"/>${skyline}`;
}

// Animation, family, comedy: bold flat geometry.
function shapes({ W, H, fx, pal, r }) {
  const M = Math.min(W, H), cx = W * fx;
  return `<rect width="${W}" height="${H}" fill="${pal.mid}"/>
    <circle cx="${f(cx)}" cy="${f(H * 0.42)}" r="${f(M * 0.3)}" fill="${pal.light}"/>
    <circle cx="${f(cx + M * 0.2)}" cy="${f(H * 0.56)}" r="${f(M * 0.2)}" fill="${pal.bg}"/>
    <circle cx="${f(cx - M * 0.28)}" cy="${f(H * 0.66)}" r="${f(M * 0.12)}" fill="none" stroke="${pal.light}" stroke-width="${f(M * 0.012)}"/>
    <path d="M${f(cx - M * 0.5)} ${H} A ${f(M * 0.5)} ${f(M * 0.5)} 0 0 1 ${f(cx + M * 0.5)} ${H} Z" fill="${pal.bg}" opacity=".9"/>
    <rect x="${f(cx - M * 0.06)}" y="${f(H * 0.18)}" width="${f(M * 0.12)}" height="${f(M * 0.12)}" fill="${pal.bg}" transform="rotate(${Math.round(r() * 30 + 10)} ${f(cx)} ${f(H * 0.24)})"/>`;
}

// Drama, romance, history: an arched window throwing light across the floor.
function windowArt({ W, H, fx, pal, r, id }) {
  const x = W * fx, ww = Math.min(W * 0.22, H * 0.3), top = H * 0.13, bot = H * 0.7;
  const fig = W * 0.045;
  return `<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.bg}"/><stop offset="1" stop-color="${pal.mid}"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}w)"/>
    <rect y="${f(bot)}" width="${W}" height="${f(H - bot)}" fill="${pal.bg}" opacity=".7"/>
    <polygon points="${f(x - ww / 2)},${f(bot)} ${f(x + ww / 2)},${f(bot)} ${f(x + ww / 2 - W * 0.4)},${H} ${f(x - ww / 2 - W * 0.4)},${H}" fill="url(#${id}b)"/>
    <path d="M${f(x - ww / 2)} ${f(bot)} L${f(x - ww / 2)} ${f(top + ww / 2)} A${f(ww / 2)} ${f(ww / 2)} 0 0 1 ${f(x + ww / 2)} ${f(top + ww / 2)} L${f(x + ww / 2)} ${f(bot)} Z" fill="${pal.light}"/>
    <path d="M${f(x)} ${f(top)} V${f(bot)} M${f(x - ww / 2)} ${f(top + ww * 0.9)} H${f(x + ww / 2)} M${f(x - ww / 2)} ${f(top + ww * 1.8)} H${f(x + ww / 2)}" stroke="${pal.bg}" stroke-width="${f(Math.max(3, ww * 0.03))}" fill="none" opacity=".75"/>
    <circle cx="${f(x - W * 0.2)}" cy="${f(H * 0.76)}" r="${f(fig * 0.4)}" fill="${pal.bg}"/>
    <path d="M${f(x - W * 0.2 - fig * 0.55)} ${f(H * 0.9)} L${f(x - W * 0.2 - fig * 0.3)} ${f(H * 0.79)} H${f(x - W * 0.2 + fig * 0.3)} L${f(x - W * 0.2 + fig * 0.55)} ${f(H * 0.9)} Z" fill="${pal.bg}"/>`;
}

// Fantasy: a large moon over layered ridgelines.
function moon({ W, H, fx, pal, r, id }) {
  const cx = W * fx, cy = H * 0.34, R = Math.min(W, H) * 0.2;
  const ridge = (y0, amp, col, op) => {
    const pts = [`0,${H}`];
    for (let x = 0; x <= W + 1; x += W / 12) pts.push(`${f(x)},${f(H * y0 - r() * H * amp)}`);
    pts.push(`${W},${H}`);
    return `<polygon points="${pts.join(" ")}" fill="${col}" opacity="${op}"/>`;
  };
  let birds = "";
  for (let i = 0; i < 4; i++) {
    const bx = cx - R * 2 + r() * R * 3, by = cy + R * 0.6 + r() * R * 1.4, s = W * 0.012;
    birds += `<path d="M${f(bx - s)} ${f(by)} Q ${f(bx)} ${f(by - s * 0.9)} ${f(bx + s)} ${f(by)} Q ${f(bx + s * 0.4)} ${f(by - s * 0.4)} ${f(bx)} ${f(by + s * 0.2)}" stroke="${pal.light}" stroke-width="2" fill="none" opacity=".8"/>`;
  }
  return `<defs><radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.bg}"/><stop offset="1" stop-color="${pal.mid}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 2.4)}" fill="url(#${id}g)"/>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="${pal.light}"/>
    <circle cx="${f(cx - R * 0.3)}" cy="${f(cy - R * 0.2)}" r="${f(R * 0.18)}" fill="${pal.mid}" opacity=".3"/>
    <circle cx="${f(cx + R * 0.35)}" cy="${f(cy + R * 0.3)}" r="${f(R * 0.12)}" fill="${pal.mid}" opacity=".3"/>
    ${birds}${ridge(0.7, 0.14, pal.mid, 0.9)}${ridge(0.8, 0.12, pal.bg, 0.8)}${ridge(0.9, 0.08, pal.bg, 1)}`;
}

function motifFor(genres) {
  const has = g => genres.includes(g);
  if (has("Horror")) return doorway;
  if (has("Science Fiction")) return horizon;
  if (has("Animation")) return shapes;
  if (has("Fantasy")) return moon;
  if (has("Action")) return rays;
  if (has("Thriller")) return doorway;
  return windowArt;
}

// kind: "poster" (2:3), "wide" (16:9, subject right of centre so text can sit left), "spread" (band, subject far right), "thumb" (16:9, small)
export function createKeyArt(movie, kind = "poster") {
  const [W, H, fx] = SIZES[kind] || SIZES.poster;
  const pal = PALETTES[toneOf(movie.title)];
  const art = motifFor(movie.genres || [])({ W, H, fx, pal, r: rng(hash(movie.title)), id: `ka${++uid}` });
  const holder = document.createElement("div");
  holder.className = "keyart";
  holder.setAttribute("aria-hidden", "true");
  const align = kind === "wide" || kind === "spread" ? "xMaxYMid" : "xMidYMid";
  holder.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="${align} slice" xmlns="http://www.w3.org/2000/svg">${art}</svg>`;
  return holder;
}
