document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetPasswordForm");
    const resetAlert = document.getElementById("resetAlert");
    const submitResetBtn = document.getElementById("submitResetBtn");
  
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const matchHint = document.getElementById("matchHint");
  
    /* -------------------------------------------------------
       Helpers
    ------------------------------------------------------- */
    function showAlert(type, msg) {
      resetAlert.style.display = "block";
      resetAlert.classList.remove("is-success", "is-error");
      if (type === "success") resetAlert.classList.add("is-success");
      if (type === "error") resetAlert.classList.add("is-error");
      resetAlert.textContent = msg;
    }
  
    function hideAlert() {
      resetAlert.style.display = "none";
      resetAlert.textContent = "";
      resetAlert.classList.remove("is-success", "is-error");
    }
  
    function basicPasswordPolicy(pass) {
      const minLen = pass.length >= 8;
      const hasNumber = /\d/.test(pass);
      const hasSymbol = /[^A-Za-z0-9]/.test(pass);
      return minLen && hasNumber && hasSymbol;
    }
  
    function getTokenFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get("token"); // reset link will be /password-reset/?token=XYZ
    }
  
    function updateMatchHint() {
      const np = newPassword.value || "";
      const cp = confirmPassword.value || "";
  
      if (!np && !cp) {
        matchHint.style.display = "none";
        matchHint.textContent = "";
        matchHint.classList.remove("is-good", "is-bad");
        return;
      }
  
      matchHint.style.display = "block";
      matchHint.classList.remove("is-good", "is-bad");
  
      if (np === cp) {
        matchHint.textContent = "Passwords match.";
        matchHint.classList.add("is-good");
      } else {
        matchHint.textContent = "Passwords do not match.";
        matchHint.classList.add("is-bad");
      }
    }
  
    newPassword.addEventListener("input", updateMatchHint);
    confirmPassword.addEventListener("input", updateMatchHint);
  
    /* -------------------------------------------------------
       Show/hide toggles
    ------------------------------------------------------- */
    document.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-toggle");
        const input = document.getElementById(targetId);
        if (!input) return;
  
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
  
        const icon = btn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-eye");
          icon.classList.toggle("fa-eye-slash");
        }
      });
    });
  
    /* -------------------------------------------------------
       Backend-ready placeholder
    ------------------------------------------------------- */
    async function resetPasswordRequest(token, newPass) {
      // TODO: POST /api/auth/reset-password  { token, new_password: newPass }
      // return { ok:true, message:"Password updated" } OR { ok:false, message:"Token invalid/expired" }
  
      // Demo:
      if (!token) return { ok: false, message: "Reset link is missing or invalid." };
      return { ok: true, message: "Password reset successful. You can now log in." };
    }
  
    /* -------------------------------------------------------
       Validate token exists (frontend)
    ------------------------------------------------------- */
    const token = getTokenFromURL();
    if (!token) {
      showAlert("error", "Reset token missing. Please request a new password reset link.");
    }
  
    /* -------------------------------------------------------
       Submit
    ------------------------------------------------------- */
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
  
      const token = getTokenFromURL();
      const np = newPassword.value || "";
      const cp = confirmPassword.value || "";
  
      if (!token) {
        showAlert("error", "Reset token missing. Please request a new link.");
        return;
      }
  
      if (!np || !cp) {
        showAlert("error", "Please complete both password fields.");
        return;
      }
  
      if (np !== cp) {
        showAlert("error", "Passwords do not match.");
        return;
      }
  
      if (!basicPasswordPolicy(np)) {
        showAlert("error", "Password must be 8+ chars and include a number + symbol.");
        return;
      }
  
      submitResetBtn.disabled = true;
      submitResetBtn.textContent = "Resetting...";
  
      try {
        const res = await resetPasswordRequest(token, np);
        if (!res.ok) {
          showAlert("error", res.message || "Failed to reset password.");
          return;
        }
  
        showAlert("success", res.message || "Password reset successful.");
        newPassword.value = "";
        confirmPassword.value = "";
        updateMatchHint();
  
        // Optional auto-redirect after success
        setTimeout(() => {
          window.location.href = "../login/index.html";
        }, 1400);
      } catch {
        showAlert("error", "Something went wrong. Please try again.");
      } finally {
        submitResetBtn.disabled = false;
        submitResetBtn.textContent = "Reset password";
      }
    });
  });
  