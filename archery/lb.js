document.addEventListener("DOMContentLoaded", function() {

/* =========================
   GET TABLE BODY
   ========================= */
const gameSelect = document.getElementById("game-select");

const leaderboardBody =
    document.getElementById("archery-leaderboard-body");
    const periodInputs =
    document.querySelectorAll('input[name="leaderboard-period"]');

    

/* =========================
   DISPLAY LEADERBOARD
   ========================= */
async function loadGames() {
   
    const { data, error } = await supaDb
        .from("Games")
        .select("id, name")
        .order("name");

    if (error) {
        console.error("Error loading games:", error);
        return;
    }

    gameSelect.innerHTML = data.map(game => `
        <option value="${game.id}">
            ${game.name}
        </option>
    `).join("");

    console.log("Games loaded:", data);
}

// Call loadGames to populate the game selector
loadGames().then(() => {
    const periodInfo = getPeriodInfo("weekly");

    loadLeaderboard(
        periodInfo.periodType,
        periodInfo.periodKey
    );
});// ===== get period info ======

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
            Math.ceil((daysSinceStartOfYear + startOfYear.getDay() + 1) / 7);

        return {
            periodType: "weekly",
            periodKey: `${year}-W${String(weekNumber).padStart(2, "0")}`
        };
    }
}
/* =========================
   PERIOD SWITCHING
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
// ===== selecting the game from the dropdown ===== 

gameSelect.addEventListener("change", () => {

    const selectedPeriod =
        document.querySelector(
            'input[name="leaderboard-period"]:checked'
        ).value;

    const periodInfo = getPeriodInfo(selectedPeriod);

    loadLeaderboard(
        periodInfo.periodType,
        periodInfo.periodKey
    );
});
    //======== LOAD LEADERBOARD ON PAGE FUNCTION ========//
    async function loadLeaderboard(periodType, periodKey) {
        leaderboardBody.innerHTML = `
    <tr>
        <td colspan="3" class="leaderboard-loading">
            Loading leaderboard...
        </td>
    </tr>
`;

// ======= get current logged in user id =======
const {
    data: { user },
    error: userError
} = await supaDb.auth.getUser();

if (userError) {
    console.error("Error getting current user:", userError);

}
if(!user){
    console.log('no logged in user')
}
// ========== get the users rank ======
if (user) {

    // Get the logged-in user's score
    const { data: myScore, error: myScoreError } = await supaDb
        .from("GameScores")
        .select("score")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .eq("period_type", periodType)
        .eq("period_key", periodKey)
        .maybeSingle();

    if (myScoreError) {
        console.error("Error getting user's score:", myScoreError);
        return;
    }

    const myRankElement = document.getElementById("my-rank");

    // User has no score for this leaderboard period
    if (!myScore) {
        myRankElement.innerHTML = "";
        return;
    }

    // Count players with a higher score
    const {
        count: higherScores,
        error: rankError
    } = await supaDb
        .from("GameScores")
        .select("user_id", { count: "exact", head: true })
        .eq("game_id", gameId)
        .eq("period_type", periodType)
        .eq("period_key", periodKey)
        .gt("score", myScore.score);

    if (rankError) {
        console.error("Error calculating user's rank:", rankError);
        return;
    }

    const myRank = higherScores + 1;

    console.log("My score:", myScore.score);
    console.log("My rank:", myRank);

    myRankElement.innerHTML = `
        <div class="my-rank-content">
            <span>Your Rank</span>
            <strong>#${myRank}</strong>
            <span>${myScore.score} points</span>
        </div>
    `;
}
        const gameId = gameSelect.value;
    const { data, error } = await supaDb
        .from("GameScores")
        .select(`
            user_id,
            score,
            Profiles(username)
        `)
        .eq("period_type", periodType)
        .eq("period_key", periodKey)
        .eq("game_id", gameId)
        .order("score", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Leaderboard error:", error);
        return;
    }

    console.log("Leaderboard data:", data);

    const rankedLeaderboard = data.map((player, index) => ({
        ...player,
        rank: index + 1
    }));

    leaderboardBody.innerHTML = rankedLeaderboard.map(player => `
        <tr>
            <td class="rank">${player.rank}</td>
            <td class="username">${player.Profiles.username}</td>
            <td class="score">${player.score}</td>
        </tr>
    `).join("");
}

// ======= CALLING THE FUNCTION TO LOAD LEADERBOARD FOR THE CURRENT PERIOD ======= //





});