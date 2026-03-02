document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     PRELOADER
  =============================== */
  const preloader = document.getElementById('loading-screen');
  if (preloader) {
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 200);
  }

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

  /* ===============================
     QUICKLINK SAFE INIT
  =============================== */
  if (typeof quicklink !== "undefined") {
    quicklink.listen({ timeout: 2000 });
  }

});