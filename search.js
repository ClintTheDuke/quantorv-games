document.addEventListener('DOMContentLoaded', async () => {

  /* ===== GET QUERY PARAM ===== */
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q")?.toLowerCase() || "";

  /* ===== UPDATE TITLE ===== */
  const titleEl = document.getElementById("search-title");
  if (titleEl) {
    titleEl.textContent = query
      ? `Search results for "${query}"`
      : "Search Results";
  } else {
    console.warn("Search title element not found (#search-title)");
  }

  /* ===== GET CONTAINERS ===== */
  const wrapper = document.getElementById("blogs-wrapper");
  const noResults = document.getElementById("no-results");
  if (!wrapper) {
    console.error("Blogs wrapper (#blogs-wrapper) missing on page");
    return;
  }
  if (!noResults) {
    console.warn("No results element (#no-results) missing on page");
  }

  /* ===== HIGHLIGHT FUNCTION ===== */
  function highlight(text, query){
    if(!query) return text;
    const words = query.split(" ").filter(Boolean);
    const regex = new RegExp(`(${words.join("|")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  /* ===== FETCH BLOG DATA FROM topics.json ===== */
  let blogPosts = [];
  try {
    const res = await fetch('topics.json');
    if (!res.ok) throw new Error(`Failed to fetch topics.json: ${res.status}`);
    blogPosts = await res.json();
  } catch (err) {
    console.error("Error fetching topics.json:", err);
    if (noResults) noResults.style.display = "block";
    return;
  }

  /* ===== FILTER POSTS BASED ON QUERY ===== */
  const filteredPosts = blogPosts.filter(post => {
    const titleMatch = post.title?.toLowerCase().includes(query);
    const descMatch = post.excerpt?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  /* ===== RENDER FUNCTION ===== */
  function renderBlogs(posts){
    wrapper.innerHTML = "";

    if(posts.length === 0){
      if(noResults) noResults.style.display = "block";
      return;
    }
    if(noResults) noResults.style.display = "none";

    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "blog-post";

      const highlightedTitle = highlight(post.title || "", query);
      const highlightedDescription = highlight(post.excerpt || "", query);

      card.innerHTML = `
        <div class="post-thumbnail">
          <img src="${post.thumbnail || ''}" alt="${post.title || ''}">
        </div>
        <h2>${highlightedTitle}</h2>
         <span class="blog-date">${formatDateHuman(post.date)}</span>
        <p>${highlightedDescription}</p>
        <a href="${post.url || '#'}">Read Article 📰</a>
      `;
      wrapper.appendChild(card);
    });
  }

  /* ===== EXECUTE SEARCH ===== */
  renderBlogs(filteredPosts);
  
 /* ===========================================
STEP 11 — DATE FORMAT HELPER
NEW: Converts ISO date to "6th February, 2026"
===========================================
*/
function formatDateHuman(dateStr) {
    const dateObj = new Date(dateStr);

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "long" });
    const year = dateObj.getFullYear();

    // Add ordinal suffix
    const ordinal = (n) => {
        if (n > 3 && n < 21) return "th"; // 11th-13th exception
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${day}${ordinal(day)} ${month}, ${year}`;
}

});