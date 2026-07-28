const API_BASE = "https://chatoraai.onrender.com";

function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
  input.setAttribute('type', type);
  const button = input.parentElement.querySelector('.toggle-password');
  button.textContent = type === 'password' ? '👁️' : '🙈';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      togglePassword(targetId);
    });
  });
});

async function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!username || !email || !password) {
    showToast("Please fill in all signup fields.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      showToast("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
      return;
    }

    showToast(data.detail || "Signup failed. Please try again.", "error");
  } catch (error) {
    showToast("Unable to connect to the server. Please try again.", "error");
  }
}

async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showToast("Please enter your email and password.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      localStorage.setItem("token", data.access_token);
      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
      return;
    }

    showToast(data.detail || "Invalid email or password.", "error");
  } catch (error) {
    showToast("Login failed. Please check your connection and try again.", "error");
  }
}
