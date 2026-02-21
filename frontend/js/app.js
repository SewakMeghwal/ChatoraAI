
// === Backend API URL ===
const API_URL = "https://chatoraai.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const voiceBtn = document.getElementById("voice-btn");
const themeToggle = document.getElementById("theme-toggle");
const profileBtn = document.getElementById("profile-btn");
const dropdown = document.getElementById("profile-dropdown");
const logoutBtn = document.getElementById("logout-btn");


let selectedVoice = null;
let isSpeaking = false;
let allChats = [];
let currentChat = [];

let voices = [];

function getVoice(isHindi) {
  if (isHindi) {
    return voices.find(v => v.lang.includes("hi"));
  }

  // ⭐ English female priority list
  return (
    voices.find(v =>
      v.lang.includes("en") &&
      (
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("susan") ||
        v.name.toLowerCase().includes("aria") ||
        v.name.toLowerCase().includes("natasha")
      )
    )
    ||
    voices.find(v => v.lang.includes("en")) // fallback
  );
}

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function speakMessage(message) {
  window.speechSynthesis.cancel();

  // ✅ Clean markdown / html / code
  let cleanText = message
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\*\*|__|~~|\*/g, "")
    .replace(/\n/g, " ");

  const isHindi = /[\u0900-\u097F]/.test(cleanText);

  let voice;

  if (isHindi) {
    voice = voices.find(v => v.lang.includes("hi"));
  } else {
    voice =
      voices.find(v =>
        v.lang.includes("en") &&
        (
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("aria") ||
          v.name.toLowerCase().includes("jenny") ||
          v.name.toLowerCase().includes("natasha") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("woman")
        )
      ) ||
      voices.find(v => v.lang.includes("en"));
  }

  // ⭐ Split long text safely
  const chunks = cleanText.match(/.{1,180}(\s|$)/g);

  let index = 0;

  function speakChunk() {
    if (!chunks || index >= chunks.length) {
      isSpeaking = false;
      voiceBtn.textContent = "🎤";
      return;
    }

    const speech = new SpeechSynthesisUtterance(chunks[index]);
    speech.lang = isHindi ? "hi-IN" : "en-IN";
    if (voice) speech.voice = voice;

    speech.rate = 1;
    speech.pitch = 1.1;

    speech.onstart = () => {
      isSpeaking = true;
      voiceBtn.textContent = "⏹";
    };

    speech.onend = () => {
      index++;
      speakChunk();
    };

    window.speechSynthesis.speak(speech);
  }

  speakChunk();
}
function appendMessage(sender, message) {
  const msg = document.createElement("div");

  if (sender === "You🙋") {
    msg.classList.add("user-msg");
    msg.textContent = `You🙋: ${message}`;
  } else {
    msg.classList.add("bot-msg");

    // Modern SVG Copy Icon
    const copyIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="18" height="18" 
           viewBox="0 0 24 24" 
           fill="none" 
           stroke="currentColor" 
           stroke-width="2" 
           stroke-linecap="round" 
           stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;

    const parsed = marked.parse(message);

    msg.innerHTML = `
      <div class="bot-header">
        <span>Bot🤖:</span>
        <button class="copy-all-btn">${copyIcon}</button>
      </div>
      <div class="bot-content">${parsed}</div>
    `;

    msg.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });

    // Copy All
    // const copyAllBtn = msg.querySelector(".copy-all-btn");
    // copyAllBtn.addEventListener("click", () => {
    //   navigator.clipboard.writeText(message);
    //   copyAllBtn.classList.add("copy-success");
    //   showToast();

    //   setTimeout(() => {
    //     copyAllBtn.classList.remove("copy-success");
    //   }, 800);
    // });
    // Copy All (Premium Version)
    const copyAllBtn = msg.querySelector(".copy-all-btn");

    copyAllBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(message).then(() => {

        copyAllBtn.classList.add("copy-success");
        showToast();

        const originalHTML = copyAllBtn.innerHTML;

        // Show check icon + text
        copyAllBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

        setTimeout(() => {
          copyAllBtn.classList.remove("copy-success");
          copyAllBtn.innerHTML = originalHTML;
        }, 1200);
      });
    });

    // Copy for each code block
    msg.querySelectorAll("pre").forEach((block) => {
      const copyBtn = document.createElement("button");
      copyBtn.classList.add("copy-code-btn");
      copyBtn.innerHTML = copyIcon;

      block.style.position = "relative";
      block.appendChild(copyBtn);

      copyBtn.addEventListener("click", () => {
        const code = block.querySelector("code").innerText;

        navigator.clipboard.writeText(code).then(() => {
          copyBtn.classList.add("copy-success");
          showToast();

          // Temporary check icon
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="18" height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;

          setTimeout(() => {
            copyBtn.classList.remove("copy-success");
            copyBtn.innerHTML = copyIcon;
          }, 1000);
        });
      });
    });
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  currentChat.push({ sender, message });
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You🙋", message);
  // chatHistory.push(message);
  // updateHistory();
  userInput.value = "";
  showTyping();

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Failed to fetch response");

    const data = await response.json();
    const reply = data.reply;

    removeTyping();
    appendMessage("Bot🤖", reply);
    speakMessage(reply);
  } catch (error) {
    appendMessage("bot", "⚠️ Error connecting to server.");
    console.error("Error:", error);
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

emojiBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
});

document.addEventListener("click", (e) => {
  if (
    !emojiPicker.contains(e.target) &&
    e.target !== emojiBtn &&
    emojiPicker.style.display === "block"
  ) {
    emojiPicker.style.display = "none";
  }
});

emojiPicker.addEventListener("emoji-click", (event) => {
  userInput.value += event.detail.unicode;
});

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

voiceBtn.addEventListener("click", () => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    voiceBtn.textContent = "🎤";
  } else {
    recognition.start();
  }
});
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  userInput.value = transcript;
  sendMessage();
};

function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  themeToggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
}

function initThemeToggle() {
  applyThemeFromStorage();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "🌞" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

initThemeToggle();

// === Mixamo 3D Avatar ===
const avatarContainer = document.getElementById("avatar-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  avatarContainer.clientWidth / avatarContainer.clientHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(avatarContainer.clientWidth, avatarContainer.clientHeight);
avatarContainer.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const loader = new THREE.GLTFLoader();
loader.load(
  "assets/barbie_deluxe_style_doll.glb", // use correct model path
  (gltf) => {
    const model = gltf.scene;

    // Reduce the size
    model.scale.set(0.8, 0.8, 0.8);

    // Center the model
    model.position.set(0, -1.2, 0);

    scene.add(model);

    // Move camera back so the model fits perfectly
    camera.position.z = 4;

    // Animate rotation
    function animate() {
      requestAnimationFrame(animate);
      model.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  },
  undefined,
  (error) => console.error("Error loading avatar model:", error)
);


// const clock = new THREE.Clock();
// function animate() {
//   requestAnimationFrame(animate);
//   const delta = clock.getDelta();
//   if (mixer) mixer.update(delta);
//   renderer.render(scene, camera);
// }
function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-msg");
  typingDiv.id = "typing-indicator";
  typingDiv.innerHTML = `
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}
function updateHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  allChats.slice().reverse().forEach((chat, index) => {
    const item = document.createElement("div");
    item.classList.add("history-item");

    const firstMsg = chat[0]?.message || "New Chat";
    item.textContent = firstMsg.substring(0, 25) + "...";

    item.onclick = () => loadChat(chat);

    historyList.appendChild(item);
  });
}
function loadChat(chat) {
  chatBox.innerHTML = "";
  currentChat = chat;

  chat.forEach(m => {
    appendMessage(m.sender, m.message);
  });
}

const newChatBtn = document.getElementById("new-chat-btn");

newChatBtn.onclick = () => {
  if (currentChat.length) {
    allChats.push(currentChat);
  }

  currentChat = [];
  chatBox.innerHTML = "";
  updateHistory();
};
window.addEventListener("beforeunload", () => {
  if (currentChat.length) allChats.push(currentChat);
  localStorage.setItem("allChats", JSON.stringify(allChats));
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem("allChats");
  if (saved) {
    allChats = JSON.parse(saved);
    updateHistory();
  }
});

window.addEventListener("resize", () => {
  const width = avatarContainer.clientWidth;
  const height = avatarContainer.clientHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Toggle dropdown
profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
document.addEventListener("click", () => {
  dropdown.style.display = "none";
});

// View profile
const viewProfileBtn = document.getElementById("view-profile-btn");
viewProfileBtn.addEventListener("click", () => {
  window.location.href = "profile.html";
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    localStorage.removeItem("token");
    window.location.href = "login.html";

  } catch (err) {
    console.error("Logout error:", err);
  }
});
