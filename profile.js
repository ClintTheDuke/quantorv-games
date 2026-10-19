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

    loadBookmarks();
    getGamesPlayed();
})