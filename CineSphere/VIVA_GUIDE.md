# CineSphere: Viva Study Guide

Everything here describes the code that is actually in the project. File names are in `js/` and `css/`.

## 1. The project in one minute

CineSphere is a multi-page website about films and cinemas in Lahore. It is built with only **HTML, CSS and JavaScript**.

- Each page is a normal `.html` file. The links between pages are ordinary `<a href>` links.
- All the information (films, cinemas, screenings) is stored in **three arrays** in `js/data.js`.
- Each page has its own small script that **reads the arrays and writes HTML into the page**.
- Shared code is in `js/main.js`. All styling is in `css/style.css`.
- The screenings are **demonstration data**, not real schedules. The site says so wherever they appear.

To run it: double-click `index.html`. No server is needed, because the data is a normal JavaScript file and not fetched.

## 2. File map

| File | What it does |
|---|---|
| `index.html`, `discover.html`, `now-showing.html`, `coming-soon.html`, `cinemas.html`, `movie.html`, `cinema.html`, `404.html` | The pages. Each has the same header and footer and loads its own script at the bottom. |
| `js/data.js` | The data: `movies`, `cinemas`, `showtimes` (three arrays of objects). |
| `js/main.js` | Shared functions and the menu, header and footer code. Loaded on every page. |
| `js/home.js` | Home page: cover slideshow, rows of films, cinema list. |
| `js/discover.js` | Search, genre filter, sorting. |
| `js/movie.js` | One movie, chosen by `?id=` in the address. |
| `js/cinema.js` | One cinema, chosen by `?id=` in the address. |
| `js/now-showing.js`, `js/coming-soon.js`, `js/cinemas.js` | The other list pages. |
| `css/style.css` | All the styles, in numbered sections. |

Script order on every page is always **data.js, then main.js, then the page's own script**, because each one uses things created by the one before it.

## 3. The concepts that really appear in the code

### HTML
Semantic tags (`header`, `nav`, `main`, `section`, `footer`, `article`, `form`), headings in order, `<label for="...">` on inputs, `alt` text on images, `aria-label` on icon-style buttons, a "skip to content" link, and `aria-current="page"` on the current menu link.

### CSS
- **Variables**: `--bg`, `--raised`, `--inset`, `--red` and so on, defined once in `:root`.
- **Flexbox** for rows (header, buttons, filters, showtimes). **Grid** for the poster grid, the footer, and two-column layouts.
- **Neumorphism**: surfaces are almost the same dark grey, and depth comes from two `box-shadow` values, one dark (bottom right) and one light (top left). "Raised" looks pushed out, "inset" looks pushed in. Pressing a button swaps raised for inset.
- **Media queries**: `@media (max-width: 900px)` (tablet: menu becomes a button, fewer columns) and `@media (max-width: 600px)` (phone: one or two columns). One more query, `prefers-reduced-motion`, turns off the zoom and fade for people who ask for less motion.
- `:hover`, `:active` and `:focus` states, `position: fixed` for the header, `position: sticky` for the poster on the movie page, `aspect-ratio` to keep posters 2:3.

### JavaScript
- **Variables**: `let` everywhere (for values that change or are set once).
- **Arrays and objects**: `movies`, `cinemas`, `showtimes`; each item is an object like `{ id: 1, title: "...", genres: [...] }`.
- **Loops**: `for (let i = 0; i < list.length; i++)`. **Conditions**: `if`, `else if`, `else`.
- **Functions**: small, named, one job each (`getMovieById`, `formatTime`, `showMovies`...).
- **DOM**: `document.getElementById`, `querySelectorAll`, `innerHTML`, `textContent`, `classList.add/remove/toggle`, `setAttribute`, `createElement`, `appendChild`.
- **Events**: `addEventListener` for `click`, `input`, `change`, `submit`, `keydown`, `scroll`, `mouseenter`, `mouseleave`.
- **Query parameters**: `new URLSearchParams(window.location.search)` and `.get("id")`.
- **Timer**: `setInterval` (the cover slideshow changes every 5 seconds).
- **Template strings** with backticks and `${ }` to build HTML text.
- `.sort()` with a small compare function, `.includes()`, `.slice()`, `.join()`, `.push()`, `.split()`.

Nothing else is used: no modules, no `fetch`, no `async/await`, no classes, no arrow functions, no `map/filter/reduce`, no spread.

## 4. How the main features work

**Rendering movie cards** (used on almost every page, in `main.js`): `makePosterCard(movie, tagText)` returns a piece of HTML text for one card. A page script loops through a list of movies, adds one card per movie to a container, and the browser draws them.

**Search** (`discover.js`): read the text in the box, loop over all movies, keep the ones where `movieMatches` is true, show them. It runs again on every `input` event, so results update while typing.

**Genre filter**: a variable `selectedGenre` remembers the chosen genre (`""` means all). Search and genre are checked together in one `if` with `&&`, so they always combine.

**Sorting**: `sortMovies(list, how)` calls `list.sort()` with a compare function. `localeCompare` compares two pieces of text (it returns a negative number, zero or a positive number).

**Movie detail page**: read `?id=` from the address, find that movie with `getMovieById`, then build the page. If it returns `null` the page shows "We couldn't find that film" and a link back.

**Showtimes**: for a movie, loop over cinemas; for each cinema collect that movie's screenings; if there are any, show the cinema name and one row per date, with a "ticket" for each time. Each ticket shows the time, the format (2D, 3D, IMAX, 4DX, Dolby Atmos), the language and the ticket status (`tickets` field: Available, Few left, Sold out). The status text is turned into a CSS class (`"Sold out"` becomes `sold-out`) so the style can change. The film page also loops over the screenings to list the formats and count how many still have tickets.

**Mobile menu**: the Menu button toggles the class `open` on the `<nav>`. CSS hides the nav on small screens until it has that class. Escape closes it.

**Cover slideshow** (`home.js`): five slides are stacked on top of each other. Only the slide with the class `active` has `opacity: 1`. `showSlide(number)` moves the class to another slide and updates the "On the cover" link. The arrows, dots and a 6-second timer all call `showSlide`.

## 5. Code walkthroughs

### 5.1 `movieMatches` (main.js)

```javascript
function movieMatches(movie, searchText) {
    let allText = movie.title + " " + movie.genres.join(" ") + " " + movie.director + " " + movie.cast.join(" ");
    return allText.toLowerCase().includes(searchText.toLowerCase());
}
```
1. The function receives one movie and the text typed by the visitor.
2. It joins the title, genres, director and cast into one long piece of text. `join(" ")` turns an array into text with spaces between the items.
3. It makes both texts lowercase so capital letters do not matter, then asks `includes`: is the search text somewhere inside? The answer is `true` or `false`.
4. An empty search text is always found (`includes("")` is `true`), so with an empty box every movie matches.

### 5.2 `showMovies` (discover.js)

```javascript
function showMovies() {
    let searchText = searchBox.value.trim();
    let results = [];
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        let matchesSearch = movieMatches(movie, searchText);
        let matchesGenre = (selectedGenre == "" || movie.genres.includes(selectedGenre));
        if (matchesSearch && matchesGenre) {
            results.push(movie);
        }
    }
    sortMovies(results, sortBox.value);
    countText.textContent = "Showing " + results.length + " of " + movies.length + " films";
    movieBox.innerHTML = "";
    if (results.length == 0) { ...show the "No films match" box... return; }
    for (let i = 0; i < results.length; i++) {
        movieBox.innerHTML += makePosterCard(results[i], "");
    }
}
```
1. Read the search box (`trim` removes spaces at the ends) and make an empty `results` array.
2. Go through every movie. A movie is kept only if it matches the text **and** the genre. `||` means "or": if no genre is chosen, every movie passes the genre test.
3. Sort the kept movies using the sort dropdown's value.
4. Write the count. Clear the container (`innerHTML = ""`).
5. If nothing was found, show a message with a "Clear all filters" button and stop (`return`).
6. Otherwise add one card per movie. `+=` on `innerHTML` adds to what is already there.

### 5.3 `getNowShowing` (main.js)

```javascript
function getNowShowing() {
    let list = [];
    for (let i = 0; i < movies.length; i++) {
        if (countMovieShowtimes(movies[i].id) > 0) {
            list.push(movies[i]);
        }
    }
    list.sort(function (a, b) {
        return countMovieShowtimes(b.id) - countMovieShowtimes(a.id);
    });
    return list;
}
```
"Now showing" simply means "has at least one screening". The loop collects those movies. `sort` is given a function that compares two movies; subtracting counts puts the movie with more screenings first.

### 5.4 Reading the id from the address (movie.js)

```javascript
let parameters = new URLSearchParams(window.location.search);
let movieId = parameters.get("id");
let movie = getMovieById(movieId);
if (movie == null) { ...not found message... } else { showMovie(); }
```
For the address `movie.html?id=3`, `window.location.search` is `"?id=3"`. `URLSearchParams` splits it, and `get("id")` returns `"3"`. `getMovieById` loops through `movies` and returns the one whose `id` equals it (`==` is used so the text `"3"` equals the number `3`).

### 5.5 `showSlide` (home.js)

```javascript
function showSlide(number) {
    if (number >= coverFilms.length) { number = 0; }
    if (number < 0) { number = coverFilms.length - 1; }
    currentSlide = number;
    ... loop: the slide whose index equals currentSlide gets the class "active", the others lose it ...
    ... update the "On the cover" link text and address ...
}
```
The two `if` lines make the slideshow wrap around: after the last slide comes the first; before the first comes the last. CSS does the visible work: `.hero-slide` has `opacity: 0` and `.hero-slide.active` has `opacity: 1`, with a 0.5 second `transition`.

### 5.6 `makeDateRows` (main.js)
It receives the screenings of one film at one cinema, sorts them by date and time, and walks through them. Whenever the date changes, it closes the previous row and starts a new row (`<div class="date-row">`). Each screening becomes a small "time" box. The variable `lastDate` remembers the previous date so the loop can notice a change.

## 6. Parts that are still a little advanced, and why they stay

| Part | Why it remains |
|---|---|
| Template strings with `${}` inside backticks | The easiest way to write HTML with data in it. |
| `list.sort(function (a, b) { ... })` | Sorting always needs a compare function. It is explained in 5.3. |
| `new URLSearchParams(...)` | The standard tool for reading `?id=3`. |
| SVG drawing in `makeArt` | There are no real posters, so the site draws simple pictures. It is only text with numbers in it. |
| CSS `grid`, `aspect-ratio`, `position: sticky` | Basic layout tools. Each is used in a few lines. |
| `setInterval` | One timer for the slideshow. |

## 7. What was removed or simplified (compared with the earlier version)

- All JavaScript **modules**, `fetch`, `async/await`, `Promise`, **classes**, `Map`/`Set`, `reduce`, spread and destructuring, arrow functions, and a custom debounce function.
- The **JSON data files and the Node tools** that created them. The data now lives in `js/data.js`.
- The generated **SVG key art engine** (six drawing functions with a random number generator). It is now one function, `makeArt`, with one picture style and colours chosen by genre.
- **Saved films** (the heart button and `localStorage`), the **city selector**, the **search pop-up dialog** with live suggestions (replaced by a search box in the header that opens the Discover page), **scroll-reveal animations**, **loading skeletons** and **error states** for loading data (the data can no longer fail to load), "Load more" paging, the **year and status filters**, the **day picker** on showtimes (replaced by a simple list of dates), month groups on Coming Soon, and the cinema "area" filter.
- Four CSS files became one, long one-line rules became short readable rules, and many extra effects were removed: scroll animations, engraved divider shadows, extra variables, forced-colours rules, extra breakpoints.

## 8. Likely viva questions

1. **What is the project?** A website that helps people in Lahore find films, upcoming releases and cinemas. It uses only HTML, CSS and JavaScript.
2. **Where does the data come from?** From three arrays in `data.js`. The films are real titles with hand-written details. The screenings are demonstration data, not real schedules.
3. **Why is `data.js` loaded before `main.js`?** `main.js` uses `movies`, `cinemas` and `showtimes`, so they must already exist.
4. **How does one script file work on many pages?** Each page loads `main.js` for shared code and then only its own script, so a page never runs code meant for another page.
5. **What is an object? Show one.** A group of named values: `{ id: 1, title: "Alien: Romulus", genres: ["Horror"] }`. You read a value with a dot: `movie.title`.
6. **What is an array?** An ordered list. `movies` is an array of movie objects. `movies[0]` is the first one, `movies.length` is how many there are.
7. **Why use a `for` loop here?** To visit every item in a list once, for example to build one card per movie.
8. **How does the page show movie cards?** Find the container, clear it, loop through the movies, build a card text for each, and add it to the container with `innerHTML +=`.
9. **What does `getElementById` do?** Finds the one element in the page that has that `id`, so JavaScript can read or change it.
10. **What is the difference between `innerHTML` and `textContent`?** `innerHTML` reads or writes HTML (tags are understood). `textContent` reads or writes plain text. `textContent` is safer for text that came from a visitor.
11. **Is `innerHTML` safe here?** The HTML comes from our own data file, which we control, so yes. We never put what the visitor typed into `innerHTML`.
12. **How does search work?** On every key typed, `showMovies` loops through all movies and keeps those where `movieMatches` is true for the typed text.
13. **How do search and genre work together?** Both tests are in one `if` joined with `&&`, so a movie must pass both.
14. **How does sorting work?** `sort` takes a compare function. For titles it uses `localeCompare`. For dates it compares the date texts, which sort correctly because they are written year-month-day.
15. **What does `addEventListener` do?** It tells the browser: when this event happens on this element, run this function. Examples: `click`, `input`, `change`.
16. **What is the query parameter in `movie.html?id=3`?** The part after `?` that passes information to the page. `URLSearchParams` reads it. It is how one `movie.html` file can show any movie.
17. **What happens if the id is wrong?** `getMovieById` returns `null` and the page shows a "We couldn't find that film" message with a link to Discover.
18. **How does the mobile menu work?** The button toggles the class `open` on the nav. In CSS, below 900px the nav is `display: none` unless it has `open`. `aria-expanded` tells screen readers whether it is open.
19. **How is the site responsive?** Percent widths and a `max-width` container, flexbox that wraps, grids whose column count changes inside media queries at 900px and 600px.
20. **Flexbox or grid? Why both?** Flexbox lays things out in one line (header, buttons, filters). Grid lays out rows and columns (poster grid, footer, two-column sections).
21. **What are CSS variables?** Named values in `:root`, like `--red`. Used with `var(--red)`. If we change the colour once, it changes everywhere.
22. **What is neumorphism and how did you do it?** A style where elements look pushed out of, or into, the surface. It uses two `box-shadow` values: a dark one on one side and a light one on the other. Inset shadows look pressed in.
23. **Why do the inputs have a visible border?** Soft shadows alone are hard to see for some people, so inputs have a clear grey border and a strong focus outline.
24. **How did you make it accessible?** Semantic tags, labels on inputs, alt text and aria labels, a skip link, a visible focus outline, `aria-current` and `aria-pressed` for the current state, good text contrast, and reduced motion support.
25. **How does the slideshow work?** Slides are stacked. The one with class `active` is visible (opacity 1). `showSlide` moves that class. A timer calls it every 5 seconds, the arrows and dots call it too, and it pauses while the mouse is over the text.
26. **Why are the posters drawings?** There are no poster images in the project data. The code draws a simple SVG picture for each film. If a movie gets a `poster` field, the real image is used instead.
27. **How do you know a film is "now showing"?** It has at least one screening in `showtimes`. A film is "coming soon" if its release date is after today and it has no screenings.
28. **Why are the showtimes labelled as demonstration?** They were made up for the project. Showing them as real would be misleading, so every place that shows them says they are not live and cannot be booked.
29. **What does `localeCompare` return?** A negative number if the first text sorts before the second, zero if equal, and a positive number if after.
30. **What would you add next?** Real poster images, real cinema schedules from an API, and a saved-films list.
