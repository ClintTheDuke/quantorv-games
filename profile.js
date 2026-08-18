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
    loadBookmarks();
})