// // Backend API URL
// const API_URL = "http://127.0.0.1:8000/chat";

// // DOM Elements
// const chatBox = document.getElementById("chat-box");
// const userInput = document.getElementById("user-input");
// const sendBtn = document.getElementById("send-btn");
// const emojiBtn = document.getElementById("emoji-btn");
// const emojiPicker = document.getElementById("emoji-picker");

// // Add message to chat box
// function appendMessage(sender, message) {
//   const msg = document.createElement("div");
//   msg.classList.add(sender === "user" ? "user-msg" : "bot-msg");
//   msg.textContent = `${sender}: ${message}`;
//   chatBox.appendChild(msg);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// // Send user message to backend
// async function sendMessage() {
//   const message = userInput.value.trim();
//   if (!message) return;

//   appendMessage("user", message);
//   userInput.value = "";

//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch response from server");
//     }

//     const data = await response.json();
//     appendMessage("bot", data.reply);
//   } catch (error) {
//     appendMessage("bot", "⚠️ Error connecting to server.");
//     console.error("Error:", error);
//   }
// }

// // Handle send button
// sendBtn.addEventListener("click", sendMessage);

// // Handle Enter key
// userInput.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") {
//     sendMessage();
//   }
// });

// // === Emoji Picker Integration ===
// emojiBtn.addEventListener("click", () => {
//   // Toggle emoji picker visibility
//   emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
// });

// // When user selects an emoji
// emojiPicker.addEventListener("emoji-click", (event) => {
//   userInput.value += event.detail.unicode;
// });

// === Backend API URL ===
const API_URL = "http://127.0.0.1:8000/chat";

// === DOM Elements ===
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");

// === Append message to chat ===
function appendMessage(sender, message) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msg.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Send message to backend ===
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from server");
    }

    const data = await response.json();
    appendMessage("bot", data.reply);
  } catch (error) {
    appendMessage("bot", "⚠️ Error connecting to server.");
    console.error("Error:", error);
  }
}

// === Event Listeners ===
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// === Emoji Picker ===
emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
});

emojiPicker.addEventListener("emoji-click", (event) => {
  userInput.value += event.detail.unicode;
});

// === THREE.JS 3D CAT AVATAR ===
// === THREE.JS 3D AVATAR ===
const avatarContainer = document.getElementById("avatar-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70, // slightly smaller FOV
  avatarContainer.clientWidth / avatarContainer.clientHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(avatarContainer.clientWidth, avatarContainer.clientHeight);
avatarContainer.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Load 3D cat model
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

camera.position.z = 3;
