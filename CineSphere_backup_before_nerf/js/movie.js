// movie.js - shows ONE movie. The address looks like movie.html?id=3

let page = document.getElementById("movie-page");

// 1. Read the id from the address.
let parameters = new URLSearchParams(window.location.search);
let movieId = parameters.get("id");

// 2. Find that movie in the list.
let movie = getMovieById(movieId);

if (movie == null) {
    // No movie with that id: show a friendly message instead of a broken page.
    document.title = "Film not found | CineSphere";
    page.innerHTML = `<div class="container section">
        <div class="empty">
            <h1>We couldn't find that film</h1>
            <p>The link may be wrong, or the film is not in the list.</p>
            <a class="button" href="discover.html">Discover films</a>
        </div>
    </div>`;
} else {
    showMovie();
}


function showMovie() {
    document.title = movie.title + " (" + getYear(movie) + ") | CineSphere";

    // Link to a YouTube search, because the data has no trailer addresses.
    let trailerSearch = encodeURIComponent(movie.title + " " + getYear(movie) + " official trailer");

    // The top picture with the title.
    let html = `
        <header class="movie-hero">
            <div class="hero-slides"><div class="hero-slide active">${makeBackdrop(movie)}</div></div>
            <div class="hero-overlay"></div>
            <div class="container hero-content">
                <a class="arrow-link" href="discover.html">&larr; Back to Discover</a>
                <h1>${movie.title}</h1>
                <p>${getYear(movie)} &middot; ${formatRuntime(movie.runtime)} &middot; ${movie.genres.join(", ")} &middot; ${movie.language}</p>
            </div>
        </header>

        <div class="container movie-layout">
            <div class="movie-side">${makePoster(movie)}</div>
            <div class="movie-main">
                <p class="lead">${movie.overview}</p>
                <a class="button" href="https://www.youtube.com/results?search_query=${trailerSearch}" target="_blank" rel="noopener noreferrer">Find trailer on YouTube &#8599;</a>

                <dl class="facts">
                    <div><dt>Director</dt><dd>${movie.director}</dd></div>
                    <div><dt>Release</dt><dd>${formatDate(movie.releaseDate)}</dd></div>
                    <div><dt>Runtime</dt><dd>${formatRuntime(movie.runtime)}</dd></div>
                    <div><dt>Age rating</dt><dd>${movie.rating}</dd></div>
                    <div><dt>Language</dt><dd>${movie.language}</dd></div>
                    ${makeFormatFact()}
                    <div><dt>Genres</dt><dd>${movie.genres.join(", ")}</dd></div>
                    <div><dt>Cast</dt><dd>${movie.cast.join(", ")}</dd></div>
                </dl>

                <h2>Showtimes in Lahore</h2>
                ${makeShowtimeSection()}

                <h2>More like this</h2>
                <div class="poster-grid">${makeRelatedPosters()}</div>
            </div>
        </div>`;

    page.innerHTML = html;
}


// One extra row for the facts panel: which formats (2D, 3D, IMAX) the movie is shown in
// and whether any tickets are left. Returns nothing if the movie has no screenings.
function makeFormatFact() {
    let formats = [];
    let left = 0;
    let total = 0;

    for (let i = 0; i < showtimes.length; i++) {
        if (showtimes[i].movieId == movie.id) {
            total = total + 1;
            if (!formats.includes(showtimes[i].format)) {
                formats.push(showtimes[i].format);
            }
            if (showtimes[i].tickets != "Sold out") {
                left = left + 1;
            }
        }
    }

    if (total == 0) {
        return "";
    }

    let ticketText = left + " of " + total + " screenings have tickets";
    if (left == 0) {
        ticketText = "All screenings are sold out";
    }
    return `<div><dt>Formats</dt><dd>${formats.join(", ")}</dd></div>
        <div><dt>Tickets</dt><dd>${ticketText}</dd></div>`;
}


// For each cinema that shows this movie, make a block with the cinema name and the dates and times.
function makeShowtimeSection() {
    let html = "";

    for (let i = 0; i < cinemas.length; i++) {
        let cinema = cinemas[i];

        // Collect the screenings of this movie at this cinema.
        let list = [];
        for (let j = 0; j < showtimes.length; j++) {
            if (showtimes[j].movieId == movie.id && showtimes[j].cinemaId == cinema.id) {
                list.push(showtimes[j]);
            }
        }

        if (list.length > 0) {
            html += `<section class="show-group">
                <div>
                    <h3><a href="cinema.html?id=${cinema.id}">${cinema.name}</a></h3>
                    <p class="small-text">${cinema.area}</p>
                    <a class="small-link" href="${cinema.website}" target="_blank" rel="noopener noreferrer">Cinema website &#8599;</a>
                </div>
                <div>${makeDateRows(list)}</div>
            </section>`;
        }
    }

    if (html == "") {
        // No screenings at all.
        if (movie.releaseDate > getToday()) {
            return `<p class="empty">This film has not been released yet, so it has no screenings.</p>`;
        }
        return `<p class="empty">This film has no screenings at the moment.</p>`;
    }
    return html;
}


function makeRelatedPosters() {
    let related = getRelatedMovies(movie);
    let html = "";
    for (let i = 0; i < related.length; i++) {
        html += makePosterCard(related[i], "");
    }
    return html;
}
