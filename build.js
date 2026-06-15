const fs = require("fs");

/* =========================
   LOAD JSON
========================= */
const json = JSON.parse(fs.readFileSync("topics.json", "utf-8"));

/* =========================
   SORT POSTS (NEWEST FIRST)
========================= */
const sorted = [...json].sort((a, b) => {
  const da = new Date(a.date).getTime() || 0;
  const db = new Date(b.date).getTime() || 0;
  return db - da;
});

/* =========================
   BUILD HTML LIST
========================= */
const fullList = sorted.map(post => `
<a class="list-post" href="${post.url}"
     data-category="${post.category}"
     data-date="${post.date}">

  <div class="list-thumb">
    <div class="list-loader"></div>
    <img src="${post.thumbnail}" alt="${post.title}">
  </div>

  <div class="list-content">

    <span class="blog-date" data-time="${post.date}">
      Loading...
    </span>

    <h3 class="post-title">${post.title}</h3>
    <p class="post-excerpt">${post.excerpt}</p>

  </div>

</a>
`).join("");

/* =========================
   HTML FILES TO UPDATE
========================= */
const htmlFiles = [
  "topics.html",
  "index.html"
];



/* =========================
   UPDATE ALL HTML FILES
========================= */
for (const file of htmlFiles) {

  let html = fs.readFileSync(file, "utf-8");

html = html.replace(
  /<!-- POSTS_CONTAINER_START -->([\s\S]*?)<!-- POSTS_CONTAINER_END -->/,
  "<!-- POSTS_CONTAINER_START --><!-- POSTS_CONTAINER_END -->"
);

  html = html.replace(
    /<!-- POSTS_CONTAINER_START -->([\s\S]*?)<!-- POSTS_CONTAINER_END -->/,
    `<!-- POSTS_CONTAINER_START -->\n${fullList}\n<!-- POSTS_CONTAINER_END -->`
  );

  fs.writeFileSync(file, html);

  console.log(`✅ Updated ${file}`);
}

console.log("✅ Post build complete");