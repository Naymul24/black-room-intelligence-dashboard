document.addEventListener("DOMContentLoaded", () => {
    const ctaButtons = document.querySelectorAll("[data-open-tab]");
  
    ctaButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-open-tab");
        if (!targetId) return;
  
        const navLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if (navLink) navLink.click();
      });
    });
  });
  