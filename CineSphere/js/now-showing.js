// now-showing.js - movies that have screenings, with a genre filter.

let nowShowing = getNowShowing();
let selectedGenre = "";

let genreBox = document.getElementById("genre-buttons");
let movieBox = document.getElementById("movie-grid");
let countText = document.getElementById("result-count");


function showGenreButtons() {
    makeGenreButtons(genreBox, getGenres(nowShowing), selectedGenre, pickGenre);
}

function pickGenre(genre) {
    selectedGenre = genre;
    showGenreButtons();
    showMovies();
}


function showMovies() {
    // Keep only the movies with the chosen genre.
    let results = [];
    for (let i = 0; i < nowShowing.length; i++) {
        if (selectedGenre == "" || nowShowing[i].genres.includes(selectedGenre)) {
            results.push(nowShowing[i]);
        }
    }

    countText.textContent = results.length + " films now showing";

    movieBox.innerHTML = "";
    if (results.length == 0) {
        movieBox.innerHTML = `<p class="empty">No films in this genre. Choose another genre.</p>`;
    }
    for (let i = 0; i < results.length; i++) {
        let count = findShowtimes(results[i].id, "any").length;
        movieBox.innerHTML += makePosterCard(results[i], count + " screenings");
    }
}

showGenreButtons();
showMovies();
