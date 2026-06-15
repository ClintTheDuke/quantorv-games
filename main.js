document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     PRELOADER
  =============================== */
  const preloader = document.getElementById('loading-screen');
  if (preloader) {
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 2000);
  }
  
  
 const aosLeft = document.querySelectorAll('.aos-left');
 const aosSlideIn = document.querySelectorAll('.aos-slideIn');
 
 const currentYear = document.querySelector('#current-year');
 
 
 const scrolljs = new ScrollObserver(true); // initalize scrolljs
  scrolljs.observe(aosLeft, null, 'aos-left-active'); // observe elements with aos-left class name
  scrolljs.observe(aosSlideIn, null, 'aos-slideIn-active'); // observe elements with aos-SlideIn class name
  
  
  currentYear.textContent = new Date().getFullYear(); // automatic year updating
  
  
  document.querySelectorAll(".scroller").forEach((scroller) => {
    const clone = scroller.innerHTML;
    scroller.innerHTML += clone;
  }); // clone the html content of category section scrollers to give a continous scroll effect
  
  
  document.querySelectorAll('.accordion-header').forEach(button => {
   button.addEventListener('click', () => {
     const item = button.parentElement;
    item.classList.toggle('active');
   });
  }); // classList toggle logic for accordions
 
 
  document.querySelectorAll(".post-thumbnail img").forEach(img => {
    img.addEventListener("load", () => {
      img.style.opacity = "1";
      img.previousElementSibling.remove();
    });
  });

    // ===== Substack Newsletter Code ========
 

document
  .getElementById("newsletterForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("emailInput");
    const message = document.getElementById("newsletterMessage");

    const email = emailInput.value.trim();
    if (!email) return;

    message.style.display = "block";
    message.textContent = "Processing...";

    try {
      await subscribeUser(email);

      message.textContent =
        "Almost done! Check your inbox to confirm your subscription.";

      emailInput.value = "";
    } catch (err) {
      console.error(err);
      message.textContent =
        "Something went wrong. Please try again later.";
    }
  });


// ===== PROVIDER FUNCTION (THIS IS THE ONLY PART YOU EVER EDIT) =====

async function subscribeUser(email) {

  // CURRENT METHOD: Substack redirect
  const substackUrl =
    "https://quantorvgames.substack.com/subscribe?email=" +
    encodeURIComponent(email) +
    "&utm_source=website&utm_medium=newsletter_form";

  window.open(substackUrl, "_blank");

  return true;
}
 /* ======== QVG Carousel  ========= */
    async function qvgLoad3DCarousel() {
       

        const container = document.getElementById("qvg-3d-carousel");

        // Check container
        if (!container) {
           // console.error(" Container #qvg-3d-carousel NOT found in HTML");
            return;
        } else {
            //console.log("Container found");
        }

        try {
            console.log("🌐 Fetching topics.json...");

            const res = await fetch("topics.json");

            //  Check response
            if (!res.ok) {
                console.error("❌ Fetch failed:", res.status, res.statusText);
                return;
            } else {
                console.log("✅ Fetch successful");
            }

            const data = await res.json();

            // Check JSON format
            if (!Array.isArray(data)) {
               // console.error("❌ topics.json is NOT an array");
                console.log("👉 Actual data:", data);
                return;
            } else {
               // console.log(`✅ JSON loaded (${data.length} items)`);
            }

            const posts = data.slice(0, 5);

            //console.log("📊 Using first 5 posts:", posts);

            posts.forEach((post, index) => {

                // ✅ Validate post fields
                if (!post.title || !post.thumbnail) {
                    console.warn(`⚠️ Missing data in post index ${index}`, post);
                }

                const card = document.createElement("div");
                card.className = "qvg-3d-carousel-card";

                card.innerHTML = `
                 
                    <div class="qvg-post-thumbnail">
                        <img src="${post.thumbnail}" alt="${post.title}">
                    </div>

                    <h2>${post.title}</h2>

                    <span class="qvg-blog-date">${qvgFormatDate(post.date)}</span>

                    <p>${post.excerpt || ""}</p>

                   <a href="${post.url}">
                        Read More
                    </a>
                 
                `;

                container.appendChild(card);
            });

            console.log("🎉 Carousel rendered successfully!");
            
            
            
 
 
 
        } catch (err) {
            console.error("🔥 QVG Carousel Error:", err);
        }
    }
    
    /* ======= QVG Carousel Ends ======= */

/* ===== Slick Carousel ======= */
async function qvgLoadSlickCarousel() {

    const container = document.querySelector(".card-carousel-slick");
    if (!container) return;

    try {
        const res = await fetch("topics.json");
        const data = await res.json();

        const posts = data.slice(0, 16);
        container.innerHTML = "";

        posts.forEach(post => {
            const card = document.createElement("a");
            card.className = "card-slick";
            card.href = post.url;

            card.innerHTML = `
                <div class="slick-img-wrap">
                    <div class="slick-loader"></div>
                    <img src="${post.thumbnail}" alt="${post.title}">
                </div>
                <div class="slick-content">
                    <h3 class="slick-title">${post.title}</h3>
                    
                    <span class="slick-date">${qvgFormatDate(post.date)}</span>
                    <p class="slick-excerpt">${post.excerpt || ""}</p>
                </div>
            `;

            const img = card.querySelector("img");
            const loader = card.querySelector(".slick-loader");

            img.onload = () => {
                loader.style.display = "none";
                img.style.display = "block";
            };

            container.appendChild(card);
        });

        // 🔥 INIT SLICK HERE (AFTER content exists)
      

    } catch (err) {
        console.error(err);
    }
}
/* ======== slick carousel ends ========== */

/* ===== Swiper Carousel ===== */
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

    qvgLoad3DCarousel();
    qvgLoadSlickCarousel();
    qvgLoadSwiperCarousel();
    // ======== carousel ends ======
    
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
