// discover.js - search, genre filter and sorting for all movies.

let searchBox = document.getElementById("search");
let sortBox = document.getElementById("sort");
let genreBox = document.getElementById("genre-buttons");
let movieBox = document.getElementById("movie-grid");
let countText = document.getElementById("result-count");

let selectedGenre = "";   // "" means all genres

// The header search form sends the visitor here with ?q=... in the address.
let parameters = new URLSearchParams(window.location.search);
searchBox.value = parameters.get("q") || "";
selectedGenre = parameters.get("genre") || "";


// Create one button for "All" and one for each genre.
function showGenreButtons() {
    let genres = getGenres(movies);
    genreBox.innerHTML = "";

    // The list of buttons starts with "All" (an empty text means no genre filter).
    let names = [""].concat(genres);

    for (let i = 0; i < names.length; i++) {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "chip";

        if (names[i] == "") {
            button.textContent = "All";
        } else {
            button.textContent = names[i];
        }

        // The chosen genre gets the "selected" look.
        if (names[i] == selectedGenre) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.setAttribute("aria-pressed", "false");
        }

        button.addEventListener("click", function () {
            selectedGenre = names[i];
            showGenreButtons();
            showMovies();
        });
        genreBox.appendChild(button);
    }
}


// Search + genre + sort, then show the result.
function showMovies() {
    let searchText = searchBox.value.trim();
    let results = [];

    // 1. Keep only the movies that match the search text AND the chosen genre.
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        let matchesSearch = movieMatches(movie, searchText);
        let matchesGenre = (selectedGenre == "" || movie.genres.includes(selectedGenre));

        if (matchesSearch && matchesGenre) {
            results.push(movie);
        }
    }

    // 2. Sort them.
    sortMovies(results, sortBox.value);

    // 3. Show how many were found.
    countText.textContent = "Showing " + results.length + " of " + movies.length + " films";

    // 4. Show the posters, or a message if nothing was found.
    movieBox.innerHTML = "";
    if (results.length == 0) {
        movieBox.innerHTML = `<div class="empty">
            <h3>No films match</h3>
            <p>Try a different title, choose another genre, or clear the filters.</p>
            <button type="button" class="button button-light" id="empty-clear">Clear all filters</button>
        </div>`;
        document.getElementById("empty-clear").addEventListener("click", clearFilters);
        return;
    }
    for (let i = 0; i < results.length; i++) {
        movieBox.innerHTML += makePosterCard(results[i], "");
    }
}


// Put everything back to how it was at the start.
function clearFilters() {
    searchBox.value = "";
    sortBox.value = "newest";
    selectedGenre = "";
    showGenreButtons();
    showMovies();
}


// Events: run showMovies again whenever the visitor changes something.
searchBox.addEventListener("input", showMovies);
sortBox.addEventListener("change", showMovies);
document.getElementById("clear-filters").addEventListener("click", clearFilters);
// Pressing Enter in the search box should not reload the page.
document.getElementById("filter-form").addEventListener("submit", function (event) {
    event.preventDefault();
});

showGenreButtons();
showMovies();
