document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       GET HTML ELEMENTS
    ========================= */

    const gameSelect = document.getElementById("game-select");

    const leaderboardBody =
        document.getElementById("archery-leaderboard-body");

    const periodInputs =
        document.querySelectorAll('input[name="leaderboard-period"]');

    const difficultyInputs =
        document.querySelectorAll('input[name="leaderboard-difficulty"]');

    const difficultyFilter =
        document.getElementById("difficulty-filter");

    const myRankElement =
        document.getElementById("my-rank");


    /* =========================
       GET SELECTED FILTERS
    ========================= */

    function getSelectedPeriod() {
        return document.querySelector(
            'input[name="leaderboard-period"]:checked'
        )?.value || "weekly";
    }

    function getSelectedDifficulty() {
        return document.querySelector(
            'input[name="leaderboard-difficulty"]:checked'
        )?.value || "normal";
    }

    function is2048Selected() {
        return gameSelect.selectedOptions[0]?.dataset.slug === "play-2048-free";
    }


    /* =========================
       PERIOD INFORMATION
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
            const month = String(now.getMonth() + 1).padStart(2, "0");

            return {
                periodType: "monthly",
                periodKey: `${year}-${month}`
            };
        }

        if (period === "weekly") {
            const year = now.getFullYear();

            const startOfYear = new Date(year, 0, 1);

            const daysSinceStartOfYear =
                Math.floor((now - startOfYear) / 86400000);

            const weekNumber =
                Math.ceil(
                    (daysSinceStartOfYear + startOfYear.getDay() + 1) / 7
                );

            return {
                periodType: "weekly",
                periodKey: `${year}-W${String(weekNumber).padStart(2, "0")}`
            };
        }
    }


    /* =========================
       LOAD AVAILABLE GAMES
    ========================= */

    async function loadGames() {

        const { data, error } = await supaDb
            .from("Games")
            .select("id, name, slug")
            .order("name");

        if (error) {
            console.error("Error loading games:", error);
            return;
        }

        gameSelect.innerHTML = data.map(game => `
            <option
                value="${game.id}"
                data-slug="${game.slug}"
            >
                ${game.name}
            </option>
        `).join("");

        console.log("Games loaded:", data);

        updateDifficultyFilter();

        const periodInfo = getPeriodInfo(getSelectedPeriod());

        loadLeaderboard(
            periodInfo.periodType,
            periodInfo.periodKey
        );
    }


    /* =========================
       SHOW / HIDE DIFFICULTY
    ========================= */

    function updateDifficultyFilter() {

        const showDifficulty = is2048Selected();

        difficultyFilter.hidden = !showDifficulty;
    }


    /* =========================
       LOAD LEADERBOARD
    ========================= */

    async function loadLeaderboard(periodType, periodKey) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="5" class="leaderboard-loading">
                    Loading leaderboard...
                </td>
            </tr>
        `;

        myRankElement.innerHTML = "";

        const gameId = gameSelect.value;

        if (!gameId) {
            return;
        }

        const is2048 = is2048Selected();

        const difficulty = is2048
            ? getSelectedDifficulty()
            : null;

        // Keep the existing period key format for other games.
        // Append difficulty only for 2048.
        const databasePeriodKey = is2048
            ? `${periodKey}:${difficulty}`
            : periodKey;


        /* =========================
           GET CURRENT USER
        ========================= */

        const {
            data: { user },
            error: userError
        } = await supaDb.auth.getUser();

        if (userError) {
            console.error("Error getting current user:", userError);
        }


        /* =========================
           FETCH LEADERBOARD DATA
        ========================= */

        let leaderboardQuery = supaDb
            .from("GameScores")
            .select(`
                user_id,
                score,
                difficulty,
                highest_tile,
                Profiles(username)
            `)
            .eq("period_type", periodType)
            .eq("period_key", databasePeriodKey)
            .eq("game_id", gameId);

        if (is2048) {
            leaderboardQuery = leaderboardQuery.eq(
                "difficulty",
                difficulty
            );
        } else {
            leaderboardQuery = leaderboardQuery.is(
                "difficulty",
                null
            );
        }

        const { data, error } = await leaderboardQuery
            .order("score", { ascending: false })
            .limit(100);

        if (error) {
            console.error("Leaderboard error:", error);

            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load leaderboard.
                    </td>
                </tr>
            `;

            return;
        }

        console.log("Leaderboard data:", data);


        /* =========================
           ADD RANKINGS
        ========================= */

        const rankedLeaderboard = data.map((player, index) => ({
            ...player,
            rank: index + 1
        }));


        /* =========================
           GET CURRENT USER'S RANK
        ========================= */

        if (user) {

            let myScoreQuery = supaDb
                .from("GameScores")
                .select("score, highest_tile, difficulty")
                .eq("user_id", user.id)
                .eq("game_id", gameId)
                .eq("period_type", periodType)
                .eq("period_key", databasePeriodKey);

            if (is2048) {
                myScoreQuery = myScoreQuery.eq(
                    "difficulty",
                    difficulty
                );
            } else {
                myScoreQuery = myScoreQuery.is(
                    "difficulty",
                    null
                );
            }

            const {
                data: myScore,
                error: myScoreError
            } = await myScoreQuery.maybeSingle();

            if (myScoreError) {
                console.error("Error getting user's score:", myScoreError);

            } else if (myScore) {

                let higherScoresQuery = supaDb
                    .from("GameScores")
                    .select("user_id", {
                        count: "exact",
                        head: true
                    })
                    .eq("game_id", gameId)
                    .eq("period_type", periodType)
                    .eq("period_key", databasePeriodKey)
                    .gt("score", myScore.score);

                if (is2048) {
                    higherScoresQuery = higherScoresQuery.eq(
                        "difficulty",
                        difficulty
                    );
                } else {
                    higherScoresQuery = higherScoresQuery.is(
                        "difficulty",
                        null
                    );
                }

                const {
                    count: higherScores,
                    error: rankError
                } = await higherScoresQuery;

                if (rankError) {
                    console.error("Error calculating user's rank:", rankError);

                } else {

                    const myRank = higherScores + 1;

                    myRankElement.innerHTML = `
                        <div class="my-rank-content">
                            <span>Your Rank</span>
                            <strong>#${myRank}</strong>
                            <span>${myScore.score.toLocaleString()} points</span>

                            ${is2048 ? `
                                <span>Highest Tile: ${
                                    myScore.highest_tile.toLocaleString()
                                }</span>
                            ` : ""}
                        </div>
                    `;
                }
            }
        }


        /* =========================
           DISPLAY LEADERBOARD ROWS
        ========================= */

        if (!rankedLeaderboard.length) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No leaderboard records yet.
                    </td>
                </tr>
            `;

            return;
        }

        leaderboardBody.innerHTML = rankedLeaderboard.map(player => `
            <tr>
                <td class="rank">#${player.rank}</td>

                <td class="username">
                    ${player.Profiles?.username || "Unknown Player"}
                </td>

                <td class="difficulty">
                    ${
                        player.difficulty
                            ? player.difficulty.replace("-", " ")
                            : "—"
                    }
                </td>

                <td class="score">
                    ${Number(player.score).toLocaleString()}
                </td>

                <td class="highest-tile">
                    ${
                        player.highest_tile
                            ? Number(player.highest_tile).toLocaleString()
                            : "—"
                    }
                </td>
            </tr>
        `).join("");
    }


    /* =========================
       FILTER EVENT LISTENERS
    ========================= */

    periodInputs.forEach(input => {
        input.addEventListener("change", () => {

            const periodInfo = getPeriodInfo(input.value);

            loadLeaderboard(
                periodInfo.periodType,
                periodInfo.periodKey
            );
        });
    });


    difficultyInputs.forEach(input => {
        input.addEventListener("change", () => {

            const periodInfo = getPeriodInfo(getSelectedPeriod());

            loadLeaderboard(
                periodInfo.periodType,
                periodInfo.periodKey
            );
        });
    });


    gameSelect.addEventListener("change", () => {

        updateDifficultyFilter();

        const periodInfo = getPeriodInfo(getSelectedPeriod());

        loadLeaderboard(
            periodInfo.periodType,
            periodInfo.periodKey
        );
    });


    /* =========================
       INITIALIZE
    ========================= */

    loadGames();

});