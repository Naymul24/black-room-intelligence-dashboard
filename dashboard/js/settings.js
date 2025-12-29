document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------------------
     Elements
  ------------------------------------------------------- */
  const fullNameInput = document.getElementById("settingsFullName");
  const emailInput = document.getElementById("settingsEmail");

  const editNameBtn = document.getElementById("editNameBtn");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const cancelNameBtn = document.getElementById("cancelNameBtn");
  const profileNotice = document.getElementById("profileNotice");

  const changePasswordForm = document.getElementById("changePasswordForm");
  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordNotice = document.getElementById("passwordNotice");
  const matchHint = document.getElementById("matchHint");
  const clearPasswordBtn = document.getElementById("clearPasswordBtn");

  const API_BASE = "http://127.0.0.1:5050";
  const token = localStorage.getItem("bri_token");

  /* -------------------------------------------------------
     Backend connected functions
  ------------------------------------------------------- */
  async function fetchProfile() {
    const res = await fetch(`${API_BASE}/api/account/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load profile.");
    }
    return data.user;
  }

  async function updateNameOnBackend(newName) {
    const res = await fetch(`${API_BASE}/api/account/name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ full_name: newName })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { ok: false, message: data.message || "Failed to update name." };
    }
    return { ok: true, message: data.message || "Name updated successfully." };
  }

  async function updatePasswordOnBackend(oldPass, newPass) {
    const res = await fetch(`${API_BASE}/api/account/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ old_password: oldPass, new_password: newPass })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { ok: false, message: data.message || "Failed to update password." };
    }
    return { ok: true, message: data.message || "Password updated successfully." };
  }

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */
  function showNotice(el, type, msg) {
    if (!el) return;
    el.style.display = "block";
    el.classList.remove("is-success", "is-error");
    if (type === "success") el.classList.add("is-success");
    if (type === "error") el.classList.add("is-error");
    el.textContent = msg;
  }

  function hideNotice(el) {
    if (!el) return;
    el.style.display = "none";
    el.textContent = "";
    el.classList.remove("is-success", "is-error");
  }

  function basicPasswordPolicy(pass) {
    const minLen = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    return minLen && hasNumber && hasSymbol;
  }

  function setEditMode(on) {
    fullNameInput.disabled = !on;
    saveNameBtn.disabled = !on;

    if (on) {
      cancelNameBtn.style.display = "inline-flex";
      fullNameInput.focus();
      fullNameInput.setSelectionRange(fullNameInput.value.length, fullNameInput.value.length);
    } else {
      cancelNameBtn.style.display = "none";
    }
  }

  /* -------------------------------------------------------
     Load profile into UI (name + email)
  ------------------------------------------------------- */
  async function loadProfile() {
    if (!token) return; // dashboard auth guard already handles redirect

    try {
      const user = await fetchProfile();
      fullNameInput.value = user.full_name || "";
      emailInput.value = user.email || "";
    } catch (err) {
      // If token is invalid, kick to login
      localStorage.removeItem("bri_token");
      window.location.href = "/account/login/index.html";
    }
  }

  loadProfile();

  /* -------------------------------------------------------
     Profile edit
  ------------------------------------------------------- */
  let originalName = fullNameInput.value;

  editNameBtn?.addEventListener("click", () => {
    hideNotice(profileNotice);
    originalName = fullNameInput.value;
    setEditMode(true);
  });

  cancelNameBtn?.addEventListener("click", () => {
    fullNameInput.value = originalName;
    hideNotice(profileNotice);
    setEditMode(false);
  });

  saveNameBtn?.addEventListener("click", async () => {
    hideNotice(profileNotice);

    const newName = (fullNameInput.value || "").trim();
    if (newName.length < 2) {
      showNotice(profileNotice, "error", "Please enter a valid name.");
      return;
    }

    saveNameBtn.disabled = true;
    saveNameBtn.textContent = "Saving...";

    try {
      const res = await updateNameOnBackend(newName);
      if (!res.ok) {
        showNotice(profileNotice, "error", res.message || "Failed to update name.");
        fullNameInput.value = originalName;
        return;
      }

      originalName = newName;
      showNotice(profileNotice, "success", res.message || "Name updated successfully.");
      setEditMode(false);
    } catch {
      showNotice(profileNotice, "error", "Something went wrong. Please try again.");
      fullNameInput.value = originalName;
    } finally {
      saveNameBtn.disabled = false;
      saveNameBtn.textContent = "Save changes";
    }
  });

  /* -------------------------------------------------------
     Password UX: match hint + show/hide toggles
  ------------------------------------------------------- */
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

  newPassword?.addEventListener("input", updateMatchHint);
  confirmPassword?.addEventListener("input", updateMatchHint);

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-toggle");
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });

  /* -------------------------------------------------------
     Password submit
  ------------------------------------------------------- */
  changePasswordForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideNotice(passwordNotice);

    const oldPass = oldPassword.value || "";
    const newPass = newPassword.value || "";
    const confirmPass = confirmPassword.value || "";

    if (!oldPass || !newPass || !confirmPass) {
      showNotice(passwordNotice, "error", "Please complete all fields.");
      return;
    }

    if (newPass !== confirmPass) {
      showNotice(passwordNotice, "error", "Passwords do not match.");
      return;
    }

    if (!basicPasswordPolicy(newPass)) {
      showNotice(passwordNotice, "error", "Password must be 8+ chars and include a number + symbol.");
      return;
    }

    const btn = document.getElementById("updatePasswordBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Updating...";
    }

    try {
      const res = await updatePasswordOnBackend(oldPass, newPass);
      if (!res.ok) {
        showNotice(passwordNotice, "error", res.message || "Failed to update password.");
        return;
      }

      showNotice(passwordNotice, "success", res.message || "Password updated successfully.");
      oldPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      updateMatchHint();
    } catch {
      showNotice(passwordNotice, "error", "Something went wrong. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Update password";
      }
    }
  });

  clearPasswordBtn?.addEventListener("click", () => {
    hideNotice(passwordNotice);
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    updateMatchHint();
  });

  emailInput.disabled = true;
});
