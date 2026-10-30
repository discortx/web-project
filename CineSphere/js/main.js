// main.js - code that every page uses.
// It needs data.js to be loaded first (data.js creates the lists: movies, cinemas, showtimes).


// ================= Finding things in the data =================

// Find one movie by its id. Returns null if there is no such movie.
function getMovieById(id) {
    for (let i = 0; i < movies.length; i++) {
        if (movies[i].id == id) {
            return movies[i];
        }
    }
    return null;
}

// Find one cinema by its id. Returns null if there is no such cinema.
function getCinemaById(id) {
    for (let i = 0; i < cinemas.length; i++) {
        if (cinemas[i].id == id) {
            return cinemas[i];
        }
    }
    return null;
}

// Find the screenings of one movie at one cinema. Use "any" for the movie or the cinema to skip that check.
// Examples: findShowtimes(3, "C001")  or  findShowtimes(3, "any").length  (how many screenings movie 3 has)
function findShowtimes(movieId, cinemaId) {
    let list = [];
    for (let i = 0; i < showtimes.length; i++) {
        let movieOk = (movieId == "any" || showtimes[i].movieId == movieId);
        let cinemaOk = (cinemaId == "any" || showtimes[i].cinemaId == cinemaId);
        if (movieOk && cinemaOk) {
            list.push(showtimes[i]);
        }
    }
    return list;
}

// Today's date as text like "2026-10-30" (same style as the dates in data.js).
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

// "Now showing" = movies that have at least one screening. The ones with the most screenings come first.
function getNowShowing() {
    let list = [];
    for (let i = 0; i < movies.length; i++) {
        if (findShowtimes(movies[i].id, "any").length > 0) {
            list.push(movies[i]);
        }
    }
    list.sort(function (a, b) {
        return findShowtimes(b.id, "any").length - findShowtimes(a.id, "any").length;
    });
    return list;
}

// "Coming soon" = movies released after today that have no screenings. The earliest release comes first.
function getComingSoon() {
    let today = getToday();
    let list = [];
    for (let i = 0; i < movies.length; i++) {
        if (movies[i].releaseDate > today && findShowtimes(movies[i].id, "any").length == 0) {
            list.push(movies[i]);
        }
    }
    list.sort(function (a, b) { return a.releaseDate.localeCompare(b.releaseDate); });
    return list;
}

// Does this movie match the text typed in a search box? Looks at title, genres, director and cast.
function movieMatches(movie, searchText) {
    let allText = movie.title + " " + movie.genres.join(" ") + " " + movie.director + " " + movie.cast.join(" ");
    return allText.toLowerCase().includes(searchText.toLowerCase());
}

// Make a list of the different genres in a list of movies (each genre only once).
function getGenres(list) {
    let genres = [];
    for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].genres.length; j++) {
            if (!genres.includes(list[i].genres[j])) {
                genres.push(list[i].genres[j]);
            }
        }
    }
    genres.sort();
    return genres;
}

// Sort a list of movies. how is "newest", "oldest" or "title".
function sortMovies(list, how) {
    if (how == "title") {
        list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (how == "oldest") {
        list.sort(function (a, b) { return a.releaseDate.localeCompare(b.releaseDate); });
    } else {
        list.sort(function (a, b) { return b.releaseDate.localeCompare(a.releaseDate); });
    }
}

// Movies that share the first genre with this movie (used for "More like this").
function getRelatedMovies(movie) {
    let list = [];
    for (let i = 0; i < movies.length; i++) {
        if (movies[i].id != movie.id && movies[i].genres.includes(movie.genres[0])) {
            list.push(movies[i]);
        }
    }
    return list.slice(0, 4);
}


// ================= Turning data into text =================

// Release year, for example "2024".
function getYear(movie) {
    return movie.releaseDate.slice(0, 4);
}

// 119 minutes -> "1h 59m"
function formatRuntime(minutes) {
    return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
}

// "2026-10-30" -> "Fri Oct 30 2026"
function formatDate(dateText) {
    return new Date(dateText + "T00:00:00").toDateString();
}

// "14:30" -> "2:30 PM"
function formatTime(time) {
    let parts = time.split(":");
    let hours = Number(parts[0]);
    let ampm = "AM";

    if (hours >= 12) {
        ampm = "PM";
    }
    if (hours > 12) {
        hours = hours - 12;
    }
    if (hours == 0) {
        hours = 12;
    }
    return hours + ":" + parts[1] + " " + ampm;
}


// ================= Pictures and movie cards =================

// A tall picture (2:3) of the movie poster.
function makePoster(movie) {
    return `<div class="poster"><img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"></div>`;
}

// A wide picture (16:9). Used for the cover slideshow, the upcoming cards and the editor's pick.
function makeBackdrop(movie) {
    return `<img class="backdrop-image" src="${movie.backdrop}" alt="" loading="lazy">`;
}

// A poster with the title and year under it. tagText is optional small text such as "8 screenings".
function makePosterCard(movie, tagText) {
    let html = `<article class="poster-card">
        <a href="movie.html?id=${movie.id}">
            ${makePoster(movie)}
            <h3>${movie.title}</h3>
            <p class="small-text">${getYear(movie)} &middot; ${movie.genres[0]}</p>`;

    if (tagText) {
        html += `<p class="tag">${tagText}</p>`;
    }
    return html + `</a></article>`;
}

// A wide picture with the release date above it (used for upcoming movies).
function makeUpcomingCard(movie) {
    let date = new Date(movie.releaseDate + "T00:00:00");
    let dayAndMonth = date.getDate() + " " + date.toLocaleString("en-GB", { month: "short" });

    return `<article class="upcoming-card">
        <a href="movie.html?id=${movie.id}">
            <p class="date-plate"><span class="big-date">${dayAndMonth}</span> ${getYear(movie)}</p>
            <div class="still">${makeBackdrop(movie)}</div>
            <h3>${movie.title}</h3>
            <p class="small-text">${movie.genres.slice(0, 2).join(" / ")} &middot; ${formatRuntime(movie.runtime)}</p>
        </a>
    </article>`;
}

// One row of the cinema list (home page and cinemas page). number is the position, starting at 1.
function makeCinemaRow(cinema, number) {
    return `<li class="cinema-row">
        <span class="cinema-number">0${number}</span>
        <div>
            <h3><a href="cinema.html?id=${cinema.id}">${cinema.name}</a></h3>
            <p class="small-text">${cinema.area}</p>
        </div>
        <p class="small-text">${cinema.address}</p>
        <p class="small-text"><strong>${findShowtimes("any", cinema.id).length}</strong> demo screenings</p>
        <a class="arrow-link" href="cinema.html?id=${cinema.id}">Showtimes &rarr;</a>
    </li>`;
}

// Fills a box with a button for "All" and one for each genre.
// The button that matches "selected" gets the selected look. Clicking a button runs onClick(genre).
// ("" means all genres.)
function makeGenreButtons(box, genres, selected, onClick) {
    let names = [""].concat(genres);
    box.innerHTML = "";

    for (let i = 0; i < names.length; i++) {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.textContent = names[i];
        if (names[i] == "") {
            button.textContent = "All";
        }

        button.setAttribute("aria-pressed", names[i] == selected);
        if (names[i] == selected) {
            button.classList.add("selected");
        }

        button.addEventListener("click", function () {
            onClick(names[i]);
        });
        box.appendChild(button);
    }
}


// ================= Showtimes =================

// Takes the screenings of ONE movie at ONE cinema and shows one row for each date.
function makeDateRows(list) {
    list.sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });

    // The different dates, in order.
    let dates = [];
    for (let i = 0; i < list.length; i++) {
        if (!dates.includes(list[i].date)) {
            dates.push(list[i].date);
        }
    }

    let html = "";
    for (let i = 0; i < dates.length; i++) {
        // One box for each screening on this date.
        let times = "";
        for (let j = 0; j < list.length; j++) {
            let show = list[j];
            if (show.date == dates[i]) {
                // "Sold out" becomes the class "sold-out", "Few left" becomes "few-left".
                let statusClass = show.tickets.toLowerCase().replace(" ", "-");

                // Only show the subtitle line when the screening has subtitles.
                let subtitleLine = "";
                if (show.subtitles != "None") {
                    subtitleLine = `<small>${show.subtitles} subtitles</small>`;
                }

                times += `<span class="time ${statusClass}">${formatTime(show.time)}
                    <small>${show.format} &middot; ${show.language}</small>
                    ${subtitleLine}
                    <small class="ticket-status">${show.tickets}</small></span>`;
            }
        }
        html += `<div class="date-row"><p class="date-label">${formatDate(dates[i])}</p><div class="times">${times}</div></div>`;
    }
    return html;
}


// ================= Page features (run on every page) =================

// Open and close the menu on small screens.
let menuButton = document.getElementById("menu-button");
let nav = document.getElementById("nav");

menuButton.addEventListener("click", function () {
    let isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", isOpen);
});

// The Escape key closes the menu.
document.addEventListener("keydown", function (event) {
    if (event.key == "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", false);
        menuButton.focus();
    }
});

// The home page header starts see-through and gets a solid colour after the page is scrolled.
let header = document.getElementById("site-header");

function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 30);
}
window.addEventListener("scroll", updateHeader);
updateHeader();

// Fill the cinema links in the footer.
let footerList = document.getElementById("footer-cinemas");
for (let i = 0; i < cinemas.length; i++) {
    footerList.innerHTML += `<li><a href="cinema.html?id=${cinemas[i].id}">${cinemas[i].name}</a></li>`;
}
