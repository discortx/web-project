# NERF_PHASE_2_REPORT.md — HTML and CSS

Backup of the pre-NERF state: `../CineSphere_backup_before_nerf/`. No JavaScript was changed.

## Files modified

- All 8 HTML files: `index`, `discover`, `now-showing`, `coming-soon`, `cinemas`, `cinema`, `movie`, `404`.
- `css/style.css`.

## What was simplified or removed

**HTML**
- Removed the two `<link rel="preconnect">` lines from the `<head>` of every page (16 lines). They are a loading hint only.
- Everything else was kept on purpose:
  - all IDs and classes that JavaScript uses
  - `role="search"`, `aria-*` attributes and the skip link (accessibility)
  - the repeated header and footer, as agreed, because removing them would need JavaScript
- I looked for wrapper divs that could go. The remaining wrappers either carry styling (`hero-overlay`, `pick-picture`, `section-head`) or are the semantic structure, so I did not flatten them.

**CSS**
- Removed the unused `.note` and `.note strong` rules. No page or script uses that class.
- Removed the card zoom-on-hover effect: the `transform: scale(1.04)` rule and the `transition` rule on SVG artwork. It was decorative. It only applied to the drawn fallback pictures, because the real posters (`<img>`) never zoomed.
- Reduced the `prefers-reduced-motion` block to the one remaining transition (the hero fade).
- Removed a duplicated `.site-header .nav { background }` rule, because `.nav` already sets the same background.
- Phone breakpoint: the `.upcoming-list` and `.facts` columns were set twice, first to 2 columns and then to 1. I now set each once.
- Fixed the comments to match (hover shadow, reduced motion).
- Did not touch the colour and shadow custom properties. They are used many times and are easy to explain.

## Lines of code (measured; "code" excludes blanks and comments)

| | Before total | After total | Before code | After code |
|---|---:|---:|---:|---:|
| 8 HTML files | 770 | 754 | 725 | 709 |
| `style.css` | 1,204 | 1,172 | 958 | 934 |
| **Total** | 1,974 | 1,926 | 1,683 | 1,643 |

Phase 2 saved 40 code lines. That is below the ~190 I estimated in the analysis. The HTML is already minimal apart from the repeated header and footer, and the CSS has little real duplication. I did not push further, because merging rules would trade readability for line count.

## Testing

Method: headless Google Chrome screenshots of 9 pages, each at 1280px and 400px wide (18 screenshots), taken from the backup and from the edited site, then compared pixel by pixel. Pages: home, discover, discover `?q=dune`, now showing, coming soon, cinemas, cinema `?id=C001`, movie `?id=3`, 404.

- 16 of 18 screenshots are pixel-identical. That includes every page at phone width and every inner page at desktop width.
- `404` at 1280px differed slightly. I re-shot the **unchanged** backup page twice and got the same size of difference between those two runs, so this is rendering noise, not a regression. The two 404 images also look the same side by side.
- Home at 1280px differed because the cover slideshow was on a different film in each screenshot. I did not rule out a CSS cause pixel by pixel, because the hero fills most of that tall window and the slide dominates the comparison. The slideshow rules that I touched were not changed, but I have not directly confirmed this page beyond the side-by-side view.
- Not tested: hover and active states, the opened mobile menu, and the 900px tablet width. These styles were not edited, apart from the zoom effect and the removed duplicate nav background. I am recommending a manual look at the menu on a phone-width window.
- JavaScript-required IDs and classes: every HTML change was a deleted `<link>` line, so no IDs or classes were touched.

## Visual differences

- None visible. The only intended change is that drawn fallback pictures no longer zoom on hover. No page currently shows a drawn picture, because all 22 films have images.

## Remaining issues

- `index.html` still says "Illustrated artwork. Official posters can be added once real film data is available." That sentence is outdated, since real posters are in place. It is content, so I left it. I suggest removing it in Phase 3 together with the SVG artwork.
- `README.md` and `VIVA_GUIDE.md` still mention the old structure in places and will need a final check once Phase 3 is done.
