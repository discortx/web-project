// home.js - the home page.
// Parts: 1) cover slideshow  2) now showing  3) coming soon  4) editor's pick  5) cinemas


// ================= 1. Cover slideshow =================
// Five films take turns on the cover. The slides are stacked; only the one with the class "active" is visible.

let nowShowing = getNowShowing();
let coverFilms = [];
let currentSlide = 0;
let mouseIsOverCover = false;

// Choose five films. Films that are not animated go first so the cover opens with a serious film.
for (let i = 0; i < nowShowing.length; i++) {
    if (coverFilms.length < 5 && !nowShowing[i].genres.includes("Animation")) {
        coverFilms.push(nowShowing[i]);
    }
}
for (let i = 0; i < nowShowing.length; i++) {
    if (coverFilms.length < 5 && !coverFilms.includes(nowShowing[i])) {
        coverFilms.push(nowShowing[i]);
    }
}

let slidesBox = document.getElementById("hero-slides");
let dotsBox = document.getElementById("hero-dots");

// Create one slide and one dot for each film.
for (let i = 0; i < coverFilms.length; i++) {
    slidesBox.innerHTML += `<div class="hero-slide">${makeBackdrop(coverFilms[i])}</div>`;
    dotsBox.innerHTML += `<button type="button" class="dot" aria-label="Show ${coverFilms[i].title}"><span></span></button>`;
}

// Show the slide with the given number (0 is the first one).
function showSlide(number) {
    // Go back to the start after the last slide, and to the end before the first one.
    if (number >= coverFilms.length) {
        number = 0;
    }
    if (number < 0) {
        number = coverFilms.length - 1;
    }
    currentSlide = number;

    let slides = document.querySelectorAll(".hero-slide");
    let dots = document.querySelectorAll(".dot");
    for (let i = 0; i < slides.length; i++) {
        if (i == currentSlide) {
            slides[i].classList.add("active");
            dots[i].classList.add("active");
            dots[i].setAttribute("aria-current", "true");
        } else {
            slides[i].classList.remove("active");
            dots[i].classList.remove("active");
            dots[i].removeAttribute("aria-current");
        }
    }

    // Update the "On the cover" link under the buttons.
    let film = coverFilms[currentSlide];
    let link = document.getElementById("hero-film");
    link.href = "movie.html?id=" + film.id;
    document.getElementById("hero-film-name").textContent = film.title + " (" + getYear(film) + ") · " + film.genres.slice(0, 2).join(", ");
}

// The arrows and the dots.
document.getElementById("hero-prev").addEventListener("click", function () {
    showSlide(currentSlide - 1);
});
document.getElementById("hero-next").addEventListener("click", function () {
    showSlide(currentSlide + 1);
});
let dotButtons = document.querySelectorAll(".dot");
for (let i = 0; i < dotButtons.length; i++) {
    dotButtons[i].addEventListener("click", function () {
        showSlide(i);
    });
}

// Do not change slides while the mouse is over the text.
let coverText = document.getElementById("hero-content");
coverText.addEventListener("mouseenter", function () {
    mouseIsOverCover = true;
});
coverText.addEventListener("mouseleave", function () {
    mouseIsOverCover = false;
});

showSlide(0);

// Change the slide every 5 seconds, unless the visitor asked their computer for less motion.
let wantsLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!wantsLessMotion) {
    setInterval(function () {
        if (!mouseIsOverCover) {
            showSlide(currentSlide + 1);
        }
    }, 5000);
}


// ================= 2. Now showing =================
let rail = document.getElementById("now-rail");
for (let i = 0; i < nowShowing.length && i < 12; i++) {
    let count = countMovieShowtimes(nowShowing[i].id);
    rail.innerHTML += makePosterCard(nowShowing[i], count + " screenings");
}

// The two arrows scroll the row of posters sideways.
document.getElementById("rail-prev").addEventListener("click", function () {
    rail.scrollBy({ left: -600, behavior: "smooth" });
});
document.getElementById("rail-next").addEventListener("click", function () {
    rail.scrollBy({ left: 600, behavior: "smooth" });
});


// ================= 3. Coming soon =================
let comingSoon = getComingSoon();
let upcomingBox = document.getElementById("upcoming-list");

for (let i = 0; i < comingSoon.length && i < 4; i++) {
    upcomingBox.innerHTML += makeUpcomingCard(comingSoon[i]);
}
if (comingSoon.length == 0) {
    upcomingBox.innerHTML = `<p class="empty">There are no upcoming films in the list right now.</p>`;
}


// ================= 4. Editor's pick =================
// Pick the first Urdu film that is showing. If there is none, pick the second film.
let pick = nowShowing[1];
for (let i = 0; i < nowShowing.length; i++) {
    if (nowShowing[i].language == "Urdu") {
        pick = nowShowing[i];
        break;
    }
}

if (pick) {
    document.getElementById("pick").innerHTML = `
        <div class="pick-picture">${makeStill(pick)}</div>
        <div class="pick-text">
            <p class="eyebrow">Editor's pick</p>
            <h3>${pick.title}</h3>
            <p>${pick.overview}</p>
            <p class="small-text">Director: ${pick.director} &middot; ${formatRuntime(pick.runtime)} &middot; ${pick.language}</p>
            <a class="button" href="movie.html?id=${pick.id}">Read more</a>
        </div>`;
}


// ================= 5. Cinemas =================
let cinemaBox = document.getElementById("cinema-list");
for (let i = 0; i < cinemas.length; i++) {
    let cinema = cinemas[i];
    cinemaBox.innerHTML += `
        <li class="cinema-row">
            <span class="cinema-number">0${i + 1}</span>
            <div>
                <h3><a href="cinema.html?id=${cinema.id}">${cinema.name}</a></h3>
                <p class="small-text">${cinema.area}</p>
            </div>
            <p class="small-text">${cinema.address}</p>
            <p class="small-text"><strong>${countCinemaShowtimes(cinema.id)}</strong> demo screenings</p>
            <a class="arrow-link" href="cinema.html?id=${cinema.id}">Showtimes &rarr;</a>
        </li>`;
}
