document.addEventListener('DOMContentLoaded',()=>{
    

// ====== Sign Up Code Starts  =======
const signupForm = document.getElementById("signupForm");
//code:
const projectKey = 'sb_publishable_g17RMOUGD14_QnxuIbC6NA_Yz3NwOMF';
    const projectUrl = 'https://gerrwnwfllynvaahgxur.supabase.co';
    window.supaDb = window.supabase.createClient(projectUrl, projectKey)
const msg = document.getElementById("msg");

if (signupForm) {
    

signupForm.addEventListener("submit", async (e)=>{

    e.preventDefault();

    msg.textContent = "signing up.... Please wait a moment";

    const signupUsername = document
        .getElementById("signupUsername")
        .value
        .trim();

    const signupEmail = document
        .getElementById("signupEmail")
        .value
        .trim();

    const signupPassword = document
        .getElementById("signupPassword")
        .value;

    const usernamePattern = /^[A-Za-z0-9]{5,12}$/;

    if(!usernamePattern.test(signupUsername)){

        msg.textContent =
        "Username must be 3-9 letters and numbers only.";

        return;

    
     if (signupPassword.length < 8) {
    msg.textContent = "Password must be at least 8 characters.";
    return;
}
    
    msg.textContent = "Creating your account... please wait";
    }
    // ====== Authentication account creation =======
    const {
        data: authData,
        error: authError
    } =
     await supaDb.auth.signUp({
        email: signupEmail, 
        password: signupPassword
    })
    if(authError){
        msg.textContent = authError.message;
        return
    }
    // ====== Authentication account creation Ends =======
    // ======= Profiles Database Creation ========
    const {
        data: profileData,
        error: profileError
    } = await supaDb.from('Profiles').insert({
        user_id: authData.user.id,
        email: signupEmail, 
        username: signupUsername
    })
    if (profileError) {
        msg.textContent = profileError.message
        return
    }
    document.getElementById('profileGreeting').textContent='Hello ' + signupUsername;
    msg.textContent = 'Account Created Successfully'
    
    })
   } 
// ======= Profiles Database Creation Ends ========
//======= Sign Up Code Ends ========


// ======= Sign in Code Starts=======
const signinForm = document.getElementById('signinForm');
if (signinForm) {
    

signinForm.addEventListener('submit', async(p)=>{
      p.preventDefault();
      msg2.textContent = 'Signing You In'
      const signinUsername = document.getElementById('signinUsername').value.trim();
      const signinPassword = document.getElementById('signinPassword').value;
      
      const {
    data,
    error
} = await supaDb
.from("Profiles")
.select("email").eq('username',signinUsername).single();

      if (error) {
          msg2.textContent = error.message;
          return;
      }
      
      const entryEmail = data.email;
      
      const {
          data: entryData,
          error: entryError
      } 
      = await supaDb.auth.signInWithPassword({
          email: entryEmail,
          password: signinPassword
      })
      if (entryError) {
          msg2.textContent = entryError.message;
          return;
      }
      document.getElementById('profileGreeting').textContent='Welcome back ' + signinUsername;
      msg2.textContent =
"Welcome back!";
})

}
//====== Sign in Code Ends =========
// ======= log out code starts ========
window.logOut = document.getElementById('logoutBtn');
if(logOut) {
    logOut.addEventListener('click', async ()=>{
        const { error: logOutError} = await supaDb.auth.signOut();
        if (logOutError) {
            console.log(logOutError.message);
            return;
        }
        window.location.href = 'signin.html'
    })
}
// ======= log out code starts ========


const showSignin = document.getElementById("showSignin");
const showSignup = document.getElementById("showSignup");
if (showSignin) {
    

showSignin.onclick = ()=>{

    signupForm.classList.remove("active");
    signinForm.classList.add("active");

}
}

if (showSignup) {
    
showSignup.onclick = ()=>{

    signinForm.classList.remove("active");
    signupForm.classList.add("active");

}

}
    
    

})

