// now-showing.js - movies that have screenings, with a genre filter.

let nowShowing = getNowShowing();
let selectedGenre = "";

let genreBox = document.getElementById("genre-buttons");
let movieBox = document.getElementById("movie-grid");
let countText = document.getElementById("result-count");


function showGenreButtons() {
    let names = [""].concat(getGenres(nowShowing));
    genreBox.innerHTML = "";

    for (let i = 0; i < names.length; i++) {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.textContent = names[i] == "" ? "All" : names[i];

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
        let count = countMovieShowtimes(results[i].id);
        movieBox.innerHTML += makePosterCard(results[i], count + " screenings");
    }
}

showGenreButtons();
showMovies();
