/*
===========================================
Quantorv Games Topics Engine v1.0
===========================================

Features:
• Hybrid rendering (HTML + JS)
• Dynamic topic support
• Category filtering
• Future-proof architecture
• Zero dependencies
===========================================
*/

document.addEventListener("DOMContentLoaded", () => {

    /*
    ===========================================
    CONFIGURATION
    ===========================================
    */

    const container = document.getElementById("topics-container");
    const filterButtons = document.querySelectorAll(".filter-btn");

    if (!container) return;

    /*
    ===========================================
    STEP 1 — REGISTER EXISTING HTML TOPICS
    ===========================================
    */

    // Convert existing HTML topics into JS objects
    let topics = Array.from(container.querySelectorAll(".blog-post")).map(post => {

        const category = post.dataset.category || "uncategorized";

        return {
            element: post,
            category: category.toLowerCase(),
            title: post.querySelector("h2")?.innerText || "",
            date: post.querySelector(".blog-date")?.innerText || ""
        };

    });


    /*
    ===========================================
    STEP 2 — FUTURE DYNAMIC TOPICS SUPPORT
    ===========================================

    To add topics dynamically later, just push:

    topics.push({
        category: "video-games",
        title: "...",
        date: "...",
        element: createTopicElement({...})
    });

    ===========================================
    */


    /*
    ===========================================
    STEP 3 — FILTER ENGINE
    ===========================================
    */

    function filterTopics(filter) {

        filter = filter.toLowerCase();

        topics.forEach(topic => {

            if (filter === "all" || topic.category === filter) {

                topic.element.style.display = "";

                // optional animation reset
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
    STEP 4 — FILTER BUTTON EVENTS
    ===========================================
    */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            // Remove active state
            filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            // Add active state
            button.classList.add("active");

            // Apply filter
            const filter = button.dataset.filter;
            filterTopics(filter);

        });

    });


    /*
    ===========================================
    STEP 5 — OPTIONAL AUTO-GENERATE FILTERS
    (Future proof feature — disabled by default)
    ===========================================
    */

    function getAllCategories() {

        return [...new Set(
            topics.map(topic => topic.category)
        )];

    }

    /*
    Example usage later:

    const categories = getAllCategories();
    console.log(categories);

    */


    /*
    ===========================================
    STEP 6 — PUBLIC API (Future Use)
    ===========================================
    */

    window.QuantorvTopics = {

        addTopic(topicObject) {

            if (!topicObject.element) return;

            topics.push(topicObject);
            container.appendChild(topicObject.element);

        },

        filter: filterTopics,

        getCategories: getAllCategories,

        getAll: () => topics

    };


    /*
    ===========================================
    INITIALIZATION COMPLETE
    ===========================================
    */

    console.log("Quantorv Topics Engine initialized");

});