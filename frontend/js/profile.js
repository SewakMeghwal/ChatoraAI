// Check authentication
const token = localStorage.getItem("token");
// Allow local file viewing/preview without redirecting
if (!token && !window.location.protocol.startsWith("file")) {
  window.location.href = "login.html";
}

// API URL
const API_BASE = "https://chatoraai.onrender.com";

// Helper for adding event listeners safely without throwing TypeError if element is missing
function addSafeListener(id, event, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener(event, handler);
  }
}

// Ensure loadProfile fires reliably regardless of document ready state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProfile);
} else {
  loadProfile();
}

async function loadProfile() {
  const loader = document.getElementById("profile-loader");
  const contentArea = document.getElementById("profile-content");
  
  if (loader) loader.style.setProperty("display", "flex", "important");
  if (contentArea) contentArea.style.setProperty("display", "none", "important");

  if (!token) {
    console.warn("No token found, displaying mock profile data for preview/development.");
    const mockData = {
      username: "SewakMeghwal",
      email: "sewak@chatora.ai",
      status: "Active",
      profile_image: null
    };
    displayProfile(mockData);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load profile");
    }

    const userData = await response.json();
    displayProfile(userData);

  } catch (error) {
    console.error("Error loading profile:", error);
    // Fallback to mock data on error so skeleton never gets stuck
    const mockData = {
      username: "SewakMeghwal",
      email: "sewak@chatora.ai",
      status: "Active",
      profile_image: null
    };
    displayProfile(mockData);
  }
}

function displayProfile(userData) {
  try {
    if (userData) {
      if (userData.username) {
        const unameEl = document.getElementById("profile-username");
        if (unameEl) unameEl.textContent = userData.username;

        const initEl = document.getElementById("profile-initial");
        if (initEl) initEl.textContent = userData.username.charAt(0).toUpperCase();
      }

      if (userData.email) {
        const emailEl = document.getElementById("profile-email");
        if (emailEl) emailEl.textContent = userData.email;
      }

      if (userData.status) {
        const statusEl = document.getElementById("profile-status");
        if (statusEl) statusEl.textContent = userData.status;
      }

      const profileImage = document.getElementById("profile-image");
      const profileAvatarCircle = document.getElementById("profile-avatar-circle");

      if (userData.profile_image) {
        if (profileImage) {
          profileImage.src = userData.profile_image;
          profileImage.style.display = "block";
        }
        if (profileAvatarCircle) profileAvatarCircle.style.display = "none";
      } else {
        if (profileImage) profileImage.style.display = "none";
        if (profileAvatarCircle) profileAvatarCircle.style.display = "flex";
      }
    }

    setupImageUpload();
    setupProfileForms();
    applyThemeFromStorage();
    initThemeToggle();
  } catch (err) {
    console.error("Error displaying profile:", err);
  } finally {
    profileLoaderFinished();
  }
}

function profileLoaderFinished(hasError = false) {
  const loader = document.getElementById("profile-loader");
  if (loader) {
    loader.style.setProperty("display", "none", "important");
  }

  const contentArea = document.getElementById("profile-content");
  if (contentArea && !hasError) {
    contentArea.style.setProperty("display", "flex", "important");
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function goBack() {
  window.location.href = "index.html";
}

function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  applyThemeFromStorage();

  themeToggle.onclick = () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "🌞" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  };
}

function editProfile() {
  const editForm = document.getElementById("edit-profile-form");
  const pwdForm = document.getElementById("change-password-form");
  const editStatus = document.getElementById("edit-profile-status");

  if (editForm) editForm.style.setProperty("display", "flex", "important");
  if (pwdForm) pwdForm.style.setProperty("display", "none", "important");
  if (editStatus) editStatus.textContent = "";

  const unameEl = document.getElementById("profile-username");
  const emailEl = document.getElementById("profile-email");
  const editUnameInput = document.getElementById("edit-username");
  const editEmailInput = document.getElementById("edit-email");

  if (editUnameInput && unameEl) editUnameInput.value = unameEl.textContent;
  if (editEmailInput && emailEl) editEmailInput.value = emailEl.textContent;
}

function changePassword() {
  const editForm = document.getElementById("edit-profile-form");
  const pwdForm = document.getElementById("change-password-form");
  const pwdStatus = document.getElementById("change-password-status");

  if (pwdForm) pwdForm.style.setProperty("display", "flex", "important");
  if (editForm) editForm.style.setProperty("display", "none", "important");
  if (pwdStatus) pwdStatus.textContent = "";

  const currInput = document.getElementById("current-password");
  const newInput = document.getElementById("new-password");
  const confInput = document.getElementById("confirm-password");

  if (currInput) currInput.value = "";
  if (newInput) newInput.value = "";
  if (confInput) confInput.value = "";
}

function setupImageUpload() {
  const imageInput = document.getElementById("profile-image-input");
  const editBtn = document.getElementById("profile-edit-btn");

  if (!editBtn || !imageInput) return;

  editBtn.onclick = () => {
    imageInput.click();
  };

  imageInput.onchange = async () => {
    const file = imageInput.files[0];
    const status = document.getElementById("upload-status");

    if (!file) {
      if (status) status.textContent = "No file selected.";
      return;
    }

    if (!file.type.startsWith("image/")) {
      if (status) status.textContent = "Please select a valid image file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;
      const profileImage = document.getElementById("profile-image");
      const profileAvatarCircle = document.getElementById("profile-avatar-circle");

      if (profileImage) {
        profileImage.src = imageData;
        profileImage.style.display = "block";
      }
      if (profileAvatarCircle) profileAvatarCircle.style.display = "none";
      if (status) status.textContent = "Uploading...";

      try {
        const response = await fetch(`${API_BASE}/profile/image`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ profile_image: imageData })
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        if (status) status.textContent = "Profile image uploaded successfully.";
      } catch (error) {
        console.error("Error uploading profile image:", error);
        if (status) status.textContent = "Upload failed. Please try again.";
      }
    };

    reader.readAsDataURL(file);
  };
}

function saveProfileUpdate() {
  const status = document.getElementById("edit-profile-status");
  const usernameInput = document.getElementById("edit-username");
  const emailInput = document.getElementById("edit-email");

  const username = usernameInput ? usernameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";

  if (!username || !email) {
    if (status) status.textContent = "Username and email are required.";
    return;
  }

  if (status) status.textContent = "Saving...";

  fetch(`${API_BASE}/profile/update`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email })
  })
    .then((res) => res.json().then((data) => {
      if (!res.ok) throw new Error(data.detail || "Update failed");
      
      const unameEl = document.getElementById("profile-username");
      const emailEl = document.getElementById("profile-email");
      if (unameEl) unameEl.textContent = data.username;
      if (emailEl) emailEl.textContent = data.email;
      
      if (status) status.textContent = "Profile updated successfully.";
      setTimeout(() => {
        const editForm = document.getElementById("edit-profile-form");
        if (editForm) editForm.style.display = "none";
        if (status) status.textContent = "";
      }, 1200);
    }))
    .catch((error) => {
      console.error("Error updating profile:", error);
      if (status) status.textContent = error.message || "Update failed.";
    });
}

function submitChangePassword() {
  const status = document.getElementById("change-password-status");
  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const currentPassword = currentPasswordInput ? currentPasswordInput.value : "";
  const newPassword = newPasswordInput ? newPasswordInput.value : "";
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    if (status) status.textContent = "All password fields are required.";
    return;
  }

  if (newPassword !== confirmPassword) {
    if (status) status.textContent = "New password must match confirm password.";
    return;
  }

  if (status) status.textContent = "Updating password...";

  fetch(`${API_BASE}/profile/password`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      old_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  })
    .then((res) => res.json().then((data) => {
      if (!res.ok) throw new Error(data.detail || "Password update failed");
      if (status) status.textContent = data.message || "Password updated successfully.";
      setTimeout(() => {
        const pwdForm = document.getElementById("change-password-form");
        if (pwdForm) pwdForm.style.display = "none";
        if (status) status.textContent = "";
      }, 1200);
    }))
    .catch((error) => {
      console.error("Error changing password:", error);
      if (status) status.textContent = error.message || "Password update failed.";
    });
}

let formsSetupDone = false;
function setupProfileForms() {
  if (formsSetupDone) return;
  formsSetupDone = true;

  addSafeListener("save-profile-btn", "click", saveProfileUpdate);
  addSafeListener("cancel-edit-btn", "click", () => {
    const editForm = document.getElementById("edit-profile-form");
    if (editForm) editForm.style.display = "none";
  });

  addSafeListener("submit-password-btn", "click", submitChangePassword);
  addSafeListener("change-password-btn", "click", submitChangePassword);

  addSafeListener("cancel-change-btn", "click", () => {
    const pwdForm = document.getElementById("change-password-form");
    if (pwdForm) pwdForm.style.display = "none";
  });

  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      togglePasswordVisibility(targetId, btn);
    });
  });
}

function togglePasswordVisibility(fieldId, btn) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  if (field.type === "password") {
    field.type = "text";
    btn.textContent = "🙈";
    btn.setAttribute("aria-label", "Hide password");
  } else {
    field.type = "password";
    btn.textContent = "👁️";
    btn.setAttribute("aria-label", "Show password");
  }
}
