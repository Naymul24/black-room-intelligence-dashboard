document.addEventListener("DOMContentLoaded", async () => {
  /* =======================================================
     AUTH CHECK (FIRST THING THAT RUNS)
  ======================================================= */
  const token = localStorage.getItem("bri_token");
  const demoMode = localStorage.getItem("bri_demo_mode") === "true";

  if (!token && !demoMode) {
    window.location.href = "/account/login/index.html";
    return;
  }

  if (token) {
    try {
      const res = await fetch("http://127.0.0.1:5050/api/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        localStorage.removeItem("bri_token");
        window.location.href = "/account/login/index.html";
        return;
      }

      const data = await res.json();
      console.log("Logged in user:", data.user);
    } catch (err) {
      localStorage.removeItem("bri_token");
      window.location.href = "/account/login/index.html";
      return;
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */
  const logoutLink = document.querySelector(".dropdown-item--logout");
  logoutLink?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("bri_token");
    localStorage.removeItem("bri_demo_mode");
    window.location.href = "/account/login/index.html";
  });

  /* =======================================================
     Sidebar Toggle
  ======================================================= */
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");

      const icon = toggleBtn.querySelector("i");
      if (!icon) return;

      if (sidebar.classList.contains("collapsed")) {
        icon.classList.remove("fa-arrow-left");
        icon.classList.add("fa-arrow-right");
        toggleBtn.setAttribute("aria-label", "Expand sidebar");
      } else {
        icon.classList.remove("fa-arrow-right");
        icon.classList.add("fa-arrow-left");
        toggleBtn.setAttribute("aria-label", "Collapse sidebar");
      }
    });
  }

  /* =======================================================
     Profile Dropdown
  ======================================================= */
  const profileBtn = document.querySelector(".profile-btn");
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileContainer = document.querySelector(".profile-container");

  const closeProfileDropdown = () => {
    if (!profileDropdown) return;
    profileDropdown.classList.remove("is-open");
  };

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!profileContainer) return;
      if (!profileContainer.contains(e.target)) closeProfileDropdown();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeProfileDropdown();
    });
  }

  /* =======================================================
     Tab Switching
  ======================================================= */
  const navLinks = document.querySelectorAll(".nav-link[data-target]");
  const contentSections = document.querySelectorAll(".content-section");

  function showSection(targetId) {
    contentSections.forEach((section) => {
      section.style.display = "none";
    });

    const activeSection = document.getElementById(targetId);
    if (activeSection) activeSection.style.display = "block";

    navLinks.forEach((link) => link.classList.remove("is-active"));
    const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if (activeLink) activeLink.classList.add("is-active");

    closeProfileDropdown();
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");
      if (targetId) showSection(targetId);
    });
  });

  /* =======================================================
     Default Load (THIS IS THE BIT YOU LOST)
  ======================================================= */
  showSection("dashboard-content");
});
