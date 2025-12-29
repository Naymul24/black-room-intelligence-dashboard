document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const authAlert = document.getElementById("authAlert");

  const togglePasswordBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  const openForgotPassword = document.getElementById("openForgotPassword");
  const forgotModal = document.getElementById("forgotModal");

  const forgotForm = document.getElementById("forgotForm");
  const resetBtn = document.getElementById("resetBtn");
  const resetAlert = document.getElementById("resetAlert");

  // Demo access
  const demoBtn = document.getElementById("demoBtn");
  const openDemoAccess = document.getElementById("openDemoAccess");

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */
  function showAlert(el, type, msg) {
    if (!el) return;
    el.style.display = "block";
    el.classList.remove("is-success", "is-error");
    if (type === "success") el.classList.add("is-success");
    if (type === "error") el.classList.add("is-error");
    el.textContent = msg;
  }

  function hideAlert(el) {
    if (!el) return;
    el.style.display = "none";
    el.textContent = "";
    el.classList.remove("is-success", "is-error");
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-open");
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
  }

  /* -------------------------------------------------------
     REAL LOGIN REQUEST (BACKEND CONNECTED)
  ------------------------------------------------------- */
  async function loginRequest(email, password, remember) {
    const res = await fetch("http://127.0.0.1:5050/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { ok: false, message: data.message || "Incorrect details. Please try again." };
    }

    // Store JWT (simple + industry standard for now)
    localStorage.setItem("bri_token", data.token);

    return {
      ok: true,
      redirect: "/dashboard/index.html"
    };
  }

  async function resetPasswordRequest(email) {
    // Not wired yet – placeholder stays
    return { ok: true, message: "If that email exists, a reset link has been sent." };
  }

  /* -------------------------------------------------------
     Demo mode
  ------------------------------------------------------- */
  function goToDemoMode() {
    localStorage.setItem("bri_demo_mode", "true");
    window.location.href = "/dashboard/index.html";
  }

  demoBtn?.addEventListener("click", goToDemoMode);
  openDemoAccess?.addEventListener("click", goToDemoMode);

  /* -------------------------------------------------------
     Password toggle
  ------------------------------------------------------- */
  togglePasswordBtn?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    const icon = togglePasswordBtn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    }
  });

  /* -------------------------------------------------------
     Login submit
  ------------------------------------------------------- */
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(authAlert);

    const email = (document.getElementById("email").value || "").trim();
    const password = passwordInput.value || "";
    const remember = document.getElementById("rememberMe").checked;

    if (!email || !password) {
      showAlert(authAlert, "error", "Please enter your email and password.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const res = await loginRequest(email, password, remember);

      if (!res.ok) {
        showAlert(authAlert, "error", res.message);
        return;
      }

      localStorage.removeItem("bri_demo_mode");
      window.location.href = res.redirect;

    } catch (err) {
      showAlert(authAlert, "error", "Something went wrong. Please try again.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  /* -------------------------------------------------------
     Forgot password modal
  ------------------------------------------------------- */
  openForgotPassword?.addEventListener("click", () => {
    hideAlert(resetAlert);
    openModal(forgotModal);
    const resetEmail = document.getElementById("resetEmail");
    if (resetEmail) setTimeout(() => resetEmail.focus(), 50);
  });

  document.querySelectorAll("[data-modal-close='forgot']").forEach((el) => {
    el.addEventListener("click", () => closeModal(forgotModal));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal(forgotModal);
  });

  /* -------------------------------------------------------
     Forgot password submit (still placeholder)
  ------------------------------------------------------- */
  forgotForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(resetAlert);

    const email = (document.getElementById("resetEmail").value || "").trim();
    if (!email) {
      showAlert(resetAlert, "error", "Please enter your work email.");
      return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = "Sending...";

    try {
      const res = await resetPasswordRequest(email);

      if (!res.ok) {
        showAlert(resetAlert, "error", res.message || "Failed to send reset link.");
        return;
      }

      showAlert(resetAlert, "success", res.message);
      document.getElementById("resetEmail").value = "";
    } catch {
      showAlert(resetAlert, "error", "Something went wrong. Please try again.");
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "Send reset link";
    }
  });
});
