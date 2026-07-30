document.addEventListener("DOMContentLoaded",()=>{
    async function checkAuth() {
    const profileNav =
    document.getElementById("profileNav");

window.profileName =
    document.getElementById("profileName");
 
   

        const {
            data, error
        } = await supaDb.auth.getSession();
        if (error) {
            console.log(error);
        }
        if (!data.session) {
        // No logged in user, change of state
        
        if(profileNav){

    profileNav.onclick = ()=>{
    const rightPage = encodeURIComponent(window.location.href);
    window.location.href = "signin.html?redirect="+rightPage

    };

}


if(profileName){

    profileName.textContent =
        "Login";

}
            console.log('guest');
            return;
           
        }
        
            console.log('logged in')
        
    
    
    const userId = data.session.user.id;
    const {
        data: profileData,
        error: profileError
    } = await supaDb.from('Profiles').select('username').eq('user_id',userId).single();
    if (profileError) {
        console.log(profileError.message);
        return;
    }
   
    if(profileNav){

    profileNav.onclick = ()=>{

        window.location.href =
            "../profile.html";

    };

}
    if (profileName) {
        profileName.textContent = profileData.username
    }
    
   }
   supaDb.auth.onAuthStateChange((event,session)=>{
       console.log(event);
       checkAuth();
   })
})