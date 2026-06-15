/*
===========================================
Quantorv Games Topics Engine v2.0
JSON Database Enabled
===========================================

NEW FEATURES:
• Loads topics from topics.json
• Works on ALL pages (topics page + article pages)
• Keeps API compatibility
• Future-proof database architecture
===========================================
*/

document.addEventListener("DOMContentLoaded", async () => {

const preloader = document.getElementById('loading-screen');
  if (preloader) {
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 2000);
  }
    const container = document.getElementById("topics-container");
    const filterButtons = document.querySelectorAll(".filter-btn");

    /*
    ===========================================
    STEP 1 — INITIALIZE TOPICS ARRAY
    MODIFIED: Now starts empty and loads from JSON
    ===========================================
    */

    let topics = [];


    /*
    ===========================================
    STEP 2 — CREATE TOPIC ELEMENT FUNCTION
    UNCHANGED (but uses JSON fields now)
    ===========================================
    */

    function createTopicElement(data) {

        const post = document.createElement("div");

post.className = "blog-post aos-slideIn";
post.dataset.category = data.category;

post.innerHTML = `
    <div class="post-thumbnail">
        <div class="blog-loader"></div>
        <img src="${data.thumbnail}" alt="${data.title}">
    </div>

    <h2>${data.title}</h2>

    <span class="blog-date">${formatDateHuman(data.date)}</span>

    <p>${data.excerpt}</p>

    <a href="${data.url}">
        Read Article📰
    </a>
`;

const img = post.querySelector("img");
const loader = post.querySelector(".blog-loader");

img.onload = () => {
    loader.style.display = "none";
    img.classList.add("fade-in");
    img.style.display = "block";
};

img.style.display = "none";

return post;
    }


    /*
    ===========================================
    STEP 3 — LOAD TOPICS FROM DOM
    ===========================================
    */

    function loadTopicsFromDOM() {
  const elements = document.querySelectorAll(".list-post");

  elements.forEach(el => {
    topics.push({
      element: el,
      category: el.dataset.category?.toLowerCase() || "all",

      date: el.dataset.date, // for sorting (IMPORTANT)

      title: el.querySelector("h2")?.innerText || "",
      url: el.querySelector("a")?.href || ""
    });
  });
}

    /*
    ===========================================
    STEP 4 — ADD TOPIC FUNCTION
    MODIFIED: Supports runtime additions
    ===========================================
    */

    function addTopic(data) {

        const element = createTopicElement(data);

        const topicObject = {

            element: element,

            category: data.category.toLowerCase(),

            title: data.title,

            date: data.date,

            url: data.url

        };

        topics.push(topicObject);

        if (container) {

            container.appendChild(element);

        }

    }


    /*
    ===========================================
    STEP 5 — FILTER ENGINE
    UNCHANGED
    ===========================================
    */

    function filterTopics(filter) {

        filter = filter.toLowerCase();

        topics.forEach(topic => {

            if (!topic.element) return;

            if (filter === "all" || topic.category === filter) {

                topic.element.style.display = "";

                topic.element.style.opacity = "0";

                topic.element.style.transform = "translateY(10px)";

                requestAnimationFrame(() => {

                    topic.element.style.transition = "all 0.3s ease";

                    topic.element.style.opacity = "1";

                    topic.element.style.transform = "translateY(0)";

                });

            }
            else {

                topic.element.style.display = "none";

            }

        });

    }


    /*
    ===========================================
    STEP 6 — FILTER BUTTON EVENTS
    SAFE: Only runs if buttons exist
    ===========================================
    */

    if (filterButtons.length > 0) {

        filterButtons.forEach(button => {

            button.addEventListener("click", () => {

                filterButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                const filter = button.dataset.filter;

                filterTopics(filter);

            });

        });

    }


    /*
    ===========================================
    STEP 7 — GET ALL CATEGORIES
    UNCHANGED
    ===========================================
    */

    function getAllCategories() {

        return [

            ...new Set(

                topics.map(topic => topic.category)

            )

        ];

    }


    /*
    ===========================================
    STEP 8 — PUBLIC API
    UNCHANGED INTERFACE
    ===========================================
    */

    window.QuantorvTopics = {

        addTopic: addTopic,

        filter: filterTopics,

        getCategories: getAllCategories,

        getAll: () => topics

    };


    /*
    ===========================================
    STEP 9 — LOAD DATABASE
    NEW: Initialize from topics.json
    ===========================================
    */

    await loadTopicsFromDOM();


    /*
    ===========================================
    INITIALIZATION COMPLETE
    ===========================================
    */

    console.log("Quantorv Topics Engine initialized (JSON mode)");
    
    /*
===========================================
STEP 10 — SORT ENGINE
NEW: Allows sorting topics by date (Newest/Oldest)
===========================================
*/

// Only initialize if container exists (topics page)
if (container) {

  const sortDropdownItems = document.querySelectorAll(".sort-dropdown ul li");
  const posts = Array.from(container.querySelectorAll(".list-post"));

  sortDropdownItems.forEach(item => {

    item.addEventListener("click", () => {

      const sortType = item.dataset.sort;

      posts.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        return sortType === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });

      // Clear & re-append in new order
      container.innerHTML = "";
      posts.forEach(post => container.appendChild(post));

      document.querySelector(".sort-dropdown summary").innerText =
        sortType === "newest" ? "Sort: Newest ▼" : "Sort: Oldest ▼";

    });

  });

}
/*
===========================================
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

/* ===============
   Additions (SWIPER CAROUSEL)
   ================
 */
 
 window.addEventListener("load", () => {
  new Swiper(".swiper-topic", {
    loop: true,
    spaceBetween: 15,
    slidesPerView: 1.2,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-topic-pagination",
      clickable: true,
    },
    breakpoints: {
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 3 }
    }
  });
  // ========== Swiper Carousel ===========
  async function qvgLoadSwiperCarousel() {

    const track = document.getElementById("swiper-carousel-track");
    if (!track) return;

    try {
        const res = await fetch("topics.json");

        if (!res.ok) {
            console.error("❌ Fetch failed:", res.status);
            return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) return;

        const posts = data.slice(0, 10);
        track.innerHTML = "";

        posts.forEach(post => {

            const slide = document.createElement("div");
            slide.className = "swiper-slide";

            slide.innerHTML = `
                <a href="${post.url}" class="swiper-carousel-card">
                    
                    <div class="swiper-carousel-img-wrap">
                        <div class="swiper-carousel-loader"></div>
                        <img src="${post.thumbnail}" alt="${post.title}">
                    </div>

                    <div class="swiper-carousel-content">
                        <h3 class="swiper-carousel-title">${post.title}</h3>
                        <span class="swiper-carousel-date">
                            ${qvgFormatDate(post.date)}
                        </span>
                    </div>

                </a>
            `;

            // loader logic (same pattern as your slick)
            const img = slide.querySelector("img");
            const loader = slide.querySelector(".swiper-carousel-loader");

            img.onload = () => {
                loader.style.display = "none";
                img.style.display = "block";
            };

            track.appendChild(slide);
        });

        // INIT SWIPER
        new Swiper(".swiper-carousel", {
            loop: true,

            slidesPerView: 1,
            spaceBetween: 15,

            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },

            navigation: {
                nextEl: ".swiper-carousel-button-next",
                prevEl: ".swiper-carousel-button-prev",
            },

            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });

    } catch (err) {
        console.error("🔥 Swiper Carousel Error:", err);
    }
}








    /* DATE FORMAT */
    function qvgFormatDate(dateStr) {
        if (!dateStr) {
            console.warn("⚠️ Missing date");
            return "No date";
        }

        const dateObj = new Date(dateStr);

        if (isNaN(dateObj)) {
            console.error("❌ Invalid date format:", dateStr);
            return dateStr;
        }

        const day = dateObj.getDate();
        const month = dateObj.toLocaleString("en-US", { month: "long" });
        const year = dateObj.getFullYear();

        const ordinal = (n) => {
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${ordinal(day)} ${month}, ${year}`;
    }

    
    qvgLoadSwiperCarousel();
    
    // ========= Swiper Carousel Ends ===========
  //======== Image Loader ==========
  document.querySelectorAll("img").forEach(img => {
  img.onload = () => {
    img.style.display = "block";
    const loader = img.previousElementSibling;
    if (loader) loader.style.display = "none";
  };
});
// =========== Image Loader Ends ==========

// =========== Load More Topics ===========
const posts = document.querySelectorAll(".list-post");
const btn = document.getElementById("load-more-btn");

let visible = 20;
const step = 10;

function updatePost() {
  posts.forEach((p, i) => {
    p.style.display = i < visible ? "flex" : "none";
  });

  if (visible >= posts.length) {
    btn.innerText = "You've reached the end!";
    btn.disabled = true;
  }
}

btn.addEventListener("click", () => {


  visible += step;
  updatePost();
});

updatePost();

/* =========== PARSE DATE NEW: ISO AND STATIC =========*/
function parseDate(value) {
  // ISO format (with time)
  if (value.includes("T")) {
    return new Date(value);
  }

  // Old format (YYYY-MM-DD)
  return new Date(value + "T00:00:00");
}

function updateTimes() {
  const elements = document.querySelectorAll('.blog-date');

  elements.forEach(el => {
    const published = parseDate(el.dataset.time);
    const now = new Date();

    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      el.textContent = `${diffMins}min ago`;
    } 
    else if (diffHours < 24) {
      el.textContent = `${diffHours}hr ago`;
    }
    if (diffMs < 1){
        el.textContent = `Just Now`
    }
    else {
      el.textContent = published.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  });
}

updateTimes();
setInterval(updateTimes, 60000);


});
