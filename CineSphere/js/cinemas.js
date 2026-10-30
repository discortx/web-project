// cinemas.js - the list of cinemas with a search box.

let searchBox = document.getElementById("search");
let listBox = document.getElementById("cinema-list");
let countText = document.getElementById("result-count");

function showCinemas() {
    let searchText = searchBox.value.trim().toLowerCase();
    let results = [];

    // Keep the cinemas whose name, area or address contains the search text.
    for (let i = 0; i < cinemas.length; i++) {
        let cinema = cinemas[i];
        let allText = (cinema.name + " " + cinema.area + " " + cinema.address).toLowerCase();

        if (allText.includes(searchText)) {
            results.push(cinema);
        }
    }

    countText.textContent = results.length + " cinemas";

    listBox.innerHTML = "";
    if (results.length == 0) {
        listBox.innerHTML = `<li class="empty">
            <h3>No cinemas match</h3>
            <p>Try a different name or area.</p>
            <button type="button" class="button button-light" id="empty-clear">Clear search</button>
        </li>`;
        document.getElementById("empty-clear").addEventListener("click", clearSearch);
        return;
    }

    for (let i = 0; i < results.length; i++) {
        listBox.innerHTML += makeCinemaRow(results[i], i + 1);
    }
}

function clearSearch() {
    searchBox.value = "";
    showCinemas();
}

searchBox.addEventListener("input", showCinemas);
document.getElementById("clear-search").addEventListener("click", clearSearch);
document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
});

showCinemas();
