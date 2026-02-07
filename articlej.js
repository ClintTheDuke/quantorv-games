document.addEventListener("DOMContentLoaded",()=>{
const preloader = document.getElementById('loading-screen');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 200); 
    
// === Current Year Updating ===
const currentYear = document.querySelector('#current-year');
currentYear.textContent = new Date().getFullYear(); // automatic year updating
  
//Table of Contents
const toc = document.getElementById('toc');
        const headings = document.querySelectorAll('h2.toc-item');

        // Create a list for the TOC
        const list = document.createElement('ul');

        headings.forEach((heading, index) => {
            // Create a unique ID for each heading
            const id = `heading-${index}`;
            heading.id = id; // Set the ID for the heading

            // Create a list item for the TOC
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${id}`; // Link to the heading
            link.textContent = heading.textContent; // Use the heading text

            listItem.appendChild(link);
            list.appendChild(listItem);
        });

        toc.appendChild(list); // Append the list to the TOC
        
/*Blurry loaded Image Effect */
const blurryDivs = document.querySelectorAll(".blurry")
        blurryDivs.forEach(div => {
            const img = div.querySelector("img")

            function loaded(){
                div.classList.add("imageloaded")
            }
            if (img.complete){
                loaded();
            }
            else{
                img.addEventListener("load",loaded)
            }
        })
        
    /* header fades on scroll */
    const header = document.getElementById('header')
    window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});
 /* menu toggle */
 let isMenuVisible = false;
 $("main, footer").on("click",()=>{
     
     if(isMenuVisible){
  $("nav").slideUp(500)
  $(".menu-btn").trigger("click")
  
  isMenuVisible = false;
  }
 })
 $(".menu-btn").on("click",()=>{
   
 if(isMenuVisible){
   $("nav").slideUp(500)
   $("article, footer, main").css("opacity", "1")
   $("article, footer, main").css("transition", ".5s")
 
   isMenuVisible = false;
 }
 else{
   $("nav").slideDown(500)
   $("article, footer, main").css("opacity", "0.3")
   $("article, footer, main").css("transition", ".5s")
   isMenuVisible = true;
 }
 })  
 
 
 // Get the menu button element
    
const menuBtn = document.getElementById('menu-btn');

// Add an event listener to the menu button
menuBtn.addEventListener('click', () => {
  // Toggle the 'clicked' class on the menu button
  menuBtn.classList.toggle('clicked');
});
//copycode command
const codeSnippets = document.querySelectorAll('.code-snippet');
const copyButtons = document.querySelectorAll('.copy-btn');

// Add an event listener to each copy button
copyButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    
    const codeSnippet = codeSnippets[index];

    const textarea = document.createElement('textarea');
    textarea.value = codeSnippet.textContent;

    
    document.body.appendChild(textarea);
    textarea.select();

   
    navigator.clipboard.writeText(textarea.value).then(() => {
      
      swal('Code copied to clipboard!');
    }).catch((error) => {
      console.error('Error copying text:', error);
    });

 
    document.body.removeChild(textarea);
  });
});

 // ===== Substack Newsletter Code ========
   // Newsletter handler - main logic (NEVER needs to change)

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

quicklink.listen({
    timeout:2000
});



})
