// Check authentication
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// API URL
const API_BASE = "https://chatoraai.onrender.com";

// Load user profile on page load
document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
  document.getElementById("profile-loader").style.display = "block";
  const contentArea = document.getElementById("profile-content");
  contentArea.style.display = "none";

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

    // Update profile information
    document.getElementById("profile-username").textContent = userData.username;
    document.getElementById("profile-email").textContent = userData.email;
    document.getElementById("profile-created").textContent = formatDate(userData.created_at);
    document.getElementById("profile-initial").textContent = userData.username.charAt(0).toUpperCase();

    const profileImage = document.getElementById("profile-image");
    if (userData.profile_image) {
      profileImage.src = userData.profile_image;
      document.getElementById("profile-avatar-circle").style.display = "none";
    } else {
      profileImage.src = "assets/default-avatar.png";
      document.getElementById("profile-avatar-circle").style.display = "flex";
    }

    setupImageUpload();
    setupProfileForms();
    applyThemeFromStorage();
    initThemeToggle();
    profileLoaderFinished();

  } catch (error) {
    console.error("Error loading profile:", error);
    document.getElementById("profile-username").textContent = "Error loading";
    document.getElementById("profile-email").textContent = "Error loading";
    document.getElementById("profile-created").textContent = "Error loading";

    profileLoaderFinished(true);
  }
}

function profileLoaderFinished(hasError = false) {
  document.getElementById("profile-loader").style.display = "none";
  const contentArea = document.getElementById("profile-content");
  if (!hasError) {
    contentArea.style.display = "block";
  }
}

function formatDate(dateString) {
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

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "🌞" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

function editProfile() {
  document.getElementById("edit-profile-form").style.display = "block";
  document.getElementById("change-password-form").style.display = "none";
  document.getElementById("edit-profile-status").textContent = "";

  document.getElementById("edit-username").value = document.getElementById("profile-username").textContent;
  document.getElementById("edit-email").value = document.getElementById("profile-email").textContent;
}

function changePassword() {
  document.getElementById("change-password-form").style.display = "block";
  document.getElementById("edit-profile-form").style.display = "none";
  document.getElementById("change-password-status").textContent = "";

  document.getElementById("current-password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";
}

function setupImageUpload() {
  const imageInput = document.getElementById("profile-image-input");
  const editBtn = document.getElementById("profile-edit-btn");

  editBtn.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    const status = document.getElementById("upload-status");

    if (!file) {
      status.textContent = "No file selected.";
      return;
    }

    if (!file.type.startsWith("image/")) {
      status.textContent = "Please select a valid image file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;
      document.getElementById("profile-image").src = imageData;
      document.getElementById("profile-avatar-circle").style.display = "none";
      status.textContent = "Uploading...";

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

        status.textContent = "Profile image uploaded successfully.";
      } catch (error) {
        console.error("Error uploading profile image:", error);
        status.textContent = "Upload failed. Please try again.";
      }
    };

    reader.readAsDataURL(file);
  });
}

function saveProfileUpdate() {
  const status = document.getElementById("edit-profile-status");
  const username = document.getElementById("edit-username").value.trim();
  const email = document.getElementById("edit-email").value.trim();

  if (!username || !email) {
    status.textContent = "Username and email are required.";
    return;
  }

  status.textContent = "Saving...";

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
      document.getElementById("profile-username").textContent = data.username;
      document.getElementById("profile-email").textContent = data.email;
      status.textContent = "Profile updated successfully.";
      setTimeout(() => {
        document.getElementById("edit-profile-form").style.display = "none";
        status.textContent = "";
      }, 1200);
    }))
    .catch((error) => {
      console.error("Error updating profile:", error);
      status.textContent = error.message || "Update failed.";
    });
}

function submitChangePassword() {
  const status = document.getElementById("change-password-status");
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    status.textContent = "All password fields are required.";
    return;
  }

  if (newPassword !== confirmPassword) {
    status.textContent = "New password must match confirm password.";
    return;
  }

  status.textContent = "Updating password...";

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
      status.textContent = data.message || "Password updated successfully.";
      setTimeout(() => {
        document.getElementById("change-password-form").style.display = "none";
        status.textContent = "";
      }, 1200);
    }))
    .catch((error) => {
      console.error("Error changing password:", error);
      status.textContent = error.message || "Password update failed.";
    });
}

function setupProfileForms() {
  document.getElementById("save-profile-btn").addEventListener("click", saveProfileUpdate);
  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("edit-profile-form").style.display = "none";
  });

  document.getElementById("change-password-btn").addEventListener("click", submitChangePassword);
  document.getElementById("cancel-change-btn").addEventListener("click", () => {
    document.getElementById("change-password-form").style.display = "none";
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
