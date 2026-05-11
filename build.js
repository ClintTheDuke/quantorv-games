const fs = require("fs");

/* =========================
   LOAD JSON + HTML FILES
========================= */
const json = JSON.parse(fs.readFileSync("topics.json", "utf-8"));
let html = fs.readFileSync("topics.html", "utf-8");


/* =========================
   SORT POSTS (NEWEST FIRST)
   - Safely handles ISO + date-only formats
========================= */
const sorted = [...json].sort((a, b) => {
  const da = new Date(a.date).getTime() || 0;
  const db = new Date(b.date).getTime() || 0;
  return db - da;
});


/* =========================
   BUILD HTML LIST
   - Injects posts into template
   - Keeps raw date in data-date for JS later
========================= */
const fullList = sorted.map(post => `
<div class="list-post blog-post"
     data-category="${post.category}"
     data-date="${post.date}">

  <!-- Thumbnail Section -->
  <div class="list-thumb">
    <div class="list-loader"></div>
    <img src="${post.thumbnail}" alt="${post.title}">
  </div>

  <!-- Content Section -->
  <div class="list-content">

   
    <span class="blog-date" data-time="${post.date}">
      Loading...
    </span>

    <h3 class="post-title">${post.title}</h3>
    <p class="post-excerpt">${post.excerpt}</p>

    <div class="list-actions">
      <a href="${post.url}" class="read-more-btn">Read Article 📰</a>
    </div>

  </div>

</div>
`).join("");


/* =========================
   INJECT INTO HTML TEMPLATE
   - Replaces placeholder block
========================= */
html = html.replace(
  /<!-- LIST START -->([\s\S]*?)<!-- LIST END -->/,
  `<!-- LIST START -->${fullList}<!-- LIST END -->`
);


/* =========================
   SAVE FINAL HTML FILE
========================= */
fs.writeFileSync("topics.html", html);

console.log("✅ List build complete");


/* =========================================================
   NOTE:
   We REMOVED formatDate() from Node.js completely because:

   ✔ Old system: static formatting at build time
   ✔ New system: dynamic browser formatting

   This gives:
   - "20min ago"
   - "3hr ago"
   - "10 May 2026"
   - Works across timezones
========================================================= */