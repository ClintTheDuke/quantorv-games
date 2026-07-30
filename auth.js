document.addEventListener("DOMContentLoaded",()=>{
    async function checkAuth() {
    const profileNav =
    document.getElementById("profileNav");
    const signinForm =
    document.getElementById("signinForm");

const signupForm =
    document.getElementById("signupForm");

window.profileName =
    document.getElementById("profileName");
 
   

        const {
            data, error
        } = await supaDb.auth.getSession();
        if (error) {
            console.log(error);
        }
        if (data.session) {
            // If user is already signed in and in signing page:
if(signinForm || signupForm){

    const params =
        new URLSearchParams(window.location.search);

    const redirectPage =
        params.get("redirect");

    const msg =
        document.getElementById("msg2")
        || document.getElementById("msg");

    if(msg){

        msg.textContent =
            "Already signed in. Redirecting...";

    }

    setTimeout(()=>{

        if(redirectPage){

            window.location.href =
                redirectPage;

        }else{

            window.location.href =
                "index.html";

        }

    },1500);

    return;

}

//====== End of Check if user is already signed in =======

        }
        if (!data.session) {
        // No logged in user, change of state
        if (logOut) {
            logOut.textContent = 'Login';
            logOut.addEventListener('click',()=>{
            window.location.href = "https://quantorv-games.com/signin.html?redirect="+rightPage
               })
        }
        if(profileNav){

    profileNav.onclick = ()=>{
    const rightPage = encodeURIComponent(window.location.href);
    window.location.href = "https://quantorv-games.com/signin.html?redirect="+rightPage

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