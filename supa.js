document.addEventListener('DOMContentLoaded',()=>{
    // ======= Redirect proof Code =========
    const redirectParams = new URLSearchParams(window.location.search);
    const redirectPage = redirectParams.get('redirect');
    //===== Redirect Helper =======
    function eventOnRedirect(){
        if(redirectPage){
            window.location.href = redirectPage;
        }
        else{
            window.location.href = 'https://quantorv-games.com/index.html'
        }
    }

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
    msg.textContent = 'Account Created Successfully, redirecting....'
    setTimeout(()=>{
        eventOnRedirect();
    },1000)
    
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
        document.getElementById('profileGreeting').textContent = 'No logged in User'
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
    
    //======== Code for Archery Game Score Saving =========
    // Check for current logged in user >>>>
    async function saveArcheryScore(finalArcheryScore) {
        const {
            data:{user},
            error: gameUserError
        } = await supaDb.auth.getUser();
        
        if (gameUserError) {
            console.log('Archery Game Error', gameUserError)
            return 0;
        }
        
        if (!user) {
            console.log('no logged in user');
            return 0;
        }
        
        // access Games table >>>>>>
        const {
            data: archeryGame,
            error: archeryGameError
        } = await supaDb.from('Games').select('id').eq('slug','archery-game').single()
        if (archeryGameError) {
    console.error("Error accessing Archery game:", archeryGameError);
    return 0;
}
        // look for player record >>>>>
        const {
            data: stats,
            error: statsError
        } = await supaDb.from('PlayerStats').select("id, best_score, games_played")
        .eq("user_id", user.id)
        .eq("game_id", archeryGame.id)
        .maybeSingle();

    if (statsError) {
        console.error("Error checking player statistics:", statsError);
        return 0;
    }
    
            //typing archery History Record begin >>>>>>
                // Leaderboard period keys
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');

    // ISO week number
    const tempDate = new Date(Date.UTC(
        year,
        now.getUTCMonth(),
        now.getUTCDate()
    ));

    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);

    const weekYear = tempDate.getUTCFullYear();

    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const weekNumber = Math.ceil(
        (((tempDate - yearStart) / 86400000) + 1) / 7
    );

    const weeklyKey = `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
    const monthlyKey = `${year}-${month}`; 
    
        // Check current weekly best
    const { data: weeklyScore, error: weeklyCheckError } = await supaDb
        .from('GameScores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_id', archeryGame.id)
        .eq('period_type', 'weekly')
        .eq('period_key', weeklyKey)
        .maybeSingle();

    if (weeklyCheckError) {
        console.error("Error checking weekly leaderboard:", weeklyCheckError);
        return 0;
    }

    // Only save if this is a new weekly best
    if (!weeklyScore || finalArcheryScore > weeklyScore.score) {

        const { error: weeklyError } = await supaDb
            .from('GameScores')
            .upsert({
                user_id: user.id,
                game_id: archeryGame.id,
                period_type: 'weekly',
                period_key: weeklyKey,
                score: finalArcheryScore,
                updated_at: now.toISOString()
            }, {
                onConflict: 'user_id,game_id,period_type,period_key'
            });

        if (weeklyError) {
            console.error("Error updating weekly leaderboard:", weeklyError);
            return 0;
        }
    }
        // Check current monthly best >>>>>>>>>>>>>>
    const { data: monthlyScore, error: monthlyCheckError } = await supaDb
        .from('GameScores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_id', archeryGame.id)
        .eq('period_type', 'monthly')
        .eq('period_key', monthlyKey)
        .maybeSingle();

    if (monthlyCheckError) {
        console.error("Error checking monthly leaderboard:", monthlyCheckError);
        return 0;
    }

    // Only save if this is a new monthly best
    if (!monthlyScore || finalArcheryScore > monthlyScore.score) {

        const { error: monthlyError } = await supaDb
            .from('GameScores')
            .upsert({
                user_id: user.id,
                game_id: archeryGame.id,
                period_type: 'monthly',
                period_key: monthlyKey,
                score: finalArcheryScore,
                updated_at: now.toISOString()
            }, {
                onConflict: 'user_id,game_id,period_type,period_key'
            });

        if (monthlyError) {
            console.error("Error updating monthly leaderboard:", monthlyError);
            return 0;
        }
    }


    // if the player record no dey, create one >>>>>>
    if (!stats) {
        const{
            error: archeryRecordError
        } = await supaDb.from('PlayerStats').insert({
            user_id: user.id,
            game_id: archeryGame.id,
            best_score: finalArcheryScore,
                games_played: 1,
                last_played: new Date().toISOString()
            });
                      
       if (archeryRecordError) {
            console.error("Error creating player statistics:", archeryRecordError);
            return 0;
        }

        console.log("First Archery game recorded!");
        return;
        
    }
    
    // Existing record → update statistics

    const newBestScore = Math.max(
        stats.best_score,
        finalArcheryScore
    );

    const { error: updateError } = await supaDb
        .from("PlayerStats")
        .update({
            best_score: newBestScore,
            games_played: stats.games_played + 1,
            last_played: new Date().toISOString()
        })
        .eq("id", stats.id);

    if (updateError) {
        console.error("Error updating player statistics:", updateError);
        return 0;
    }

    console.log("Archery statistics updated!");
    
            // Check current all-time best
        // All-time best comes from PlayerStats >>>
    const allTimeBest = stats
        ? Math.max(stats.best_score, finalArcheryScore)
        : finalArcheryScore;

    const { error: allTimeError } = await supaDb
        .from('GameScores')
        .upsert({
            user_id: user.id,
            game_id: archeryGame.id,
            period_type: 'all_time',
            period_key: 'all_time',
            score: allTimeBest,
            updated_at: now.toISOString()
        }, {
            onConflict: 'user_id,game_id,period_type,period_key'
        });

    if (allTimeError) {
        console.error("Error updating all-time leaderboard:", allTimeError);
        return 0;
    }
            // Typing archery History Record end >>>>>>
    
        
       
    }
    // Save Archery Game Score Function Ends >>>>>>>>
    window.saveArcheryScore = saveArcheryScore;
    
    // Loading Archery Game Scores Function >>>>>>>>>
    async function loadArcheryScore(){
    // Get the user
    const {
        data: {user},
        error: archLoadError
    } = await supaDb.auth.getUser();
    
    if (archLoadError) {
        console.log('Archery Game User Log in Load Error', archLoadError)
        return 0;
    }
    if (!user) {
    return 0;
}
    // access the Games Table
    const {
        data: loadArcheryData,
        error: loadArcheryError
    } = await supaDb.from('Games').select('id').eq('slug','archery-game').single()
    if (loadArcheryError) {
        console.log("Error Accessing Games Table on Load Function", loadArcheryError);
        return 0;
    }
        // Access Player Records for Best Score
        
        const {
            data: archeryScoreData,
            error: archeryScoreError
        } = await supaDb.from('PlayerStats').select('best_score').eq('user_id',user.id).eq('game_id',loadArcheryData.id).maybeSingle();
        
       if (archeryScoreError) {
           console.error('Error Loading Scores', archeryScoreError)
           return 0;
       }
        if (!archeryScoreData) {
            return 0;
        }
        return archeryScoreData.best_score;
        
        //end of function 
    }
    window.loadArcheryScore = loadArcheryScore;

    // Archery leaderboard loading function >>>>>>>>
    async function loadArcheryLeaderboard() {
    const { data: { user }, error } = await supaDb.auth.getUser();
    console.log("Leaderboard script is running!");


console.log("User:", user);
console.log("User ID:", user?.id);
console.log("Error:", error);
    }
    loadArcheryLeaderboard();
})

