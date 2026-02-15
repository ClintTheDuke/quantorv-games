document.addEventListener('DOMContentLoaded',()=>{
    


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

const wrapper = document.getElementById("blogs-wrapper");

function renderBlogs(posts) {

  wrapper.innerHTML = "";

  posts.forEach(post => {

    const card = document.createElement("div");
    card.className = "blog-post aos-slideIn";

    card.innerHTML = `
      <div class="post-thumbnail">
        <img src="${post.image}" alt="${post.title}">
      </div>

      <h2>${post.title}</h2>

      <span class="blog-date">${post.date}</span>

      <p>${post.description}</p>

      <a href="${post.url}">
        Read Article 📰
      </a>
    `;

    wrapper.appendChild(card);

  });

}

renderBlogs(blogPosts);

})