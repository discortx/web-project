// One-off: writes data/movies.json from a compact hand-written list.
// Ratings, dates and cast are APPROXIMATE seed values. Run tools/fetch-tmdb.mjs afterwards
// (needs a TMDB API key) to replace them with real TMDB data, posters and trailers.
import { writeFileSync } from "node:fs";

const seed = [
  ["Alien: Romulus", "2024-08-14", ["Horror", "Science Fiction"], 119, 7.2, "en", "Fede Álvarez", ["Cailee Spaeny", "David Jonsson", "Archie Renaux"], "Young colonists scavenging a derelict space station come face to face with the most terrifying life form in the universe."],
  ["Deadpool & Wolverine", "2024-07-24", ["Action", "Comedy", "Science Fiction"], 128, 7.6, "en", "Shawn Levy", ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"], "A listless Wade Wilson is pulled back into action when the TVA recruits him for a mission that teams him with a reluctant Wolverine."],
  ["Dune: Part Two", "2024-02-28", ["Science Fiction", "Adventure"], 166, 8.1, "en", "Denis Villeneuve", ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"], "Paul Atreides unites with the Fremen while seeking revenge against those who destroyed his family."],
  ["Inside Out 2", "2024-06-11", ["Animation", "Family", "Comedy"], 96, 7.6, "en", "Kelsey Mann", ["Amy Poehler", "Maya Hawke", "Kensington Tallman"], "Riley enters her teenage years and new emotions arrive at Headquarters, shaking up the old crew."],
  ["Gladiator II", "2024-11-13", ["Action", "Drama", "Adventure"], 148, 6.8, "en", "Ridley Scott", ["Paul Mescal", "Pedro Pascal", "Denzel Washington"], "Years after witnessing the death of Maximus, Lucius is forced into the Colosseum and must look to his past for strength."],
  ["Wicked", "2024-11-20", ["Drama", "Romance", "Fantasy"], 160, 7.3, "en", "Jon M. Chu", ["Cynthia Erivo", "Ariana Grande", "Jonathan Bailey"], "Elphaba and Glinda meet as students at Shiz University and form an unlikely friendship that changes Oz forever."],
  ["Sinners", "2025-04-16", ["Horror", "Thriller", "Drama"], 138, 7.5, "en", "Ryan Coogler", ["Michael B. Jordan", "Hailee Steinfeld", "Miles Caton"], "Twin brothers return to their Mississippi hometown to start over, only to find an even greater evil waiting."],
  ["Superman", "2025-07-09", ["Action", "Science Fiction", "Adventure"], 129, 7.2, "en", "James Gunn", ["David Corenswet", "Rachel Brosnahan", "Nicholas Hoult"], "Superman sets out to reconcile his Kryptonian heritage with his human upbringing as Clark Kent."],
  ["Zootopia 2", "2025-11-26", ["Animation", "Family", "Comedy"], 108, 7.6, "en", "Jared Bush", ["Ginnifer Goodwin", "Jason Bateman", "Ke Huy Quan"], "Judy Hopps and Nick Wilde go undercover to investigate a new case that takes them to unexplored corners of Zootopia."],
  ["Jawan", "2023-09-07", ["Action", "Thriller"], 169, 6.9, "hi", "Atlee", ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"], "A man driven by a personal vendetta sets out to right the wrongs in society, with a group of women by his side."],
  ["Pathaan", "2023-01-25", ["Action", "Thriller", "Adventure"], 146, 6.4, "hi", "Siddharth Anand", ["Shah Rukh Khan", "Deepika Padukone", "John Abraham"], "An exiled Indian spy returns to stop a rogue former agent from launching a deadly attack on India."],
  ["Joyland", "2022-11-18", ["Drama", "Romance"], 126, 7.1, "ur", "Saim Sadiq", ["Ali Junejo", "Rasti Farooq", "Alina Khan"], "The youngest son of a patriarchal Lahore family secretly joins an erotic dance theatre and falls for its transgender star."],
  ["Oppenheimer", "2023-07-19", ["Drama", "History", "Thriller"], 181, 8.1, "en", "Christopher Nolan", ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."], "The story of J. Robert Oppenheimer and the creation of the atomic bomb during World War II."],
  ["Teefa in Trouble", "2018-07-20", ["Comedy", "Action", "Romance"], 135, 6.5, "ur", "Ahsan Rahim", ["Ali Zafar", "Maya Ali", "Faran Tahir"], "A bumbling Lahori falls for a Polish woman and gets tangled up with spies and criminals in Poland."],
  ["Parwaaz Hai Junoon", "2018-08-14", ["Action", "Drama"], 130, 6.6, "ur", "Haseeb Hasan", ["Hamza Ali Abbasi", "Ahad Raza Mir", "Kubra Khan"], "Pakistan Air Force pilots train and fly together in a story of courage, friendship and sacrifice."],
  ["Load Wedding", "2018-06-16", ["Comedy", "Romance", "Drama"], 130, 6.4, "ur", "Faisal Qureshi", ["Fahad Mustafa", "Mehwish Hayat", "Faiza Hasan"], "A wedding-obsessed family's budget troubles collide with a young man's attempt to marry the woman he loves."],
  ["Avengers: Doomsday", "2026-12-18", ["Action", "Science Fiction", "Adventure"], 150, 0, "en", "Anthony Russo, Joe Russo", ["Robert Downey Jr.", "Chris Hemsworth", "Anthony Mackie"], "Earth's mightiest heroes face a new multiversal threat in the next chapter of the Avengers saga."],
  ["Dune: Part Three", "2026-12-18", ["Science Fiction", "Adventure"], 150, 0, "en", "Denis Villeneuve", ["Timothée Chalamet", "Zendaya", "Anya Taylor-Joy"], "Paul Atreides faces the consequences of his rise as emperor in the conclusion of Villeneuve's Dune saga."],
  ["The Hunger Games: Sunrise on the Reaping", "2026-11-20", ["Action", "Science Fiction", "Thriller"], 140, 0, "en", "Francis Lawrence", ["Joseph Zada", "Ralph Fiennes", "Elle Fanning"], "A young Haymitch Abernathy is drawn into the 50th Hunger Games, the Second Quarter Quell."],
  ["Narnia: The Magician's Nephew", "2026-11-26", ["Fantasy", "Adventure", "Family"], 130, 0, "en", "Greta Gerwig", ["Carey Mulligan", "Daniel Craig", "Meryl Streep"], "Two children stumble into a magical world and witness the birth of Narnia."],
  ["Jumanji 3", "2026-12-11", ["Adventure", "Comedy", "Action"], 120, 0, "en", "Jake Kasdan", ["Dwayne Johnson", "Kevin Hart", "Jack Black"], "The gang returns to the dangerous game world for another jungle adventure."],
  ["Shrek 5", "2027-06-30", ["Animation", "Comedy", "Family"], 95, 0, "en", "Walt Dohrn", ["Mike Myers", "Eddie Murphy", "Cameron Diaz"], "The green ogre returns for a new fairy-tale misadventure."]
];

// Ratings in the list above are deliberately NOT written to the file: they were typed from memory, not from a reliable source.
// fetch-tmdb.mjs fills in real ratings and sets dataSource to "tmdb".
const movies = seed.map(([title, releaseDate, genres, runtimeMinutes, , originalLanguage, director, cast, overview], i) => ({
  id: i + 1,
  tmdbId: null,
  title,
  overview,
  posterPath: null,
  backdropPath: null,
  genres,
  releaseDate,
  runtimeMinutes,
  tmdbRating: null,
  tmdbVoteCount: null,
  originalLanguage,
  trailerKey: null,
  cast,
  director,
  dataSource: "seed"
}));

writeFileSync(new URL("../data/movies.json", import.meta.url), JSON.stringify(movies, null, 2) + "\n");
console.log(`Wrote ${movies.length} movies.`);
