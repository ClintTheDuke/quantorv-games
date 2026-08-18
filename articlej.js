document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     PRELOADER
  =============================== */
  /* const preloader = document.getElementById('loading-screen');
  if (preloader) {
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 200);
  } */
/* ======={Gaming Banner} ==========*/
/*  
const banner = document.querySelector(".game-banner");

let scrollTimer;


window.addEventListener("scroll", () => {

    // Hide banner while scrolling
    banner.classList.add("hide");


    // Clear previous timer
    clearTimeout(scrollTimer);


    // Show again after scrolling stops
    scrollTimer = setTimeout(() => {

        banner.classList.remove("hide");

    }, 200);


}); */
// ===== Redirect to home page on Click >>>>>>> (Temporary)
const bannerHome = document.getElementsByClassName('banner-item')[0];
if (bannerHome) {
    bannerHome.addEventListener('click',()=>{
        window.location.href = 'https://quantorv-games.com/'
    })
}
else{
    console.log('no home banner')
}
// ===== Redirect to home page on Click End >>>> (Temporary)
//======= Toasting >>>>>>
function showToast(message){

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


//======= Creating Bookmarks >>>>>>>>>> 
const bookmarkNav = document.getElementById('bookmarkNav');
const bookmarkIcon = document.getElementById('bookmarkIcon');
let isPageBookmarked = false;

//========= Update Bookmark Icon
function updateBookmarkUi(){
    const bsvgElem = bookmarkIcon.querySelector('use');
    if (isPageBookmarked) {
        bsvgElem.setAttribute('href','../assets/banner.svg#bookmark-filled')
    }
    else{
        bsvgElem.setAttribute('href','../assets/banner.svg#bookmark')
    }
    
}

// ======= Checking Bookmarks Status
async function checkBookmarkStatus() {
    const {
        data:{user},
        error:bmsError
    } = await supaDb.auth.getUser();
    if (bmsError) {
        console.log('Bookmark Status Error', bmsError);
        return 0;
    }
    if (!user) {
        console.log('No logged In User');
        return 0;
    }
    
    const pageUrl = window.location.pathname;
    
    const {
        data:bmTableData,
        error:bmTableError
    } = await supaDb.from('Bookmarks').select('id').eq('user_id',user.id).eq('page_url',pageUrl).maybeSingle();
    
    if (bmTableError) {
        console.log('Error Fetching Bookmarks Data', bmTableError);
        return 0;
      
    }
    if (bmTableData) {
        isPageBookmarked = true;
    }
    else{
        isPageBookmarked = false;
    }
    updateBookmarkUi();
}
// ======= if user Clicks Bookmark button 
if (bookmarkNav && bookmarkIcon) {
    bookmarkNav.addEventListener('click', async function (){
        const{
            data: {user},
            error: ucbError
        } = await supaDb.auth.getUser();
        if (ucbError) {
            console.log('Error in User Click Bookmark Event', ucbError)
            return 0;
        }
        if (!user) {
            console.log('user clicked but isn\'t logged in');
            return 0;
        }
        
        const pageUrl = window.location.pathname;
        const pageTitle = document.title;
// ==== if page is bookmarked remove page from bookmarks 
  
        if (isPageBookmarked) {
            const {
                error: unBookError
            } = await supaDb.from('Bookmarks').delete().eq('user_id',user.id).eq('page_url', pageUrl)
            
            if (unBookError) {
                console.log('Error Removing Bookmarks', unBookError)
                return 0;
            }
            
            console.log('page removed from bookmarks');
             isPageBookmarked = false;
             showToast('Removed from bookmarks, refresh..')
        updateBookmarkUi();
        return 0;
        }
        
// if page isn't bookmarked, add page to bookmarks 
       const {
           data: addBookData,
           error: addBookError
       } = await supaDb.from('Bookmarks')
                .insert({

                    user_id: user.id,

                    page_url: pageUrl,

                    page_title: pageTitle

                })
                .select('id')
                .single();
                
                if (addBookError) {

                console.error(
                    'Error saving bookmark:',
                    addBookError
                );

                return;
            }


            console.log(
                'Bookmark saved successfully:',
               addBookData
            );
            


            isPageBookmarked = true;
            showToast('Added to Bookmarks, refresh.....')
            updateBookmarkUi();

        
        
    })
}

if (bookmarkNav && bookmarkIcon) {

    checkBookmarkStatus();

}
//======= Creating Bookmarks Ends >>>>>>>>>>
  /* ===============================
     CURRENT YEAR
  =============================== */
  const currentYear = document.querySelector('#current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* ===============================
     TABLE OF CONTENTS
  =============================== */
  const toc = document.getElementById('toc');
  const headings = document.querySelectorAll('h2.toc-item');

  if (toc && headings.length > 0) {
    const list = document.createElement('ul');

    headings.forEach((heading, index) => {
      if (!heading) return;

      const id = `heading-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = heading.textContent || `Section ${index + 1}`;

      li.appendChild(link);
      list.appendChild(li);
    });

    toc.appendChild(list);
  }

  /* ===============================
     BLURRY IMAGE EFFECT
  =============================== */
  const blurryDivs = document.querySelectorAll(".blurry");

  if (blurryDivs.length > 0) {
    blurryDivs.forEach(div => {
      const img = div.querySelector("img");
      if (!img) return;

      function loaded() {
        div.classList.add("imageloaded");
      }

      if (img.complete) {
        loaded();
      } else {
        img.addEventListener("load", loaded);
      }
    });
  }

  /* ===============================
     HEADER SCROLL EFFECT
  =============================== */
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  /* ===============================
     MENU TOGGLE (jQuery Safe)
  =============================== */
  if (typeof $ !== "undefined" && $(".menu-btn").length > 0) {

    let isMenuVisible = false;

    $("main, footer").on("click", () => {
      if (isMenuVisible) {
        $("nav").slideUp(500);
        $(".menu-btn").trigger("click");
        isMenuVisible = false;
      }
    });

    $(".menu-btn").on("click", () => {
      if (isMenuVisible) {
        $("nav").slideUp(500);
        $("article, footer, main").css({ opacity: "1", transition: ".5s" });
        isMenuVisible = false;
      } else {
        $("nav").slideDown(500);
        $("article, footer, main").css({ opacity: "0.3", transition: ".5s" });
        isMenuVisible = true;
      }
    });
  }

  /* ===============================
     MENU BUTTON ANIMATION
  =============================== */
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('clicked');
    });
  }

  /* ===============================
     COPY CODE FUNCTIONALITY
  =============================== */
  const codeSnippets = document.querySelectorAll('.code-snippet');
  const copyButtons = document.querySelectorAll('.copy-btn');

  if (codeSnippets.length > 0 && copyButtons.length > 0) {
    copyButtons.forEach((button, index) => {

      if (!codeSnippets[index]) return;

      button.addEventListener('click', () => {

        const textarea = document.createElement('textarea');
        textarea.value = codeSnippets[index].textContent;

        document.body.appendChild(textarea);
        textarea.select();

        navigator.clipboard.writeText(textarea.value)
          .then(() => {
            if (typeof swal !== "undefined") {
              swal('Code copied to clipboard!');
            } else {
              alert("Code copied to clipboard!");
            }
          })
          .catch(err => console.error('Copy error:', err));

        document.body.removeChild(textarea);
      });
    });
  }

  /* ===============================
     NEWSLETTER (SAFE)
  =============================== */
  const newsletterForm = document.getElementById("newsletterForm");

  if (newsletterForm) {

    newsletterForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("emailInput");
      const message = document.getElementById("newsletterMessage");

      if (!emailInput || !message) return;

      const email = emailInput.value.trim();
      if (!email) return;

      message.style.display = "block";
      message.textContent = "Processing...";

      try {
        await subscribeUser(email);

        message.textContent =
          "Almost done! Check your inbox to confirm your subscription.";

        emailInput.value = "";

      } catch (err) {
        console.error(err);
        message.textContent =
          "Something went wrong. Please try again later.";
      }
    });

  }

  async function subscribeUser(email) {

    const substackUrl =
      "https://quantorvgames.substack.com/subscribe?email=" +
      encodeURIComponent(email) +
      "&utm_source=website&utm_medium=newsletter_form";

    window.open(substackUrl, "_blank");
    return true;
  }
  
  //======= Date and Time ======
  function formatDate(dateString) {
  const postDate = new Date(dateString);
  const now = new Date();

  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  //Just Now 
  if (diffMins < 1) {
      return `Just Now`
  }
  // Under 1 hour
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }

  // Under 24 hours
  /*
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }*/
  // at 1 hour
  if (diffHours  === 1) {
    return `${diffHours} hr ago`;
  }
  if (diffHours < 24) {
      return`${diffHours} hrs ago`
  }
  

  // Full date after 24 hours
  return postDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

const articleDate = document.querySelector('.article-date');

if (articleDate) {
  const date = articleDate.dataset.date;
  articleDate.textContent = formatDate(date);
}

  /* ===============================
     QUICKLINK SAFE INIT
  =============================== */
  if (typeof quicklink !== "undefined") {
    quicklink.listen({ timeout: 2000 });
  }
  
  /*======= Glightbox ======== */
  if (document.querySelector('.glightbox')) {
  const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: false,
    zoomable: true,
    autoplayVideos: true
  });
}



// ======= Share button code =======
const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
    shareBtn.addEventListener("click", async () => {

    const shareData = {
        title: document.title,
        text: "Check out this article",
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch(err) {
            console.log("Share cancelled");
        }
    } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('copied')
    }

});
}


});
