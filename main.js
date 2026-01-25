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
  
});
