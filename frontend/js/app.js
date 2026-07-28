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
    ) ||
    voices.find(v => v.lang.includes("en"))
  );
}

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function speakMessage(message) {
  window.speechSynthesis.cancel();

  // Clean markdown / html / code
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

  const chunks = cleanText.match(/.{1,180}(\s|$)/g);
  let index = 0;

  function speakChunk() {
    if (!chunks || index >= chunks.length) {
      isSpeaking = false;
      targetMouthOpenY = 0;
      targetMouthWidthX = 1.0;
      if (voiceBtn) voiceBtn.textContent = "🎤";
      return;
    }

    const speech = new SpeechSynthesisUtterance(chunks[index]);
    speech.lang = isHindi ? "hi-IN" : "en-IN";
    if (voice) speech.voice = voice;

    speech.rate = 1;
    speech.pitch = 1.1;

    speech.onstart = () => {
      isSpeaking = true;
      triggerNextViseme();
      if (voiceBtn) voiceBtn.textContent = "⏹";
    };

    speech.onboundary = () => {
      triggerNextViseme();
    };

    speech.onend = () => {
      index++;
      if (!chunks || index >= chunks.length) {
        isSpeaking = false;
        targetMouthOpenY = 0;
        targetMouthWidthX = 1.0;
        if (voiceBtn) voiceBtn.textContent = "🎤";
      } else {
        speakChunk();
      }
    };

    speech.onerror = () => {
      isSpeaking = false;
      targetMouthOpenY = 0;
      targetMouthWidthX = 1.0;
      if (voiceBtn) voiceBtn.textContent = "🎤";
    };

    window.speechSynthesis.speak(speech);
  }

  speakChunk();
}

function appendMessage(sender, message) {
  const msg = document.createElement("div");

  if (sender === "You🙋" || sender.toLowerCase().includes("you")) {
    msg.classList.add("user-msg");
    msg.innerHTML = `
      <div class="user-header"><span>You 👤</span></div>
      <div class="user-msg-content">${message}</div>
    `;
  } else {
    msg.classList.add("bot-msg");

    const copyIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="16" height="16" 
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
        <span>Chatora AI 🤖</span>
        <button class="copy-all-btn" title="Copy response">${copyIcon} <span>Copy</span></button>
      </div>
      <div class="bot-content">${parsed}</div>
    `;

    msg.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });

    const copyAllBtn = msg.querySelector(".copy-all-btn");
    copyAllBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(message).then(() => {
        copyAllBtn.classList.add("copy-success");
        showToast("Copied to clipboard! ✨");

        const originalHTML = copyAllBtn.innerHTML;
        copyAllBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg"
              width="14" height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

        setTimeout(() => {
          copyAllBtn.classList.remove("copy-success");
          copyAllBtn.innerHTML = originalHTML;
        }, 1200);
      });
    });

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
          showToast("Code block copied! 💻");

          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="18" height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3">
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
    
    // Feature 1: Emotion Sentiment Classifier
    analyzeResponseEmotion(reply);

    // Feature 2: Interactive 3D Projection Canvas Trigger
    check3DProjections(message, reply);

    speakMessage(reply);
  } catch (error) {
    removeTyping();
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

// Feature 3: Hands-Free Voice Commands Processor
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.trim().toLowerCase();

  if (transcript.includes("switch to dark mode") || transcript.includes("dark mode")) {
    document.body.classList.remove("light");
    localStorage.setItem("theme", "dark");
    if (themeToggle) themeToggle.textContent = "🌙";
    showToast("Switched to Dark Mode 🌙");
    return;
  }

  if (transcript.includes("switch to light mode") || transcript.includes("light mode")) {
    document.body.classList.add("light");
    localStorage.setItem("theme", "light");
    if (themeToggle) themeToggle.textContent = "🌞";
    showToast("Switched to Light Mode 🌞");
    return;
  }

  if (transcript.includes("new chat") || transcript.includes("clear chat")) {
    const newBtn = document.getElementById("new-chat-btn");
    if (newBtn) newBtn.click();
    showToast("Started New Chat ➕");
    return;
  }

  userInput.value = event.results[0][0].transcript;
  sendMessage();
};

voiceBtn.addEventListener("click", () => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    voiceBtn.textContent = "🎤";
  } else {
    try {
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
    }
  }
});

function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
  }
}

function initThemeToggle() {
  applyThemeFromStorage();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      themeToggle.textContent = isLight ? "🌞" : "🌙";
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }
}

initThemeToggle();

// === Animated 3D Avatar Engine ===
const avatarContainer = document.getElementById("avatar-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  avatarContainer.clientWidth / avatarContainer.clientHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(avatarContainer.clientWidth, avatarContainer.clientHeight);
avatarContainer.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x80d8ff, 1.2);
pointLight.position.set(4, 6, 5);
scene.add(pointLight);
const rimLight = new THREE.PointLight(0x00eaff, 0.7);
rimLight.position.set(-4, 2, 4);
scene.add(rimLight);

const robotGroup = new THREE.Group();
const headMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a9fff,
  metalness: 0.35,
  roughness: 0.28,
  emissive: 0x0b6f9d,
  emissiveIntensity: 0.18,
});
const whiteMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4f7ff,
  metalness: 0.1,
  roughness: 0.5,
});
const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x91d7ff,
  metalness: 0.2,
  roughness: 0.05,
  transparent: true,
  opacity: 0.82,
});

const head = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), headMaterial);
head.position.set(0, 0, 0);
robotGroup.add(head);

const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 32), whiteMaterial);
eyeLeft.position.set(-0.35, 0.15, 0.92);
robotGroup.add(eyeLeft);
const eyeRight = eyeLeft.clone();
eyeRight.position.set(0.35, 0.15, 0.92);
robotGroup.add(eyeRight);

const pupilMaterial = new THREE.MeshStandardMaterial({
  color: 0x0b2c4f,
  emissive: 0x003e74,
  emissiveIntensity: 0.4,
});
const pupilLeft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), pupilMaterial);
pupilLeft.position.set(-0.35, 0.15, 1.04);
robotGroup.add(pupilLeft);
const pupilRight = pupilLeft.clone();
pupilRight.position.set(0.35, 0.15, 1.04);
robotGroup.add(pupilRight);

// --- Natural Viseme & Phoneme Lip-Sync System ---
let targetMouthOpenY = 0;
let currentMouthOpenY = 0;
let targetMouthWidthX = 1.0;
let currentMouthWidthX = 1.0;
let lastVisemeStepTime = 0;

const VISEME_SHAPES = [
  { openY: 0.65, widthX: 0.95 },
  { openY: 0.35, widthX: 1.22 },
  { openY: 0.82, widthX: 0.75 },
  { openY: 0.45, widthX: 1.05 },
  { openY: 0.05, widthX: 0.98 },
];

function triggerNextViseme() {
  const randomIndex = Math.floor(Math.random() * VISEME_SHAPES.length);
  const viseme = VISEME_SHAPES[randomIndex];
  targetMouthOpenY = viseme.openY;
  targetMouthWidthX = viseme.widthX;
}

const mouthUpper = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.05, 0.12), glassMaterial);
mouthUpper.position.set(0, -0.32, 0.94);
robotGroup.add(mouthUpper);

const mouthLower = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.06, 0.12), glassMaterial);
mouthLower.position.set(0, -0.37, 0.94);
robotGroup.add(mouthLower);

const mouthGlowCoreMaterial = new THREE.MeshBasicMaterial({
  color: 0x00eaff,
  transparent: true,
  opacity: 0.1,
  side: THREE.DoubleSide
});
const mouthGlowCore = new THREE.Mesh(
  new THREE.PlaneGeometry(0.55, 0.18),
  mouthGlowCoreMaterial
);
mouthGlowCore.position.set(0, -0.345, 0.92);
robotGroup.add(mouthGlowCore);

const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16), headMaterial);
antenna.position.set(0, 0.95, -0.1);
robotGroup.add(antenna);
const antennaBallMat = new THREE.MeshStandardMaterial({
  color: 0x00eaff,
  emissive: 0x00eaff,
  emissiveIntensity: 1,
});
const antennaBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), antennaBallMat);
antennaBall.position.set(0, 1.35, -0.1);
robotGroup.add(antennaBall);

const ringGeometry = new THREE.TorusGeometry(1.35, 0.08, 32, 100);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0x00d9ff,
  emissive: 0x00a8ff,
  emissiveIntensity: 0.55,
  metalness: 0.4,
  roughness: 0.2,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI * 0.45;
ring.position.y = -0.8;
robotGroup.add(ring);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 64),
  new THREE.MeshStandardMaterial({ color: 0x071921, roughness: 0.8, metalness: 0.1 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
scene.add(floor);

scene.add(robotGroup);

// --- Feature 1: Sentiment & Emotion State Themes ---
let currentEmotion = "neutral";
const EMOTION_THEMES = {
  neutral:   { head: 0x1a9fff, emissive: 0x0b6f9d, pupil: 0x003e74, antenna: 0x00eaff, ring: 0x00d9ff },
  happy:     { head: 0x00d2ff, emissive: 0x00b4d8, pupil: 0x00f5d4, antenna: 0xffd166, ring: 0x06d6a0 },
  thinking:  { head: 0x7209b7, emissive: 0x560bad, pupil: 0xf72585, antenna: 0x4cc9f0, ring: 0x7209b7 },
  technical: { head: 0x0d3b2e, emissive: 0x0a5c36, pupil: 0x00ff88, antenna: 0x00ff88, ring: 0x00cc66 },
  empathetic:{ head: 0x3a0ca3, emissive: 0x4361ee, pupil: 0xffb703, antenna: 0xfb8500, ring: 0xfb8500 }
};

const targetHeadColor = new THREE.Color(EMOTION_THEMES.neutral.head);
const targetEmissiveColor = new THREE.Color(EMOTION_THEMES.neutral.emissive);
const targetPupilColor = new THREE.Color(EMOTION_THEMES.neutral.pupil);
const targetAntennaColor = new THREE.Color(EMOTION_THEMES.neutral.antenna);
const targetRingColor = new THREE.Color(EMOTION_THEMES.neutral.ring);

function analyzeResponseEmotion(text) {
  const lower = text.toLowerCase();
  if (lower.includes("```") || lower.includes("code") || lower.includes("function") || lower.includes("python") || lower.includes("javascript") || lower.includes("api")) {
    setAvatarEmotion("technical");
  } else if (lower.includes("haha") || lower.includes("great") || lower.includes("awesome") || lower.includes("congratulations") || lower.includes("happy") || lower.includes("😊") || lower.includes("🚀") || lower.includes("🎉")) {
    setAvatarEmotion("happy");
  } else if (lower.includes("think") || lower.includes("curious") || lower.includes("wonder") || lower.includes("analyze") || lower.includes("interesting") || lower.includes("🤔")) {
    setAvatarEmotion("thinking");
  } else if (lower.includes("sorry") || lower.includes("understand") || lower.includes("feel") || lower.includes("care") || lower.includes("hope") || lower.includes("❤️")) {
    setAvatarEmotion("empathetic");
  } else {
    setAvatarEmotion("neutral");
  }
}

function setAvatarEmotion(emotionKey) {
  currentEmotion = emotionKey;
  const theme = EMOTION_THEMES[emotionKey] || EMOTION_THEMES.neutral;
  targetHeadColor.setHex(theme.head);
  targetEmissiveColor.setHex(theme.emissive);
  targetPupilColor.setHex(theme.pupil);
  targetAntennaColor.setHex(theme.antenna);
  targetRingColor.setHex(theme.ring);
}

// --- Feature 2: Interactive 3D Projection Canvas ---
const projectionGroup = new THREE.Group();
projectionGroup.position.set(0, 0.4, 0);
scene.add(projectionGroup);

let currentProjectionType = null;

function clearProjections() {
  while (projectionGroup.children.length > 0) {
    const obj = projectionGroup.children[0];
    projectionGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
  }
  currentProjectionType = null;
}

function createSolarSystemProjection() {
  clearProjections();
  currentProjectionType = "solar_system";

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  projectionGroup.add(sun);

  const orbitRingGeo = new THREE.RingGeometry(0.75, 0.77, 64);
  const orbitRingMat = new THREE.MeshBasicMaterial({ color: 0x00eaff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
  orbitRing.rotation.x = Math.PI / 2;
  projectionGroup.add(orbitRing);

  const earthPivot = new THREE.Group();
  earthPivot.name = "earthPivot";
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x0077ff, metalness: 0.3 })
  );
  earth.position.set(0.76, 0, 0);
  earthPivot.add(earth);
  projectionGroup.add(earthPivot);

  projectionGroup.position.set(1.2, 0.3, -0.2);
  projectionGroup.scale.set(0.75, 0.75, 0.75);
}

function create3DBarChartProjection() {
  clearProjections();
  currentProjectionType = "bar_chart";

  const colors = [0x00eaff, 0x3b82f6, 0x8b5cf6, 0xec4899];
  const heights = [0.4, 0.8, 0.6, 1.1];

  heights.forEach((h, i) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, h, 0.16),
      new THREE.MeshStandardMaterial({ color: colors[i], metalness: 0.6, roughness: 0.2 })
    );
    bar.position.set(-0.35 + i * 0.24, h / 2 - 0.4, 0);
    projectionGroup.add(bar);
  });

  projectionGroup.position.set(1.2, 0.2, -0.2);
  projectionGroup.scale.set(0.8, 0.8, 0.8);
}

function createCyberCubeProjection() {
  clearProjections();
  currentProjectionType = "cyber_cube";

  const cube = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.4, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff88, wireframe: true, emissive: 0x00ff88, emissiveIntensity: 0.6 })
  );
  cube.name = "cyberCube";
  projectionGroup.add(cube);

  projectionGroup.position.set(1.2, 0.3, -0.2);
  projectionGroup.scale.set(0.8, 0.8, 0.8);
}

function check3DProjections(userMsg, botReply) {
  const text = (userMsg + " " + botReply).toLowerCase();

  if (text.includes("solar system") || text.includes("planet") || text.includes("orbit")) {
    createSolarSystemProjection();
    showToast("Projected 3D Solar System 🪐");
  } else if (text.includes("bar chart") || text.includes("chart") || text.includes("graph")) {
    create3DBarChartProjection();
    showToast("Projected 3D Data Chart 📊");
  } else if (text.includes("cube") || text.includes("3d model") || text.includes("geometry")) {
    createCyberCubeProjection();
    showToast("Projected 3D Cyber Geometry 🔷");
  }
}

// --- Floating Sparkle Particles ---
const particleCount = 35;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  particlePos[i] = (Math.random() - 0.5) * 5;
  particlePos[i + 1] = (Math.random() - 0.5) * 5;
  particlePos[i + 2] = (Math.random() - 0.5) * 4;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0x00eaff,
  size: 0.05,
  transparent: true,
  opacity: 0.65
});
const particleSystem = new THREE.Points(particleGeo, particleMaterial);
scene.add(particleSystem);

camera.position.set(0, 0.8, 4.2);
camera.lookAt(0, 0, 0);

const clock = new THREE.Clock();

function resizeAvatar() {
  const width = avatarContainer.clientWidth;
  const height = avatarContainer.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeAvatar);
resizeAvatar();

function animateAvatar() {
  requestAnimationFrame(animateAvatar);
  const elapsed = clock.getElapsedTime();

  // Base idle floating animation
  robotGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.08;
  robotGroup.position.y = Math.sin(elapsed * 1.2) * 0.03;
  ring.rotation.z = elapsed * 0.7;
  antennaBall.position.y = 1.35 + Math.sin(elapsed * 2.2) * 0.08;
  pupilLeft.position.x = -0.35 + Math.sin(elapsed * 1.8) * 0.01;
  pupilRight.position.x = 0.35 + Math.sin(elapsed * 1.8 + 0.5) * 0.01;

  // --- Smooth Emotion Color Lerping ---
  headMaterial.color.lerp(targetHeadColor, 0.06);
  headMaterial.emissive.lerp(targetEmissiveColor, 0.06);
  pupilMaterial.emissive.lerp(targetPupilColor, 0.06);
  antennaBallMat.color.lerp(targetAntennaColor, 0.06);
  antennaBallMat.emissive.lerp(targetAntennaColor, 0.06);
  ringMaterial.color.lerp(targetRingColor, 0.06);

  // --- 3D Projection Animations ---
  if (currentProjectionType === "solar_system") {
    const pivot = projectionGroup.getObjectByName("earthPivot");
    if (pivot) pivot.rotation.y += 0.02;
  } else if (currentProjectionType === "cyber_cube") {
    const cube = projectionGroup.getObjectByName("cyberCube");
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.015;
    }
  }

  // --- Floating Sparkle Particles Motion ---
  const positions = particleGeo.attributes.position.array;
  for (let i = 1; i < particleCount * 3; i += 3) {
    positions[i] += 0.003;
    if (positions[i] > 2.5) positions[i] = -2.5;
  }
  particleGeo.attributes.position.needsUpdate = true;

  // --- Natural Fluid 3D Lip-Sync Animation ---
  if (isSpeaking) {
    if (elapsed - lastVisemeStepTime > 0.22) {
      lastVisemeStepTime = elapsed;
      triggerNextViseme();
    }

    currentMouthOpenY = THREE.MathUtils.lerp(currentMouthOpenY, targetMouthOpenY, 0.22);
    currentMouthWidthX = THREE.MathUtils.lerp(currentMouthWidthX, targetMouthWidthX, 0.22);

    mouthUpper.position.y = -0.32 + currentMouthOpenY * 0.035;
    mouthLower.position.y = -0.37 - currentMouthOpenY * 0.14;
    mouthLower.scale.y = 1 + currentMouthOpenY * 1.5;

    mouthUpper.scale.x = currentMouthWidthX;
    mouthLower.scale.x = currentMouthWidthX;
    mouthGlowCore.scale.x = currentMouthWidthX;

    mouthGlowCore.scale.y = Math.max(0.1, currentMouthOpenY * 2.2);
    mouthGlowCoreMaterial.opacity = 0.2 + currentMouthOpenY * 0.7;

    head.rotation.x = Math.sin(elapsed * 4) * 0.04;
    head.rotation.z = Math.cos(elapsed * 2.2) * 0.02;
    antennaBallMat.emissiveIntensity = 1 + currentMouthOpenY * 1.3;
  } else {
    currentMouthOpenY = THREE.MathUtils.lerp(currentMouthOpenY, 0, 0.14);
    currentMouthWidthX = THREE.MathUtils.lerp(currentMouthWidthX, 1.0, 0.14);

    mouthUpper.position.y = THREE.MathUtils.lerp(mouthUpper.position.y, -0.32, 0.14);
    mouthLower.position.y = THREE.MathUtils.lerp(mouthLower.position.y, -0.37, 0.14);
    mouthUpper.scale.x = THREE.MathUtils.lerp(mouthUpper.scale.x, 1.0, 0.14);
    mouthLower.scale.x = THREE.MathUtils.lerp(mouthLower.scale.x, 1.0, 0.14);
    mouthLower.scale.y = THREE.MathUtils.lerp(mouthLower.scale.y, 1.0, 0.14);

    mouthGlowCore.scale.x = THREE.MathUtils.lerp(mouthGlowCore.scale.x, 1.0, 0.14);
    mouthGlowCore.scale.y = THREE.MathUtils.lerp(mouthGlowCore.scale.y, 0.1, 0.14);
    mouthGlowCoreMaterial.opacity = THREE.MathUtils.lerp(mouthGlowCoreMaterial.opacity, 0.05, 0.14);

    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0, 0.1);
    head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, 0.1);
    antennaBallMat.emissiveIntensity = THREE.MathUtils.lerp(antennaBallMat.emissiveIntensity, 1, 0.1);
  }

  renderer.render(scene, camera);
}

animateAvatar();

function showToast(msgText = "Copied Successfully!") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const msgSpan = toast.querySelector(".toast-message");
  if (msgSpan) msgSpan.textContent = msgText;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
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
  if (!historyList) return;
  historyList.innerHTML = "";

  allChats.slice().reverse().forEach((chat) => {
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
if (newChatBtn) {
  newChatBtn.onclick = () => {
    if (currentChat.length) {
      allChats.push(currentChat);
    }
    currentChat = [];
    chatBox.innerHTML = "";
    clearProjections();
    setAvatarEmotion("neutral");
    updateHistory();
  };
}

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

// Profile Dropdown listeners
if (profileBtn && dropdown) {
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });
}

const viewProfileBtn = document.getElementById("view-profile-btn");
if (viewProfileBtn) {
  viewProfileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

if (logoutBtn) {
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
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });
}
