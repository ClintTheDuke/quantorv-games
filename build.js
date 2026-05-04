const fs = require("fs");

const json = JSON.parse(fs.readFileSync("topics.json", "utf-8"));
let html = fs.readFileSync("topics.html", "utf-8");

/* ✅ SAFE SORT (FIXED) */
const sorted = [...json].sort((a, b) => {
  const da = new Date(a.date).getTime() || 0;
  const db = new Date(b.date).getTime() || 0;
  return db - da;
});

/* =========================
   LIST (ALL POSTS)
========================= */
const fullList = sorted.map(post => `
<div class="list-post blog-post"
     data-category="${post.category}"
     data-date="${post.date}">

  <div class="list-thumb">
    <div class="list-loader"></div>
    <img src="${post.thumbnail}" alt="${post.title}">
  </div>

  <div class="list-content">
    <span class="blog-date">${formatDate(post.date)}</span>
    <h3 class="post-title">${post.title}</h3>
    <p class="post-excerpt">${post.excerpt}</p>

    <div class="list-actions">
      <a href="${post.url}" class="read-more-btn">Read Article 📰</a>
    </div>
  </div>

</div>
`).join("");

/* INJECT */
html = html.replace(
  /<!-- LIST START -->([\s\S]*?)<!-- LIST END -->/,
  `<!-- LIST START -->${fullList}<!-- LIST END -->`
);

fs.writeFileSync("topics.html", html);

console.log("✅ List build complete");

/* DATE FORMAT */
function formatDate(dateStr) {
  const d = new Date(dateStr);

  if (isNaN(d)) return "Unknown date";

  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();

  const ord = n => (n > 3 && n < 21)
    ? "th"
    : ["th", "st", "nd", "rd"][n % 10] || "th";

  return `${day}${ord(day)} ${month}, ${year}`;
}