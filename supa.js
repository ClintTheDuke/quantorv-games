const projectKey = 'sb_publishable_g17RMOUGD14_QnxuIbC6NA_Yz3NwOMF';
    const projectUrl = 'https://gerrwnwfllynvaahgxur.supabase.co';

   
    window.supaDb = window.supabase.createClient(projectUrl, projectKey)

document.addEventListener('DOMContentLoaded',()=>{
    // ======= Redirect proof Code =========
    const redirectParams = new URLSearchParams(window.location.search);
    const redirectPage = redirectParams.get('redirect');
    //===== Redirect Helper =======
    
async function eventOnRedirect() {
    const fallback = "/index.html";

    if (!redirectPage) {
        window.location.href = fallback;
        return;
    }

    let url;

    try {
        url = new URL(redirectPage, window.location.origin);
    } catch {
        window.location.href = fallback;
        return;
    }

    // Reject destinations outside the current origin.
    if (url.origin !== window.location.origin) {
        window.location.href = fallback;
        return;
    }

    try {
        const response = await fetch(url.href, {
            method: "HEAD",
            redirect: "error"
        });

        if (response.ok) {
            window.location.href = url.href;
        } else {
            window.location.href = fallback;
        }
    } catch {
        window.location.href = fallback;
    }
}
// redirect helper ends here >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ====== Cloudflare Turnstile Callbacks ======

let turnstileToken = "";

window.onTurnstileSuccess = function (token) {
    turnstileToken = token;
};

window.onTurnstileExpired = function () {
    turnstileToken = "";
};

window.onTurnstileError = function () {
    turnstileToken = "";

    const msg = document.getElementById("msg") || document.getElementById("msg2");

    if (msg) {
        msg.textContent =
            "CAPTCHA failed to load. Please try again.";
    }
};
// ====== Sign Up Code Starts  =======
const signupForm = document.getElementById("signupForm");
//code for project key init was here:

const msg = document.getElementById("msg") || document.getElementById("msg2");

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

        const signupPasswordConfirm = document
    .getElementById("signupPasswordConfirm")
    .value;

    const termsCheckbox =
    document.getElementById("termsCheckbox");

    const usernamePattern = /^[A-Za-z0-9]{5,12}$/;

if (!usernamePattern.test(signupUsername)) {

    msg.textContent =
    "Username must be 5-12 letters and numbers only.";

    return;
}


// ====== Password Validation ======

const hasUppercase = /[A-Z]/.test(signupPassword);
const hasLowercase = /[a-z]/.test(signupPassword);
const hasNumber = /[0-9]/.test(signupPassword);
const hasSpecial = /[^A-Za-z0-9]/.test(signupPassword);
if (signupPassword.length < 8) {
    msg.textContent =
    "Password must be at least 8 characters.";

    return;
}

if (!hasUppercase) {
    msg.textContent =
    "Password must contain at least one uppercase letter.";

    return;
}

if (!hasLowercase) {
    msg.textContent =
    "Password must contain at least one lowercase letter.";

    return;
}

if (!hasNumber) {
    msg.textContent =
    "Password must contain at least one number.";

    return;
}

if (!hasSpecial) {
    msg.textContent =
    "Password must contain at least one special character.";

    return;
}
// ====== Password confirmation ======
if (signupPassword !== signupPasswordConfirm) {
    msg.textContent =
    "Passwords do not match.";

    return;
}
//========= checking if terms is accepted =============
if (!termsCheckbox.checked) {

    termsCheckbox
        .closest(".terms-check")
        .classList.add("invalid");

    msg.textContent =
    "Please agree to the Terms & Conditions and Privacy Policy.";

    return;
}

termsCheckbox
    .closest(".terms-check")
    .classList.remove("invalid");

msg.textContent = "Creating your account... please wait";


    // Ensure the user has completed Turnstile.
    if (!turnstileToken) {
        msg.textContent = "Please complete the CAPTCHA first.";
        return;
    }

    msg.textContent = "Verifying CAPTCHA and creating your account...";

    const token = turnstileToken;
    let authData;

    try {
        const { data, error } = await supaDb.functions.invoke(
            "signup-with-turnstile",
            {
                body: {
                    username: signupUsername,
                    email: signupEmail,
                    password: signupPassword,
                    token: token
                }
            }
        );

        // The token is single-use, so clear it after the request.
        turnstileToken = "";

        if (window.turnstile) {
            window.turnstile.reset();
        }

         // Handle errors from the Edge Function. The function below parses the error response
        //from the JSON returned by the Edge Function,
       // which may include a specific error message.

if (error) {
    console.error("Sign-up function error:", error);

    let errorMessage = "Sign-up failed. Please try again.";

    if (error.context instanceof Response) {
        const status = error.context.status;
        let responseData = {};

        try {
            responseData = await error.context.clone().json();
        } catch (parseError) {
            console.warn("Could not parse error response:", parseError);
        }

        console.error("HTTP status:", status);
        console.error("Edge Function response:", responseData);

        // Use the specific message returned by your Edge Function.
        if (responseData.error) {
            errorMessage = responseData.error;
        } else {
            switch (status) {
                case 400:
                    errorMessage =
                        "Please check your details and CAPTCHA, then try again.";
                    break;

                case 403:
                    errorMessage =
                        "Your request was blocked. Please refresh the page and try again.";
                    break;

                case 409:
                    errorMessage =
                        "This username or email may already be registered. Check your details or try signing in.";
                    break;

                case 503:
                    errorMessage =
                        "Sign-up verification is temporarily unavailable. Please try again shortly.";
                    break;

                default:
                    errorMessage =
                        "We couldn't create your account. Please try again shortly.";
            }
        }
    }

    msg.textContent = errorMessage;
    return;
}
//Error handling ends here >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// If the function returns successfully, it should provide the auth data.
        authData = data;

        if (!authData || !authData.user?.id) {
            // The function currently returns the raw Supabase
            // Auth response, which normally contains user.id.
            // This also supports a wrapped { user: ... } response.
            if (authData?.id) {
                authData = { user: authData };
            } else {
                msg.textContent =
                    authData?.error ||
                    "Account creation failed. Please try again.";
                return;
            }
        }

        // Restore the Supabase client session when signup returns one.
        // This matters because the Profiles insert uses your RLS policy.
        if (data?.access_token && data?.refresh_token) {
            const { error: sessionError } =
                await supaDb.auth.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token
                });

            if (sessionError) {
                console.error("Session setup error:", sessionError);
                msg.textContent =
                    "Account created, but sign-in could not be completed.";
                return;
            }
        }

    } catch (error) {
        turnstileToken = "";

        if (window.turnstile) {
            window.turnstile.reset();
        }

        console.error("Sign-up request failed:", error);
        msg.textContent =
            "Unable to complete sign-up. Check your connection and try again.";
        return;
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
    msg.textContent = 'Account Created Successfully, redirecting....'
    setTimeout(()=>{
        eventOnRedirect();
    },1000)
    
    })
   } 
   // ====== Live Password Requirements ======

const signupPasswordInput =
    document.getElementById("signupPassword");

if (signupPasswordInput) {

    signupPasswordInput.addEventListener("input", () => {

        const password = signupPasswordInput.value;

        const requirements = {
            reqLength: password.length >= 8,
            reqUppercase: /[A-Z]/.test(password),
            reqLowercase: /[a-z]/.test(password),
            reqNumber: /[0-9]/.test(password),
            reqSpecial: /[^A-Za-z0-9]/.test(password)
        };

        Object.entries(requirements).forEach(
            ([id, passed]) => {

                const requirement =
                    document.getElementById(id);

                if (!requirement) return;

                requirement.classList.toggle(
                    "valid",
                    passed
                );

                const indicator =
                    requirement.querySelector("span");

                if (indicator) {
                    indicator.textContent =
                        passed ? "✓" : "○";
                }
            }
        );
    });
}

// ====== Live Password Confirmation ======

const signupPasswordConfirm =
    document.getElementById("signupPasswordConfirm");

const passwordMatch =
    document.getElementById("passwordMatch");

if (signupPasswordInput && signupPasswordConfirm && passwordMatch) {

    signupPasswordConfirm.addEventListener("input", () => {

        const password = signupPasswordInput.value;
        const confirmPassword = signupPasswordConfirm.value;

        if (confirmPassword === "") {
            passwordMatch.textContent = "";
            passwordMatch.classList.remove("valid", "invalid");
            return;
        }

        if (password === confirmPassword) {

            passwordMatch.textContent = "✓ Passwords match";
            passwordMatch.classList.add("valid");
            passwordMatch.classList.remove("invalid");

        } else {

            passwordMatch.textContent = "✗ Passwords do not match";
            passwordMatch.classList.add("invalid");
            passwordMatch.classList.remove("valid");
        }
    });
}
// ======= Profiles Database Creation Ends ========
//======= Sign Up Code Ends ========


// ======= Sign in Code Starts=======
const signinForm = document.getElementById('signinForm');
// password toggle button code>>>>>>>>>>
document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.disabled = false;

    button.addEventListener("click", () => {
        const passwordInput = document.getElementById(
            button.dataset.passwordToggle
        );

        if (!passwordInput) return;

        const showingPassword = passwordInput.type === "password";

        passwordInput.type = showingPassword ? "text" : "password";

        button.setAttribute("aria-label", showingPassword ? "Hide password" : "Show password");
        button.setAttribute("aria-pressed", String(showingPassword));
    });
});
if (signinForm) {
    

signinForm.addEventListener('submit', async(p)=>{
      p.preventDefault();
      msg2.textContent = 'Signing You In'
      const signinUsername = document.getElementById('signinUsername').value.trim();
      const signinPassword = document.getElementById('signinPassword').value;
      
const { data: signinData, error: signinError } =
    await supaDb.functions.invoke("signin-with-username", {
        body: {
            username: signinUsername,
            password: signinPassword
        }
    });

if (signinError) {
    console.error("Sign-in function error:", signinError);
    msg2.textContent = "Unable to sign in. Please check your details and try again.";
    return;
}

if (!signinData?.access_token || !signinData?.refresh_token) {
    msg2.textContent = "Sign-in failed. Please try again.";
    return;
}

const { error: sessionError } = await supaDb.auth.setSession({
    access_token: signinData.access_token,
    refresh_token: signinData.refresh_token
});

if (sessionError) {
    console.error("Session setup error:", sessionError);
    msg2.textContent = "Sign-in succeeded, but your session could not be established.";
    return;
}

      document.getElementById('profileGreeting').textContent='Welcome back ' + signinUsername;
      msg2.textContent =
"Welcome back!";
setTimeout(()=>{
        eventOnRedirect();
    },1000)
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
        window.location.reload();
        document.getElementById('profileGreeting').textContent = 'No logged in User'
        window.location.href = 'signin.html'
    })
}
// ======= log out code ends ========


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
    
    //====== archery score saving and leaderboard fn used to be here.

    
})

