document.addEventListener('DOMContentLoaded',()=>{
    async function loadBookmarks() {
    // Get Logged in User >>>>>
        const{
            data: {user},
            error: loadError
        } = await supaDb.auth.getUser();
        if (loadError) {
            console.log('user bookmarks error');
            return 0;
        }
        if (!user) {
            console.log('No signed in user')
            return 0;
        }

        // Start profile online presence
startProfilePresence(user.id);
        // access bookmarks table >>>>>>
        const {
        data: bookmarks,
        error: bookmarkError
    } = await supaDb
        .from('Bookmarks')
        .select('id, page_url, page_title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (bookmarkError) {
        console.error('Error loading bookmarks:', bookmarkError);
        return;
    }

    console.log('User bookmarks:', bookmarks);
    
    const bookmarkList = document.getElementById('bookmarkList');
    
    if (bookmarks.length === 0) {
        bookmarkList.innerHTML = ` <div class="bookmark-item">
            No bookmarks yet.
        </div>`
        return 0;
    }
    bookmarkList.innerHTML = '';
    
    bookmarks.forEach(bookmark => {

    const item =
        document.createElement('div');

    item.className =
        'bookmark-item';


    const link =
        document.createElement('a');

    link.href =
        bookmark.page_url;

    link.textContent =
        bookmark.page_title;


    item.appendChild(link);

    bookmarkList.appendChild(item);

});

        // function End 
    }

    // Function to Get games Played data
    async function getGamesPlayed() {
    const {
        data: { user },
        error: userError
    } = await supaDb.auth.getUser();

    if (userError || !user) {
        console.error('Error getting authenticated user:', userError);
        return;
    }

    const {
        data: playedData,
        error: playedError
    } = await supaDb
        .from('PlayerStats')
        .select('games_played')
        .eq('user_id', user.id);

    if (playedError) {
        console.error('Error getting games played:', playedError);
        return;
    }

    const totalGamesPlayed = playedData.reduce(
        (total, row) => total + row.games_played,
        0
    );

    const gamesPlayed = document.getElementById('gamesPlayed');

    if (gamesPlayed) {
        gamesPlayed.textContent = totalGamesPlayed;
    }
}

// ======= Display the name of games played in player profile =============
/* ===== Load Games Played ===== */

async function loadGames() {

    // Get the logged-in user
    const {
        data: { user },
        error: userError
    } = await supaDb.auth.getUser();

    if (userError) {
        console.error('Error getting user:', userError);
        return;
    }

    if (!user) {
        console.log('No signed-in user');
        return;
    }

    // Get the user's game statistics and related game names
    const {
        data: games,
        error: gamesError
    } = await supaDb
        .from('PlayerStats')
        .select(`
            best_score,
            games_played,
            Games (
                name
            )
        `)
        .eq('user_id', user.id);

    if (gamesError) {
        console.error('Error loading games:', gamesError);
        return;
    }

    // Get the games container
    const gamesList = document.getElementById('gamesList');

    if (!gamesList) {
        console.error('Games list element not found');
        return;
    }

    // Clear existing content
    gamesList.replaceChildren();

    // Display an empty state if no games have been played
    if (!games || games.length === 0) {
        const message = document.createElement('div');
        message.className = 'game-item';
        message.textContent = 'You have not played any games yet.';

        gamesList.appendChild(message);
        return;
    }

    // Display each game
    games.forEach(record => {

        const gameItem = document.createElement('div');
        gameItem.className = 'game-item';

        const gameTitle = document.createElement('span');
        gameTitle.className = 'game-title';
        gameTitle.textContent =
            record.Games?.name || 'Unknown Game';

        const gameScore = document.createElement('span');
        gameScore.className = 'game-score';
        gameScore.textContent =
            `High Score: ${record.best_score ?? 0}`;

        gameItem.append(gameTitle, gameScore);
        gamesList.appendChild(gameItem);

    });

}
    // Check if user is online  >>>>>>
    
let profilePresenceChannel = null;
let activityTimer = null;

async function startProfilePresence(userId) {
    const badge = document.getElementById("profStatusBadge");

    if (!badge || !userId) return;

    // Prevent duplicate presence channels.
    if (profilePresenceChannel) {
        await supaDb.removeChannel(profilePresenceChannel);
        profilePresenceChannel = null;
    }

    clearTimeout(activityTimer);

    let isOnline = false;

    function updateBadge(online) {
        isOnline = online;

        badge.classList.toggle("is-online", online);
        badge.classList.toggle("is-offline", !online);
        badge.textContent = online ? "● ONLINE" : "● OFFLINE";
    }

    const channel = supaDb.channel("qvg-online-users");

    profilePresenceChannel = channel;

    async function markOnline() {
        clearTimeout(activityTimer);

        if (document.hidden) {
            markOffline();
            return;
        }

        if (channel.state !== "joined") return;

        const { error } = await channel.track({
            user_id: userId,
            last_active_at: new Date().toISOString()
        });

        updateBadge(!error);

        if (error) console.error("Presence error:", error);

        activityTimer = setTimeout(markOffline, 5 * 60 * 1000);
    }

    async function markOffline() {
        clearTimeout(activityTimer);

        if (isOnline) {
            updateBadge(false);
            await channel.untrack();
        } else {
            updateBadge(false);
        }
    }

    channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
            updateBadge(false);

            if (!document.hidden) {
                await markOnline();
            }
        } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
        ) {
            updateBadge(false);
        }
    });

    // Activity restarts the five-minute inactivity timer.
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, markOnline);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            markOffline();
        } else {
            markOnline();
        }
    });
}
// Check if user is already online end >>>>>>

/* achievements */

/* ===== Quantorv Games Achievement Catalogue ===== */

const ACHIEVEMENTS = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first game.',
        icon: 'gamepad',
        requirement: 'Complete 1 game'
    },
    {
        id: 'daily_player',
        name: 'Daily Player',
        description: 'Log in on 7 consecutive days.',
        icon: 'calendar',
        requirement: 'Maintain a 7-day login streak'
    },
    {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Reach a target score in Archery.',
        icon: 'target',
        requirement: 'Reach the required Archery score'
    },
    {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Set a personal best in any game.',
        icon: 'trophy',
        requirement: 'Set a new personal best'
    },
    {
        id: 'explorer',
        name: 'Explorer',
        description: 'Play 5 different games.',
        icon: 'compass',
        requirement: 'Play 5 different games'
    },
    {
        id: 'loyal_player',
        name: 'Loyal Player',
        description: 'Maintain a 30-day daily login streak.',
        icon: 'flame',
        requirement: 'Maintain a 30-day login streak'
    }
];


/* ===== Lightweight SVG Icon Set ===== */


const ACHIEVEMENT_ICONS = {
    // First Steps — complete your first game
    gamepad: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 10h12a4 4 0 0 1 3.8 5.2l-1 3
            a2 2 0 0 1-3.2 1l-3-2.2h-5.2l-3 2.2
            a2 2 0 0 1-3.2-1l-1-3A4 4 0 0 1 6 10Z"/>
            <path d="M7 12v4m-2-2h4m6-1h.01m3 2h.01"/>
        </svg>
    `,

    // Daily login / calendar achievements
    calendar: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2"/>
        </svg>
    `,

    // Sharpshooter — 1,000 Archery points
    target: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="13" r="8"/>
            <circle cx="11" cy="13" r="4"/>
            <circle cx="11" cy="13" r="1"/>
            <path d="m13 11 8-8m-5 0h5v5"/>
        </svg>
    `,

    // Trophy / tournament achievements
    trophy: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0
            0 1-10 0V4ZM7 7H3v2a5 5 0 0 0 5 5
            m9-7h4v2a5 5 0 0 1-5 5"/>
        </svg>
    `,

    // Exploration achievements
    compass: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>
        </svg>
    `,

    // Streak achievements
    flame: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22a8 8 0 0 0 8-8
            c0-4-3-6-4-10-2 2-3 4-3 6
            -2-1-3-3-3-5-4 4-6 7-6 10a8 8
            0 0 0 8 7Z"/>
            <path d="M12 22a4 4 0 0 0 4-4
            c0-2-2-4-3-5 0 2-2 3-2 5
            a4 4 0 0 0 1 4Z"/>
        </svg>
    `,

    // First Blood — 100 Archery points
    first_blood: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21
            9.5 14.5 3 12l6.5-2.5L12 3Z"/>
            <path d="m17 3 .8 2.2L20 6l-2.2.8L17 9
            l-.8-2.2L14 6l2.2-.8L17 3Z"/>
        </svg>
    `,

    // Deadeye — 500 Archery points
    deadeye: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
        </svg>
    `,

    // Bullseye Legend — 5,000 Archery points
    bullseye_legend: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="m14 10 7-7m-5 0h5v5"/>
        </svg>
    `,

    // Master Archer — 10,000 Archery points
    master_archer: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20 20 4M7 4h13v13"/>
            <path d="M4 4c10 0 16 6 16 16"/>
            <path d="m14 4 6 6"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    `,

    // Archery Ascendant — 50,000 Archery points
    archery_ascendant: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 17 5-6 4 3 8-10"/>
            <path d="M14 4h6v6"/>
            <path d="M4 21h16"/>
            <path d="m7 8 1-5 3 3"/>
        </svg>
    `
};



/* ===== Badge Rank System ===== */

const BADGE_RANKS = [
    {
        name: 'Rising Star',
        threshold: 0,
        description: 'Your achievement journey starts here.'
    },
    {
        name: 'Achiever',
        threshold: 5,
        description: 'You are building a record of accomplishments.'
    },
    {
        name: 'Trailblazer',
        threshold: 10,
        description: 'Keep exploring and collecting achievements.'
    },
    {
        name: 'Champion',
        threshold: 20,
        description: 'Your dedication is starting to stand out.'
    },
    {
        name: 'Elite',
        threshold: 50,
        description: 'You have established an impressive record.'
    },
    {
        name: 'Legend',
        threshold: 100,
        description: 'You are becoming a Quantorv Games legend.'
    },
    {
        name: 'Grandmaster',
        threshold: 250,
        description: 'Your persistence is taking you to the top.'
    },
    {
        name: 'Icon',
        threshold: 500,
        description: 'You have reached an exceptional milestone.'
    },
    {
        name: 'Quantorv Immortal',
        threshold: 1000,
        description: 'A truly extraordinary achievement record.'
    }
];

function getBadgeRank(unlockedCount) {
    const count = Math.max(0, Number(unlockedCount) || 0);

    return BADGE_RANKS
        .filter(rank => count >= rank.threshold)
        .at(-1);
}

function getNextBadgeRank(unlockedCount) {
    const count = Math.max(0, Number(unlockedCount) || 0);

    return BADGE_RANKS.find(
        rank => count < rank.threshold
    ) || null;
}


function updateBadgeProgression(unlockedCount) {
    const count = Math.max(0, Number(unlockedCount) || 0);

    const currentRank = getBadgeRank(count);
    const nextRank = getNextBadgeRank(count);
    const nextIcon = document.getElementById('nextBadgeIcon');
if (nextIcon) nextIcon.hidden = !nextRank;

    const countElement =
        document.getElementById('achievementCount');

    const currentElement =
        document.getElementById('currentBadgeRank');

    const nextElement =
        document.getElementById('nextBadgeRank');

    const encouragementElement =
        document.getElementById('badgeEncouragement');

    if (currentElement) {
        currentElement.textContent = currentRank.name;
    }

    setBadgeIcon('currentBadgeIcon', currentRank.name);

    if (nextRank) {
        if (nextElement) {
            nextElement.textContent =
                `${nextRank.name} · ${nextRank.threshold}`;
        }

        setBadgeIcon('nextBadgeIcon', nextRank.name);

        if (countElement) {
            countElement.textContent =
                `${count} / ${nextRank.threshold - 1}`;
        }

        if (encouragementElement) {
            const remaining = nextRank.threshold - count;

            encouragementElement.textContent =
                `${currentRank.description} Unlock ${remaining} more ` +
                `achievement${remaining === 1 ? '' : 's'} to reach ` +
                `${nextRank.name}. Keep playing!`;
        }
    } else {
        if (nextElement) {
            nextElement.textContent = 'Highest rank reached!';
        }

        // There is no next badge after the final rank.
        const nextIcon = document.getElementById('nextBadgeIcon');
        if (nextIcon) nextIcon.hidden = true;

        if (countElement) {
            countElement.textContent = `${count}+`;
        }

        if (encouragementElement) {
            encouragementElement.textContent =
                'You have reached the highest badge rank. ' +
                'Keep playing and collecting achievements!';
        }
    }
}


const BADGE_ICONS = {
    'Rising Star': 'rising-star',
    'Achiever': 'achiever',
    'Trailblazer': 'trailblazer',
    'Champion': 'champion',
    'Elite': 'elite',
    'Legend': 'legend',
    'Grandmaster': 'grandmaster',
    'Icon': 'icon',
    'Quantorv Immortal': 'quantorv-immortal'
};
// ========== set badge icon =====
function setBadgeIcon(elementId, rankName) {
    const svg = document.getElementById(elementId);
    if (!svg) return;

    const symbolId = BADGE_ICONS[rankName];

    if (!symbolId) return;

    const use = svg.querySelector('use');
    if (!use) return;

    use.setAttribute(
        'href',
        `/assets/badges.svg#${symbolId}`
    );

    svg.setAttribute('aria-label', `${rankName} badge`);
}

/* ===== Badge Rank System Ends ===== */

/* ===== Render Achievements ===== */


function renderAchievements(
    achievements = ACHIEVEMENTS,
    unlockedIds = []
) {
    const achievementList =
        document.getElementById('achievementList');

    const achievementCount =
        document.getElementById('achievementCount');

    if (!achievementList || !achievementCount) return;

    const unlocked = new Set(unlockedIds);

    achievementList.replaceChildren();

    let unlockedCount = 0;

    achievements.forEach(achievement => {
        const isUnlocked = unlocked.has(achievement.id);

        if (isUnlocked) unlockedCount++;

        const item = document.createElement('div');
        item.className = 'achievement-item';

        if (isUnlocked) {
            item.classList.add('is-unlocked');
        }

        const art = document.createElement('div');
        art.className = 'achievement-art';
        art.setAttribute('aria-hidden', 'true');

        art.innerHTML =
            ACHIEVEMENT_ICONS[achievement.icon] || '';

        const name = document.createElement('h4');
        name.className = 'achievement-name';
        name.textContent = achievement.name;

        const description = document.createElement('p');
        description.className = 'achievement-description';
        description.textContent = achievement.description;

        const status = document.createElement('span');
        status.className = 'achievement-status';
        status.textContent = isUnlocked ? 'Unlocked' : 'Locked';

        item.append(art, name, description, status);
        achievementList.appendChild(item);
    });

    achievementCount.textContent =
      updateBadgeProgression(unlocked.size);
}


/* ===== Initialise Achievement UI ===== */


async function loadAchievements() {
    const achList =
        document.getElementById('achievementList');

    if (!achList) return;

    try {
        if (!window.supaDb) {
            throw new Error('Supabase client unavailable.');
        }

        const {
            data: { user },
            error: authError
        } = await window.supaDb.auth.getUser();

        if (authError) throw authError;

        // Load active achievement definitions.
        const {
            data: definitions,
            error: definitionsError
        } = await window.supaDb
            .from('AchievementDef')
            .select('id, name, description, icon')
            .eq('is_active', true);

        if (definitionsError) throw definitionsError;

        // No user means all achievements remain locked.
        if (!user) {
            renderAchievements(definitions || [], []);
            return;
        }

        // Load this user's unlocked achievements.
        const {
            data: awards,
            error: awardsError
        } = await window.supaDb
            .from('PlayerAchievements')
            .select('achievement_id')
            .eq('user_id', user.id);

        if (awardsError) throw awardsError;

        const unlockedIds = (awards || [])
            .map(award => award.achievement_id);

        renderAchievements(
            definitions || [],
            unlockedIds
        );

    } catch (error) {
        console.error('Failed to load achievements:', error);

        achList.replaceChildren();

        const message = document.createElement('p');
        message.className = 'achievement-loading';
        message.textContent =
            'Unable to load achievements. Please try again later.';

        achList.appendChild(message);
    }
}

/* ===== Test Achievement UI ===== 

function loadAchievements() {
    renderAchievements([
        'first_steps',
        'high_scorer'
    ]);
}

===== Test Achievement UI Ends ===== */

/* ======== set up achievements celebration ===== */

/* ===== Achievement Celebration Effects ===== */

let currentCelebrationAchievementId = null;
const achievementSound = new Audio('https://cdn.jsdelivr.net/gh/ClintTheDuke/qvg@main/sounds/universfield-level-up-08-402152.mp3');
achievementSound.volume = 0.5;

function playAchievementSound() {
    achievementSound.currentTime = 0;

    achievementSound.play().catch(error => {
        console.warn('[Celebration] Sound playback was blocked:', error);
    });
}

function launchAchievementConfetti() {
    console.log('[Celebration] Starting confetti.');

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('[Celebration] Could not create 2D canvas context.');
            return;
        }

        Object.assign(canvas.style, {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '10000'
        });

        document.body.appendChild(canvas);
        console.log('[Celebration] Confetti canvas added to the page.');

        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resizeCanvas();

        const colors = ['#08d549', '#ffffff', '#ffd700', '#00bfff'];
        const particles = [];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight * 0.38,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 12 - 2,
                gravity: 0.24,
                size: Math.random() * 7 + 3,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        console.log(`[Celebration] Created ${particles.length} confetti particles.`);

        const startTime = performance.now();
        const duration = 3200;

        function animate(now) {
            try {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.rotation += p.spin;

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(
                        -p.size / 2,
                        -p.size / 2,
                        p.size,
                        p.size * 0.65
                    );
                    ctx.restore();
                });

                if (now - startTime < duration) {
                    requestAnimationFrame(animate);
                } else {
                    canvas.remove();
                    console.log('[Celebration] Confetti animation completed.');
                }
            } catch (error) {
                canvas.remove();
                console.error('[Celebration] Confetti animation failed:', error);
            }
        }

        requestAnimationFrame(animate);
    } catch (error) {
        console.error('[Celebration] Could not launch confetti:', error);
    }
}


function showAchievementCelebration(achievement) {
    console.log('[Celebration] Requested for achievement:', achievement);

    const modal = document.getElementById('achievementCelebration');
    const title = document.getElementById('celebrationTitle');
    const description = document.getElementById('celebrationDescription');
    const icon = document.getElementById('celebrationIcon');

    if (!modal || !title || !description || !icon) {
        console.error('[Celebration] Required modal elements are missing.', {
            modalFound: Boolean(modal),
            titleFound: Boolean(title),
            descriptionFound: Boolean(description),
            iconFound: Boolean(icon)
        });
        return;
    }

    if (!achievement?.id) {
        console.error('[Celebration] Achievement has no ID:', achievement);
        return;
    }

    currentCelebrationAchievementId = achievement.id;

    title.textContent = achievement.name;
    description.textContent = achievement.description;
    icon.innerHTML = ACHIEVEMENT_ICONS[achievement.icon] || '';

    modal.hidden = false;

    console.log(
        '[Celebration] Modal displayed for:',
        achievement.id,
        achievement.name
    );
    playAchievementSound();
    launchAchievementConfetti();

    document.getElementById('viewAchievementsBtn')?.focus();
}


/* ===== Load Achievements and Find Pending Celebrations ===== */

async function loadAchievements() {
    console.log('[Achievements] Loading started.');

    const achList = document.getElementById('achievementList');

    if (!achList) {
        console.error('[Achievements] #achievementList was not found.');
        return;
    }

    try {
        if (!window.supaDb) {
            throw new Error('Supabase client unavailable: window.supaDb is missing.');
        }

        const {
            data: { user },
            error: authError
        } = await window.supaDb.auth.getUser();

        if (authError) {
            console.error('[Achievements] Could not retrieve current user:', authError);
            throw authError;
        }

        console.log(
            '[Achievements] Current user:',
            user ? user.id : 'No authenticated user'
        );

        const {
            data: definitions,
            error: definitionsError
        } = await window.supaDb
            .from('AchievementDef')
            .select('id, name, description, icon')
            .eq('is_active', true);

        if (definitionsError) {
            console.error('[Achievements] Definition query failed:', definitionsError);
            throw definitionsError;
        }

        console.log('[Achievements] Active definitions received:', definitions);

        if (!user) {
            renderAchievements(definitions || [], []);
            console.log('[Achievements] Logged-out view rendered; no celebration check.');
            return;
        }

        const {
            data: awards,
            error: awardsError
        } = await window.supaDb
            .from('PlayerAchievements')
            .select('achievement_id, unlocked_at, celebration_seen_at')
            .eq('user_id', user.id)
            .order('unlocked_at', { ascending: true });

        if (awardsError) {
            console.error('[Achievements] Player award query failed:', awardsError);
            throw awardsError;
        }

        const playerAwards = awards || [];

        console.log('[Achievements] Awards retrieved:', playerAwards);

        const unlockedIds = playerAwards.map(
            award => award.achievement_id
        );

        renderAchievements(definitions || [], unlockedIds);

        const pendingAwards = playerAwards.filter(
            award => award.celebration_seen_at === null
        );

        console.log('[Achievements] Awards awaiting celebration:', pendingAwards);

        if (pendingAwards.length === 0) {
            console.log('[Achievements] No pending celebrations.');
            return;
        }

        // Show the oldest unacknowledged award first.
        const pendingAward = pendingAwards[0];

        const achievement = (definitions || []).find(
            item => item.id === pendingAward.achievement_id
        );

        if (!achievement) {
            console.warn(
                '[Achievements] A pending award has no matching active definition:',
                pendingAward.achievement_id
            );
            return;
        }

        console.log('[Achievements] Opening celebration for:', achievement.id);

        showAchievementCelebration(achievement);

    } catch (error) {
        console.error('[Achievements] Loading failed:', error);

        achList.replaceChildren();

        const message = document.createElement('p');
        message.className = 'achievement-loading';
        message.textContent =
            'Unable to load achievements. Please try again later.';

        achList.appendChild(message);
    }
}


/* ===== Acknowledge Celebration in Supabase ===== */

function setupAchievementCelebration() {
    console.log('[Celebration] Setting up modal controls.');

    const modal = document.getElementById('achievementCelebration');
    const cancelBtn = document.getElementById('cancelCelebrationBtn');
    const viewBtn = document.getElementById('viewAchievementsBtn');

    if (!modal || !cancelBtn || !viewBtn) {
        console.error('[Celebration] Cannot set up controls; required elements are missing.', {
            modalFound: Boolean(modal),
            cancelButtonFound: Boolean(cancelBtn),
            viewButtonFound: Boolean(viewBtn)
        });
        return;
    }

    async function dismissCelebration(viewAchievements) {
        const achievementId = currentCelebrationAchievementId;

        console.log('[Celebration] Dismissal requested:', {
            achievementId,
            viewAchievements
        });

        if (!achievementId) {
            console.warn('[Celebration] No active achievement ID; closing modal only.');
            modal.hidden = true;
            return;
        }

        try {
            if (!window.supaDb) {
                throw new Error('Supabase client unavailable.');
            }

            const {
                data: { user },
                error: authError
            } = await window.supaDb.auth.getUser();

            if (authError) throw authError;

            if (!user) {
                throw new Error('Cannot acknowledge celebration: no authenticated user.');
            }

            console.log('[Celebration] Acknowledging award in Supabase:', achievementId);

            const { data, error } = await window.supaDb.rpc(
                'acknowledge_achievement_celebration',
                { p_achievement_id: achievementId }
            );

            if (error) {
                console.error('[Celebration] Supabase acknowledgement failed:', error);
                throw error;
            }

            console.log('[Celebration] Supabase acknowledgement response:', data);

        } catch (error) {
            console.error(
                '[Celebration] Could not save acknowledgement. It may appear again on the next visit:',
                error
            );
        } finally {
            // Close the modal even if the acknowledgement request fails.
            // If it fails, the database row remains pending and can be retried later.
            modal.hidden = true;
            currentCelebrationAchievementId = null;

            console.log('[Celebration] Modal closed.');
        }

        if (viewAchievements) {
            const section = document.getElementById('achievementList');

            if (section) {
                console.log('[Celebration] Scrolling to the achievements section.');

                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                console.error('[Celebration] Cannot scroll: #achievementList was not found.');
            }
        }
    }

    cancelBtn.addEventListener('click', () => {
        dismissCelebration(false);
    });

    viewBtn.addEventListener('click', () => {
        dismissCelebration(true);
    });

    console.log('[Celebration] Modal controls ready.');
}

/* ===== Game Session Streak ===== */

async function loadGameStreak() {
    const streakNumber =
        document.getElementById('currentStreak');

    const streakStatus =
        document.getElementById('streakStatus');

    const progressLabel =
        document.getElementById('streakProgressLabel');

    const progressBar =
        document.getElementById('streakProgressBar');

    const progressFill =
        document.getElementById('streakProgressFill');

    if (
        !streakNumber ||
        !streakStatus ||
        !progressLabel ||
        !progressBar ||
        !progressFill
    ) return;

    try {
        const {
            data: { user },
            error: authError
        } = await window.supaDb.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            streakNumber.textContent = '0';
            streakStatus.textContent = 'Log in to track your streak.';
            return;
        }

        const { data, error } = await window.supaDb
            .from('PlayerActivity')
            .select('activity_date, games_completed')
            .eq('user_id', user.id)
            .order('activity_date', { ascending: false });

        if (error) throw error;

        const activities = data || [];

        // Use UTC consistently with the database function.
        const today = new Date().toISOString().slice(0, 10);

        const yesterdayDate = new Date();
        yesterdayDate.setUTCDate(
            yesterdayDate.getUTCDate() - 1
        );

        const yesterday =
            yesterdayDate.toISOString().slice(0, 10);

        const activeDates = new Set(
            activities
                .filter(activity =>
                    activity.games_completed > 0
                )
                .map(activity => activity.activity_date)
        );

        const completedToday = activeDates.has(today);

        const latestDate = activities.find(activity =>
            activity.games_completed > 0
        )?.activity_date;

        let streak = 0;

        // A streak remains active through today if the
        // most recent qualifying day was yesterday.
        if (
            latestDate === today ||
            latestDate === yesterday
        ) {
            const cursor = new Date(
                `${latestDate}T00:00:00Z`
            );

            while (
                activeDates.has(
                    cursor.toISOString().slice(0, 10)
                )
            ) {
                streak++;

                cursor.setUTCDate(
                    cursor.getUTCDate() - 1
                );
            }
        }

        streakNumber.textContent = String(streak);

        if (completedToday) {
            streakStatus.textContent =
                'Nice work! Your streak is secured for today.';
        } else if (streak > 0) {
            streakStatus.textContent =
                'Complete a game today to keep your streak alive!';
        } else {
            streakStatus.textContent =
                'Complete a game to start your streak!';
        }

        progressLabel.textContent =
            completedToday ? '1 / 1' : '0 / 1';

        progressBar.setAttribute(
            'aria-valuenow',
            completedToday ? '1' : '0'
        );

        progressFill.style.width =
            completedToday ? '100%' : '0%';

    } catch (error) {
        console.error(
            '[Game Streak] Failed to load streak:',
            error
        );

        streakStatus.textContent =
            'Unable to load your streak right now.';
    }
}

/* ===== Initialize ===== */

function initializeAchievementSystem() {
    console.log('[Achievements] Initializing achievement system.');

    setupAchievementCelebration();
    loadAchievements();
}

if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        initializeAchievementSystem,
        { once: true }
    );
} else {
    initializeAchievementSystem();
}

/*======== Set up achievements celebration Ends ========*/
setupAchievementCelebration();
 loadAchievements();
 loadGames();
 loadBookmarks();
 getGamesPlayed();
})