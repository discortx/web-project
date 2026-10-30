// coming-soon.js - movies that will be released after today.

let comingSoon = getComingSoon();
let box = document.getElementById("upcoming-list");
let countText = document.getElementById("result-count");

countText.textContent = comingSoon.length + " upcoming films";

if (comingSoon.length == 0) {
    box.innerHTML = `<div class="empty">
        <h3>No upcoming releases</h3>
        <p>There are no upcoming films in the list right now.</p>
        <a class="button" href="discover.html">Discover films</a>
    </div>`;
}

for (let i = 0; i < comingSoon.length; i++) {
    box.innerHTML += makeUpcomingCard(comingSoon[i]);
}
