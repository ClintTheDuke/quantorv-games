
document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 DOM loaded");

    async function qvgLoad3DCarousel() {
        console.log("📦 Starting carousel load...");

        const container = document.getElementById("qvg-3d-carousel");

        // ✅ Check container
        if (!container) {
            console.error("❌ Container #qvg-3d-carousel NOT found in HTML");
            return;
        } else {
            console.log("✅ Container found");
        }

        try {
            console.log("🌐 Fetching topics.json...");

            const res = await fetch("topics.json");

            // ✅ Check response
            if (!res.ok) {
                console.error("❌ Fetch failed:", res.status, res.statusText);
                return;
            } else {
                console.log("✅ Fetch successful");
            }

            const data = await res.json();

            // ✅ Check JSON format
            if (!Array.isArray(data)) {
                console.error("❌ topics.json is NOT an array");
                console.log("👉 Actual data:", data);
                return;
            } else {
                console.log(`✅ JSON loaded (${data.length} items)`);
            }

            const posts = data.slice(0, 5);

            console.log("📊 Using first 5 posts:", posts);

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
                        Read Article 📰
                    </a>
                 
                `;

                container.appendChild(card);
            });

            console.log("🎉 Carousel rendered successfully!");
            /* blurr
            const cards = document.querySelectorAll(".qvg-3d-carousel-card");
let current = 0;

function updateActive() {
    cards.forEach((card, i) => {
        card.classList.toggle("active", i === current);
        card.classList.toggle("inactive", i !== current);
    });
}

// initialize first state
updateActive();

// rotate
setInterval(() => {
    current = (current + 1) % cards.length;
    updateActive();
}, 3000);
 blur end */
        } catch (err) {
            console.error("🔥 QVG Carousel Error:", err);
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
});
