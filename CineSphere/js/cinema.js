// cinema.js - shows ONE cinema. The address looks like cinema.html?id=C001

let page = document.getElementById("cinema-page");

// 1. Read the id from the address and find the cinema.
let parameters = new URLSearchParams(window.location.search);
let cinema = getCinemaById(parameters.get("id"));

if (cinema == null) {
    document.title = "Cinema not found | CineSphere";
    page.innerHTML = `<div class="container section">
        <div class="empty">
            <h1>We couldn't find that cinema</h1>
            <p>The link may be wrong, or the cinema is not in the directory.</p>
            <a class="button" href="cinemas.html">Browse cinemas</a>
        </div>
    </div>`;
} else {
    showCinema();
}


function showCinema() {
    document.title = cinema.name + " | CineSphere";

    page.innerHTML = `
        <header class="container page-head">
            <a class="arrow-link" href="cinemas.html">&larr; All cinemas</a>
            <p class="eyebrow">${cinema.area}</p>
            <h1>${cinema.name}</h1>
            <p class="lead">${cinema.address}</p>
            <a class="button button-light" href="${cinema.website}" target="_blank" rel="noopener noreferrer">Official website &#8599;</a>
        </header>
        <div class="container section">
            <h2>Showtimes</h2>
            ${makeShowtimeSection()}
        </div>`;
}


// For each movie that is shown at this cinema, make a block with the movie title and the dates and times.
function makeShowtimeSection() {
    let html = "";

    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        let list = findShowtimes(movie.id, cinema.id);

        if (list.length > 0) {
            html += `<section class="show-group">
                <div class="show-movie">
                    <a class="show-poster" href="movie.html?id=${movie.id}" tabindex="-1" aria-hidden="true">${makePoster(movie)}</a>
                    <div>
                        <h3><a href="movie.html?id=${movie.id}">${movie.title}</a></h3>
                        <p class="small-text">${formatRuntime(movie.runtime)} &middot; ${movie.genres[0]}</p>
                    </div>
                </div>
                <div>${makeDateRows(list)}</div>
            </section>`;
        }
    }

    if (html == "") {
        return `<p class="empty">No screenings are scheduled at this cinema.</p>`;
    }
    return html;
}
