document.addEventListener('DOMContentLoaded',()=>{


/* ===== BLOG DATA ===== */

const blogPosts = [

  {
    title: "Watch Dogs: Legion — What If Zero Day Won?",
    date: "6 February 2026",
    description: "What would London look like if Zero Day actually won in Watch Dogs: Legion? A speculative, casual deep dive into chaos, factions, and the dystopian future we never got to play.",
    image: "https://cdn.jsdelivr.net/gh/ClintTheDuke/qvg@main/qvg226/90ade4251f8140eebd567566ba6119ac.jpg",
    url: "https://quantorv-games.com/topics/watch-dogs-legion-zero-day-won.html"
  },

  {
    title: "Grid Evolution 2048 — Strategy Guide",
    date: "23 January 2026",
    description: "Master Grid Evolution 2048 with advanced strategies, tile control techniques, and efficient board management tips.",
    image: "https://via.placeholder.com/400x250",
    url: "#"
  }

];



/* ===== GET QUERY PARAM ===== */

const params = new URLSearchParams(window.location.search);

const query = params.get("q")?.toLowerCase() || "";



/* ===== UPDATE TITLE ===== */

const title = document.getElementById("search-title");

title.textContent = query 
  ? `Search results for "${query}"`
  : "Search Results";



/* ===== UPGRADE START: Highlight Function ===== */

function highlight(text, query){

  if(!query) return text;

  // split multiple words
  const words = query.split(" ").filter(Boolean);

  const regex = new RegExp(`(${words.join("|")})`, "gi");

  return text.replace(regex, "<mark>$1</mark>");

}

/* ===== UPGRADE END ===== */




/* ===== FILTER POSTS ===== */

const filteredPosts = blogPosts.filter(post =>

  post.title.toLowerCase().includes(query) ||
  post.description.toLowerCase().includes(query)

);




/* ===== RENDER FUNCTION ===== */

const wrapper = document.getElementById("blogs-wrapper");

const noResults = document.getElementById("no-results");

function renderBlogs(posts){

  wrapper.innerHTML = "";

  if(posts.length === 0){

    noResults.style.display = "block";
    return;

  }

  noResults.style.display = "none";


  posts.forEach(post=>{

    const card = document.createElement("div");

    card.className = "blog-post";


    /* ===== UPGRADE START: Apply Highlight ===== */

    const highlightedTitle = highlight(post.title, query);

    const highlightedDescription = highlight(post.description, query);

    /* ===== UPGRADE END ===== */


    card.innerHTML = `

      <div class="post-thumbnail">
        <img src="${post.image}" alt="${post.title}">
      </div>

      <!-- UPGRADE APPLIED HERE -->
      <h2>${highlightedTitle}</h2>

      <span class="blog-date">${post.date}</span>

      <!-- UPGRADE APPLIED HERE -->
      <p>${highlightedDescription}</p>

      <a href="${post.url}">
        Read Article 📰
      </a>

    `;


    wrapper.appendChild(card);

  });

}



/* ===== EXECUTE SEARCH ===== */

renderBlogs(filteredPosts);


});
