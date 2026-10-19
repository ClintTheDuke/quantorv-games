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
            //====== Safe redirect function =======
        
function safeRedirect(destination, fallback = "/index.html") {
    try {
        const target = new URL(
            destination || fallback,
            window.location.origin
        );

        // Reject external destinations and unsupported protocols.
        if (
            target.origin !== window.location.origin ||
            !["http:", "https:"].includes(target.protocol)
        ) {
            window.location.href = fallback;
            return;
        }

        // Navigate using only the validated local destination.
        window.location.href =
            target.pathname + target.search + target.hash;

    } catch {
        window.location.href = fallback;
    }
}   
        //====== Check if user is already signed in =======
        console.log("Current session:", data.session);
console.log("Sign-in form found:", !!signinForm);
console.log("Sign-up form found:", !!signupForm);
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

            safeRedirect(redirectPage);

        }else{

            safeRedirect("index.html");

        }

    },1500);

    return;

}

  //====== End of Check if user is already signed in =======

        }
        
if (!data.session) {

    function goToSignin(event) {
    event.preventDefault();

    const signinUrl = new URL(
        "/signin.html",
        window.location.origin
    );

    signinUrl.searchParams.set(
        "redirect",
        window.location.href
    );

    window.location.href = signinUrl.href;
}

    if (logOut) {
        logOut.textContent = "Login";
        logOut.addEventListener("click", goToSignin);
    }

    if (profileNav) {
        profileNav.onclick = goToSignin;
    }

    if(profileName){

    profileName.textContent =
        "Login";
         console.log('guest');

}


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

        safeRedirect("../profile.html");

    };

}
    if (profileName) {
        profileName.textContent = profileData.username
    }
    const profAvatar = document.getElementById("profAvatar");

if (profAvatar && profileData.username) {
    profAvatar.textContent = profileData.username.slice(0, 2).toUpperCase();
}
    
   }
   supaDb.auth.onAuthStateChange((event,session)=>{
       console.log(event);
       checkAuth();
   })
})