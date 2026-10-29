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

// How many screenings does a movie have?
function countMovieShowtimes(movieId) {
    let count = 0;
    for (let i = 0; i < showtimes.length; i++) {
        if (showtimes[i].movieId == movieId) {
            count = count + 1;
        }
    }
    return count;
}

// How many screenings does a cinema have?
function countCinemaShowtimes(cinemaId) {
    let count = 0;
    for (let i = 0; i < showtimes.length; i++) {
        if (showtimes[i].cinemaId == cinemaId) {
            count = count + 1;
        }
    }
    return count;
}

// Today's date as text like "2026-10-30" (same style as the dates in data.js).
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

// "Now showing" = movies that have at least one screening. The ones with the most screenings come first.
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

// "Coming soon" = movies released after today that have no screenings. The earliest release comes first.
function getComingSoon() {
    let today = getToday();
    let list = [];
    for (let i = 0; i < movies.length; i++) {
        if (movies[i].releaseDate > today && countMovieShowtimes(movies[i].id) == 0) {
            list.push(movies[i]);
        }
    }
    list.sort(function (a, b) {
        return a.releaseDate.localeCompare(b.releaseDate);
    });
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
        list.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });
    } else if (how == "oldest") {
        list.sort(function (a, b) {
            return a.releaseDate.localeCompare(b.releaseDate);
        });
    } else {
        list.sort(function (a, b) {
            return b.releaseDate.localeCompare(a.releaseDate);
        });
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
    let hours = Math.floor(minutes / 60);
    let left = minutes % 60;
    return hours + "h " + left + "m";
}

// "2026-10-30" -> "Fri Oct 30 2026"
function formatDate(dateText) {
    let date = new Date(dateText + "T00:00:00");
    return date.toDateString();
}

// "14:30" -> "2:30 PM"
function formatTime(time) {
    let parts = time.split(":");
    let hours = Number(parts[0]);
    let minutes = parts[1];
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
    return hours + ":" + minutes + " " + ampm;
}


// ================= Artwork =================
// There are no real posters yet, so each movie gets a simple picture drawn with SVG.
// The colours depend on the movie's first genre.

let artCount = 0;

function getArtColors(movie) {
    let genre = movie.genres[0];
    // Each list is [dark colour, middle colour, light colour].
    if (genre == "Horror") {
        return ["#1a0f0c", "#7a3320", "#f6b46b"];
    } else if (genre == "Science Fiction") {
        return ["#071419", "#14515d", "#9fdde3"];
    } else if (genre == "Action") {
        return ["#1b0810", "#7a1f35", "#ff97a8"];
    } else if (genre == "Animation") {
        return ["#08150f", "#21663f", "#a8e8bd"];
    } else if (genre == "Fantasy") {
        return ["#14140a", "#58571d", "#ecd982"];
    }
    return ["#100b1e", "#46327d", "#cdb4ff"];
}

// Draws a picture of the given size: a sky, a glowing sun and two dark hills.
function makeArt(movie, width, height) {
    let colors = getArtColors(movie);
    artCount = artCount + 1;
    let skyId = "sky" + artCount;
    let glowId = "glow" + artCount;

    // Wide pictures put the sun on the right so the text on the left stays readable.
    let sunX = width * 0.5;
    let align = "xMidYMid slice";
    if (width > height) {
        sunX = width * 0.78;
        align = "xMaxYMid slice";
    }
    let sunY = height * (0.3 + (movie.id % 3) * 0.08);
    let size = Math.min(width, height);

    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="${align}" aria-hidden="true">
        <defs>
            <linearGradient id="${skyId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="${colors[0]}"/>
                <stop offset="1" stop-color="${colors[1]}"/>
            </linearGradient>
            <radialGradient id="${glowId}">
                <stop offset="0" stop-color="${colors[2]}" stop-opacity="0.6"/>
                <stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#${skyId})"/>
        <circle cx="${sunX}" cy="${sunY}" r="${size * 0.5}" fill="url(#${glowId})"/>
        <circle cx="${sunX}" cy="${sunY}" r="${size * 0.14}" fill="${colors[2]}"/>
        <ellipse cx="${width * 0.25}" cy="${height * 1.02}" rx="${width * 0.7}" ry="${height * 0.2}" fill="${colors[0]}" opacity="0.85"/>
        <ellipse cx="${width * 0.9}" cy="${height * 1.05}" rx="${width * 0.6}" ry="${height * 0.17}" fill="${colors[0]}"/>
    </svg>`;
}

// A tall picture (2:3). Uses movie.poster if the movie has one, otherwise the drawing.
function makePoster(movie) {
    if (movie.poster) {
        return `<div class="poster"><img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"></div>`;
    }
    return `<div class="poster">${makeArt(movie, 400, 600)}</div>`;
}

// A wide picture (16:9). Uses movie.backdrop if the movie has one, otherwise the drawing.
function makeBackdrop(movie) {
    if (movie.backdrop) {
        return `<img class="backdrop-image" src="${movie.backdrop}" alt="">`;
    }
    return makeArt(movie, 1600, 900);
}


// A medium wide picture (16:9) for cards. Uses movie.backdrop if the movie has one, otherwise the drawing.
function makeStill(movie) {
    if (movie.backdrop) {
        return `<img class="backdrop-image" src="${movie.backdrop}" alt="" loading="lazy">`;
    }
    return makeArt(movie, 640, 360);
}


// ================= Movie cards =================

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

    html += `</a></article>`;
    return html;
}

// A wide picture with the release date above it (used for upcoming movies).
function makeUpcomingCard(movie) {
    let date = new Date(movie.releaseDate + "T00:00:00");
    let dayAndMonth = date.getDate() + " " + date.toLocaleString("en-GB", { month: "short" });

    return `<article class="upcoming-card">
        <a href="movie.html?id=${movie.id}">
            <p class="date-plate"><span class="big-date">${dayAndMonth}</span> ${getYear(movie)}</p>
            <div class="still">${makeStill(movie)}</div>
            <h3>${movie.title}</h3>
            <p class="small-text">${movie.genres.slice(0, 2).join(" / ")} &middot; ${formatRuntime(movie.runtime)}</p>
        </a>
    </article>`;
}


// ================= Showtimes =================

// Sort screenings by date, then by time.
function sortShowtimes(list) {
    list.sort(function (a, b) {
        return (a.date + a.time).localeCompare(b.date + b.time);
    });
}

// Takes the screenings of ONE movie at ONE cinema and shows one row for each date.
function makeDateRows(list) {
    sortShowtimes(list);

    let html = "";
    let lastDate = "";

    for (let i = 0; i < list.length; i++) {
        let show = list[i];

        // A new date starts a new row.
        if (show.date != lastDate) {
            if (lastDate != "") {
                html += `</div></div>`;
            }
            html += `<div class="date-row"><p class="date-label">${formatDate(show.date)}</p><div class="times">`;
            lastDate = show.date;
        }

        // "Sold out" becomes the class "sold-out", "Few left" becomes "few-left".
        let statusClass = show.tickets.toLowerCase().replace(" ", "-");

        // Only show the subtitle line when the screening has subtitles.
        let subtitleLine = "";
        if (show.subtitles != "None") {
            subtitleLine = `<small>${show.subtitles} subtitles</small>`;
        }

        html += `<span class="time ${statusClass}">${formatTime(show.time)}
            <small>${show.format} &middot; ${show.language}</small>
            ${subtitleLine}
            <small class="ticket-status">${show.tickets}</small></span>`;
    }

    if (list.length > 0) {
        html += `</div></div>`;
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
    if (window.scrollY > 30) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}
window.addEventListener("scroll", updateHeader);
updateHeader();

// Fill the cinema links in the footer.
let footerList = document.getElementById("footer-cinemas");
for (let i = 0; i < cinemas.length; i++) {
    footerList.innerHTML += `<li><a href="cinema.html?id=${cinemas[i].id}">${cinemas[i].name}</a></li>`;
}
