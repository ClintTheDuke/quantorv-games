document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       GET HTML ELEMENTS
       ========================= */

    const gameSelect = document.getElementById("game-select");

    const difficultySelector =
        document.getElementById("difficulty-selector");

    const difficultySelect =
        document.getElementById("difficulty-select");

    const difficultyHeading =
        document.getElementById("difficulty-heading");

    const highestTileHeading =
        document.getElementById("highest-tile-heading");

    const leaderboardBody =
        document.getElementById("archery-leaderboard-body");

    const myRankElement =
        document.getElementById("my-rank");

    const periodInputs =
        document.querySelectorAll(
            'input[name="leaderboard-period"]'
        );

    // Store the games retrieved from Supabase.
    let games = [];

    // 2048 game identifier.
    const GAME_2048_SLUG = "play-2048-free";


    /* =========================
       HELPER: ESCAPE HTML
       ========================= */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }


    /* =========================
       LOAD GAMES
       ========================= */

    async function loadGames() {

        const { data, error } = await supaDb
            .from("Games")
            .select("id, name, slug")
            .order("name");

        if (error) {
            console.error("Error loading games:", error);
            return false;
        }

        games = data || [];

        gameSelect.innerHTML = games.map(game => `
            <option value="${game.id}">
                ${escapeHTML(game.name)}
            </option>
        `).join("");

        console.log("Games loaded:", games);

        return true;
    }


    /* =========================
       GET SELECTED GAME
       ========================= */

    function getSelectedGame() {

        return games.find(
            game => String(game.id) === gameSelect.value
        );
    }


    /* =========================
       DETECT 2048
       ========================= */

    function is2048Selected() {

        const selectedGame = getSelectedGame();

        return selectedGame?.slug === GAME_2048_SLUG;
    }


    /* =========================
       UPDATE LEADERBOARD UI
       ========================= */

    function updateLeaderboardUI() {

        const is2048 = is2048Selected();

        // Show difficulty selector only for 2048.
        difficultySelector.hidden = !is2048;

        // Show 2048-specific table columns.
        difficultyHeading.hidden = !is2048;
        highestTileHeading.hidden = !is2048;
    }


    /* =========================
       GET PERIOD INFORMATION
       ========================= */

    function getPeriodInfo(period) {

        const now = new Date();

        if (period === "all_time") {
            return {
                periodType: "all_time",
                periodKey: "all_time"
            };
        }

        if (period === "monthly") {

            const year = now.getFullYear();

            const month = String(
                now.getMonth() + 1
            ).padStart(2, "0");

            return {
                periodType: "monthly",
                periodKey: `${year}-${month}`
            };
        }

        if (period === "weekly") {

            const year = now.getFullYear();

            const startOfYear = new Date(year, 0, 1);

            const daysSinceStartOfYear = Math.floor(
                (now - startOfYear) / 86400000
            );

            const weekNumber = Math.ceil(
                (
                    daysSinceStartOfYear +
                    startOfYear.getDay() + 1
                ) / 7
            );

            return {
                periodType: "weekly",
                periodKey: `${year}-W${String(weekNumber).padStart(2, "0")}`
            };
        }
    }


    /* =========================
       GET CURRENT FILTERS
       ========================= */

    function getCurrentFilters() {

        const selectedPeriod = document.querySelector(
            'input[name="leaderboard-period"]:checked'
        ).value;

        const periodInfo = getPeriodInfo(selectedPeriod);

        const is2048 = is2048Selected();

        const difficulty = is2048
            ? difficultySelect.value
            : null;

        // 2048 stores difficulty inside period_key.
        const periodKey = is2048
            ? `${periodInfo.periodKey}:${difficulty}`
            : periodInfo.periodKey;

        return {
            periodType: periodInfo.periodType,
            periodKey: periodKey,
            difficulty: difficulty,
            is2048: is2048
        };
    }


    /* =========================
       APPLY LEADERBOARD FILTERS
       ========================= */

    function applyLeaderboardFilters(query, filters) {

        query = query
            .eq("game_id", gameSelect.value)
            .eq("period_type", filters.periodType)
            .eq("period_key", filters.periodKey);

        // Difficulty filtering applies only to 2048.
        if (filters.is2048) {
            query = query.eq("difficulty", filters.difficulty);
        }

        return query;
    }


    /* =========================
       LOAD LEADERBOARD
       ========================= */

    async function loadLeaderboard() {

        updateLeaderboardUI();

        const filters = getCurrentFilters();

        const colspan = filters.is2048 ? 5 : 3;

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="leaderboard-loading">
                    Loading leaderboard...
                </td>
            </tr>
        `;

        myRankElement.innerHTML = "";

        const gameId = gameSelect.value;

        if (!gameId) return;

        // Get the logged-in user.
        const {
            data: { user },
            error: userError
        } = await supaDb.auth.getUser();

        if (userError) {
            console.error("Error getting current user:", userError);
        }

        if (!user) {
            console.log("No logged-in user.");
        }


        /* =========================
           FETCH LEADERBOARD RECORDS
           ========================= */

        let query = supaDb
            .from("GameScores")
            .select(`
                user_id,
                score,
                difficulty,
                highest_tile,
                Profiles(username)
            `);

        query = applyLeaderboardFilters(query, filters);

        const { data, error } = await query
            .order("score", { ascending: false })
            .limit(100);

        if (error) {
            console.error("Leaderboard error:", error);

            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="${colspan}">
                        Unable to load leaderboard.
                    </td>
                </tr>
            `;

            return;
        }

        console.log("Leaderboard data:", data);


        /* =========================
           ASSIGN PLAYER RANKS
           ========================= */

        const rankedLeaderboard = data.map((player, index) => ({
            ...player,
            rank: index + 1
        }));


        /* =========================
           GET CURRENT PLAYER'S RANK
           ========================= */

        if (user) {

            let myScoreQuery = supaDb
                .from("GameScores")
                .select("score")
                .eq("user_id", user.id);

            myScoreQuery = applyLeaderboardFilters(
                myScoreQuery,
                filters
            );

            const {
                data: myScore,
                error: myScoreError
            } = await myScoreQuery.maybeSingle();

            if (myScoreError) {

                console.error(
                    "Error getting user's score:",
                    myScoreError
                );

            } else if (myScore) {

                // Count players with a higher score.
                let rankQuery = supaDb
                    .from("GameScores")
                    .select("user_id", {
                        count: "exact",
                        head: true
                    });

                rankQuery = applyLeaderboardFilters(
                    rankQuery,
                    filters
                );

                const {
                    count: higherScores,
                    error: rankError
                } = await rankQuery.gt("score", myScore.score);

                if (rankError) {

                    console.error(
                        "Error calculating user's rank:",
                        rankError
                    );

                } else {

                    const myRank = higherScores + 1;

                    myRankElement.innerHTML = `
                        <div class="my-rank-content">
                            <span>Your Rank</span>
                            <strong>#${myRank}</strong>
                            <span>
                                ${Number(myScore.score).toLocaleString()}
                                points
                            </span>
                        </div>
                    `;
                }
            }
        }


        /* =========================
           RENDER LEADERBOARD
           ========================= */

        if (!rankedLeaderboard.length) {

            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="${colspan}">
                        No leaderboard records found.
                    </td>
                </tr>
            `;

            return;
        }

        leaderboardBody.innerHTML = rankedLeaderboard.map(player => {

            const username = escapeHTML(
                player.Profiles?.username || "Unknown"
            );

            const score = Number(player.score).toLocaleString();

            if (filters.is2048) {

                const difficulty = escapeHTML(
                    player.difficulty || filters.difficulty
                );

                const highestTile = Number(
                    player.highest_tile || 0
                ).toLocaleString();

                return `
                    <tr>
                        <td class="rank">#${player.rank}</td>
                        <td class="username">${username}</td>
                        <td class="difficulty">${difficulty}</td>
                        <td class="score">${score}</td>
                        <td class="highest-tile">${highestTile}</td>
                    </tr>
                `;
            }

            // Existing Archery-style display.
            return `
                <tr>
                    <td class="rank">#${player.rank}</td>
                    <td class="username">${username}</td>
                    <td class="score">${score}</td>
                </tr>
            `;

        }).join("");

    }


    /* =========================
       EVENT LISTENERS
       ========================= */

    // Change game.
    gameSelect.addEventListener("change", loadLeaderboard);

    // Change 2048 difficulty.
    difficultySelect.addEventListener("change", loadLeaderboard);

    // Change leaderboard period.
    periodInputs.forEach(input => {

        input.addEventListener("change", loadLeaderboard);

    });


    /* =========================
       INITIALIZE LEADERBOARD
       ========================= */

    loadGames().then(success => {

        if (success) {
            loadLeaderboard();
        }

    });

});