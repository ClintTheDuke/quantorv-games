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
                <img src="${data.thumbnail}" alt="${data.title}">
            </div>

            <h2>${data.title}</h2>

           <span class="blog-date">${formatDateHuman(data.date)}</span>

            <p>${data.excerpt}</p>

            <a href="${data.url}">
                Read Article📰
            </a>
        `;

        return post;
    }


    /*
    ===========================================
    STEP 3 — LOAD TOPICS FROM JSON DATABASE
    NEW: This replaces HTML scanning
    ===========================================
    */

    async function loadTopicsFromJSON() {

        try {

            const response = await fetch("topics.json");

            if (!response.ok)
                throw new Error("Failed to fetch topics.json");

            const data = await response.json();


            data.forEach(topicData => {

                const element = createTopicElement(topicData);

                const topicObject = {

                    element: element,

                    category: topicData.category.toLowerCase(),

                    title: topicData.title,

                    date: topicData.date,

                    url: topicData.url

                };


                topics.push(topicObject);


                /*
                Only render visually if container exists
                This allows use on article pages without container
                */

                if (container) {

                    container.appendChild(element);

                }

            });

        }
        catch (error) {

            console.error("Quantorv Topics Engine JSON load failed:", error);

        }

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

    await loadTopicsFromJSON();


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

    // Grab the sort dropdown list items
    const sortDropdownItems = document.querySelectorAll(".sort-dropdown ul li");

    sortDropdownItems.forEach(item => {

        item.addEventListener("click", () => {

            const sortType = item.dataset.sort; // 'newest' or 'oldest'

            /*
            ===========================================
            SORT LOGIC
            ===========================================
            */

            if (sortType === "newest") {

                // Sort topics array descending by date
                topics.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Update summary text
                document.querySelector(".sort-dropdown summary").innerText = "Sort: Newest ▼";

            } else {

                // Sort topics array ascending by date
                topics.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Update summary text
                document.querySelector(".sort-dropdown summary").innerText = "Sort: Oldest ▼";

            }

            /*
            ===========================================
            RE-RENDER CONTAINER
            ===========================================
            */

            container.innerHTML = ""; // Clear existing posts
            topics.forEach(topic => container.appendChild(topic.element));

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