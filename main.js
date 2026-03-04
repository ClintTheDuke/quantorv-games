document.addEventListener("DOMContentLoaded", () => {

 const aosLeft = document.querySelectorAll('.aos-left');
 const aosSlideIn = document.querySelectorAll('.aos-slideIn');
 
 const currentYear = document.querySelector('#current-year');
 
 
 const scrolljs = new ScrollObserver(true); // initalize scrolljs
  scrolljs.observe(aosLeft, null, 'aos-left-active'); // observe elements with aos-left class name
  scrolljs.observe(aosSlideIn, null, 'aos-slideIn-active'); // observe elements with aos-SlideIn class name
  
  
  currentYear.textContent = new Date().getFullYear(); // automatic year updating
  
  
  document.querySelectorAll(".scroller").forEach((scroller) => {
    const clone = scroller.innerHTML;
    scroller.innerHTML += clone;
  }); // clone the html content of category section scrollers to give a continous scroll effect
  
  
  document.querySelectorAll('.accordion-header').forEach(button => {
   button.addEventListener('click', () => {
     const item = button.parentElement;
    item.classList.toggle('active');
   });
  }); // classList toggle logic for accordions
 
 
  document.querySelectorAll(".post-thumbnail img").forEach(img => {
    img.addEventListener("load", () => {
      img.style.opacity = "1";
      img.previousElementSibling.remove();
    });
  });

    // ===== Substack Newsletter Code ========
 

document
  .getElementById("newsletterForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("emailInput");
    const message = document.getElementById("newsletterMessage");

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


// ===== PROVIDER FUNCTION (THIS IS THE ONLY PART YOU EVER EDIT) =====

async function subscribeUser(email) {

  // CURRENT METHOD: Substack redirect
  const substackUrl =
    "https://quantorvgames.substack.com/subscribe?email=" +
    encodeURIComponent(email) +
    "&utm_source=website&utm_medium=newsletter_form";

  window.open(substackUrl, "_blank");

  return true;
}
  
  //=========== Json show start ===========

const track = document.getElementById("qv-carousel-track");
const btnNext = document.querySelector(".qv-btn-right");
const btnPrev = document.querySelector(".qv-btn-left");

let index = 0;
let visible = 3;
let total = 0;
let autoSlide;

/* ===== FETCH JSON ===== */
fetch("topics.json")
.then(res=>res.json())
.then(data=>{
    renderCards(data.slice(0,7)); // only first 7 posts
    setupCarousel();
    startAuto();
});

/* ===== RENDER CARDS ===== */
function renderCards(data){
    data.forEach(item=>{
        track.appendChild(createCard(item));
    });
}

/* ===== CREATE CARD ===== */
function createCard(item){
    const card = document.createElement("div");
    card.className="blog-post";

    card.innerHTML=`
        <div class="post-thumbnail">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
        </div>
        <h2>${item.title}</h2>
        <p>${item.excerpt}</p>
        <a href="${item.url}">Read More</a>
    `;
    return card;
}

/* ===== RESPONSIVE VISIBLE CARDS ===== */
function setVisible(){
    if(window.innerWidth <=600){ visible=1; }
    else if(window.innerWidth <=1024){ visible=2; }
    else{ visible=3; }
}

/* ===== SETUP LOOP ===== */
  /*function setupCarousel(){
    setVisible();
    const cards = Array.from(track.children);
    total = cards.length;

    // clone for infinite effect
    for(let i=0;i<visible;i++){
        track.appendChild(cards[i].cloneNode(true));
        track.insertBefore(cards[total-1-i].cloneNode(true), track.firstChild);
    }

    index=visible;
    updatePosition(false);
} */
function setupCarousel(){
    setVisible();
    const cards = Array.from(track.children);
    total = cards.length;

    // Clone first 'visible' cards at the end only
    for(let i=0; i<visible; i++){
        track.appendChild(cards[i].cloneNode(true));
    }

    index = 0; // start at first real card
    updatePosition(false);
}

function nextSlide(){
    index++;
    updatePosition(true);

    setTimeout(()=>{
        if(index >= total-2){ // reached duplicates
            index = 0;
            updatePosition(false); // jump back seamlessly
        }
    }, 500);
}



/* ===== UPDATE POSITION ===== */
function updatePosition(animate=true){
    const width = track.parentElement.clientWidth;
    const slideWidth = width / visible;
    track.style.transition = animate ? "transform 0.5s ease" : "none";
    track.style.transform = `translateX(-${index*slideWidth}px)`;
}

/* ===== NEXT / PREV ===== */
function nextSlide(){
    index++;
    updatePosition(true);
    setTimeout(()=>{
        if(index >= total+visible){ index=visible; updatePosition(false); }
    },500);
}
/* function prevSlide(){
    index--;
    updatePosition(true);
    setTimeout(()=>{
        if(index<visible){ index=total+visible-1; updatePosition(false); }
    },500);
} */
function prevSlide(){
    index--;
    updatePosition(true);

    setTimeout(()=>{
        if(index < 0){
            index = total - 1;
            updatePosition(false); // jump back seamlessly
        }
    }, 500);
}
/* ===== BUTTONS ===== */
btnNext.addEventListener("click", ()=>{
    nextSlide();
    resetAuto();
});
btnPrev.addEventListener("click", ()=>{
    prevSlide();
    resetAuto();
});

/* ===== AUTO SCROLL ===== */
function startAuto(){
    autoSlide=setInterval(nextSlide,3000);
}
function resetAuto(){
    clearInterval(autoSlide);
    startAuto();
}

/* ===== RESPONSIVE ===== */
window.addEventListener("resize", ()=>{
    setVisible();
    updatePosition(false);
});



//=========== Json show ends ===========
});
