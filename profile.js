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

        // function End 
    }
    loadBookmarks();
})