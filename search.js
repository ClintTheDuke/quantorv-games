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
    title: "Watch Dogs: Legion — What Really Happens After You Discover Zero Day?",
    date: "6 February 2026",
    description: "What really changes in Watch Dogs: Legion after you discover Zero Day? A casual, spoiler-filled look at replaying the game, different choices, and why knowing the truth reshapes everything.",
    image: "https://cdn.jsdelivr.net/gh/ClintTheDuke/qvg@main/qvg226/299a26fe54c8c2391bb11518ec9d25eb.jpg",
    url: "https://quantorv-games.com/topics/watch-dogs-legion-zero-day.html"
  },
   {
    title: "How to Beat the 4096 Tile on Hard Mode in 2048: Grid Evolution",
    date: "28 January 2026",
    description: "Struggling with Hard Mode? Learn proven strategies to beat the 4096 tile in 2048: Grid Evolution. Master tile attacks, board control, and high-level tactics.",
    image: "./assets/thumbnails/qvg-2048.jpg",
    url: "https://quantorv-games.com/topics/how-to-beat-4096-tile-2048.html"
  },
   {
    title: "About Grid Evolution: 2048",
    date: "23 January 2026",
    description: "Learn the story behind Grid Evolution 2048 — a creative twist on the classic puzzle game by Gabriel Cirulli, with gems, power-ups, and strategic depth, created by Clinton Nwezeaku..",
    image: "./assets/thumbnails/qvg-2048.jpg",
    url: "https://quantorv-games.com/topics/about-grid-evolution-2048.html"
  },
   {
    title: "How to Play 2048: Grid Evolution",
    date: "21 January 2026",
    description: "Think you can handle the ultimate number showdown? Merge, evolve, and strategize your way through 2048: Grid Evolution by Quantorv Games — where every move counts and only the sharpest minds reach the top!",
    image: "./assets/thumbnails/qvg-2048.jpg",
    url: "https://quantorv-games.com/topics/how-to-play-2048.html"
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
