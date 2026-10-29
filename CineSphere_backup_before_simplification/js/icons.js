// Inline SVG icons (static, trusted markup). Strokes inherit currentColor.
const PATHS = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  prev: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  next: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  external: '<path d="M8 16L18 6M9 6h9v9"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.5c0 5.6-7.5 10.2-7.5 10.2z"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>'
};

export function icon(name) {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  const filled = name === "play";
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="${filled ? "none" : "currentColor"}" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter">${PATHS[name] || ""}</svg>`;
  return span;
}
