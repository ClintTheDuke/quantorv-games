document.addEventListener('DOMContentLoaded', ()=>{
    


(function () {

    console.log("🔍 Related Posts Script Initializing...");

    /* ===============================
       1️⃣ Validate body data-page
    =============================== */
    const pageType = document.body.dataset.page;

    if (!pageType) {
        console.error("❌ Error: data-page missing in <body> tag");
        return;
    }

    if (pageType !== "article") {
        console.warn(`⚠️ Script loaded on non-article page (data-page="${pageType}")`);
        return;
    }

    console.log("✅ Article page confirmed");

    /* ===============================
       2️⃣ Validate container
    =============================== */
    const container = document.getElementById("related-posts");

    if (!container) {
        console.error("❌ Error: #related-posts container missing in HTML");
        return;
    }

    console.log("✅ Related posts container found");

    /* ===============================
       3️⃣ Validate category
    =============================== */
    const currentCategory = document.body.dataset.category;

    if (!currentCategory) {
        console.error("❌ Error: data-category missing in <body> tag");
        return;
    }

    console.log(`✅ Category detected: ${currentCategory}`);

    const normalizedCategory = currentCategory.toLowerCase();
    const currentUrl = window.location.href;

    /* ===============================
       4️⃣ Fetch and Render
    =============================== */
    async function loadRelated() {

        console.log("🌐 Fetching /topics.json ...");

        try {
            const response = await fetch("../topics.json");

            if (!response.ok) {
                console.error(`❌ Fetch failed: ${response.status} ${response.statusText}`);
                return;
            }

            console.log("✅ topics.json fetched successfully");

            const topics = await response.json();

            if (!Array.isArray(topics)) {
                console.error("❌ Error: topics.json is not an array");
                return;
            }

            console.log(`📦 Total topics loaded: ${topics.length}`);

            const related = topics
                .filter(topic => {
                    if (!topic.category || !topic.url) {
                        console.warn("⚠️ Skipping malformed topic:", topic);
                        return false;
                    }

                    return (
                        topic.category.toLowerCase() === normalizedCategory &&
                        topic.url !== currentUrl
                    );
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 6);

            console.log(`🎯 Related posts found: ${related.length}`);

            if (!related.length) {
                console.warn("⚠️ No related posts matched this category");
                return;
            }

            const fragment = document.createDocumentFragment();

            related.forEach(topic => {
                const card = document.createElement("a");
                card.href = topic.url;
                card.className = "related-card";
                card.textContent = topic.title;

                fragment.appendChild(card);
            });

            container.appendChild(fragment);

            console.log("🚀 Related posts rendered successfully");

        } catch (error) {
            console.error("❌ Unexpected error while loading related posts:", error);
        }
    }

    loadRelated();

})();

})