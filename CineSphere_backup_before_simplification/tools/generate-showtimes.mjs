// Writes data/showtimes.json for the 7 days starting at the given date (default: tomorrow).
// Usage: node tools/generate-showtimes.mjs 2026-10-30
// Only movies already released on the start date get screenings. Every record is flagged isDemoData.
import { readFileSync, writeFileSync } from "node:fs";

const base = new URL("../", import.meta.url);
const movies = JSON.parse(readFileSync(new URL("data/movies.json", base), "utf8"));
const cinemas = JSON.parse(readFileSync(new URL("data/cinemas.json", base), "utf8"));

const start = process.argv[2] || new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const titles = ["Alien: Romulus", "Deadpool & Wolverine", "Dune: Part Two", "Inside Out 2", "Gladiator II", "Wicked",
  "Sinners", "Superman", "Zootopia 2", "Jawan", "Pathaan", "Joyland"];
const slots = ["11:00", "14:30", "18:00", "21:30"];
const formatsByCinema = { C001: ["2D", "3D"], C002: ["2D", "IMAX"], C003: ["2D"], C004: ["2D", "3D"], C005: ["2D"], C006: ["2D"] };
const langOf = { en: "English", hi: "Hindi", ur: "Urdu" };

const pick = movies.filter(m => titles.includes(m.title) && m.releaseDate <= start);
const out = [];
let n = 1;
pick.forEach((m, mi) => {
  const here = [cinemas[mi % cinemas.length], cinemas[(mi + 2) % cinemas.length]];
  for (let day = 0; day < 7; day++) {
    const date = new Date(Date.parse(start) + day * 864e5).toISOString().slice(0, 10);
    if ((day + mi) % 2 === 1) continue; // not every movie screens every day
    [here[day % 2]].forEach((c, ci) => { // one cinema per screening day, alternating
      const o = (mi + day * 2 + ci) % 3; // rotate which two consecutive slots a film gets
      const times = [slots[o], slots[o + 1]];
      times.forEach(time => {
        const formats = formatsByCinema[c.id];
        const format = formats[(mi + ci) % formats.length];
        out.push({
          id: "ST" + String(n++).padStart(3, "0"),
          movieId: m.id,
          cinemaId: c.id,
          date,
          time,
          format,
          screeningLanguage: langOf[m.originalLanguage] || "English",
          ticketPriceNote: format === "IMAX" ? "Demo price: PKR 1,500–2,200 (illustrative only)" : "Demo price: PKR 800–1,200 (illustrative only)",
          isDemoData: true
        });
      });
    });
  }
});
writeFileSync(new URL("data/showtimes.json", base), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} showtimes for ${pick.length} movies starting ${start}.`);
