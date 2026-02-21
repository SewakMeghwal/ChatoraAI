# 🗣️ ChatoraAI — Voice & Chat Bot with 3D Interactive UI

⚠️ **Notice:** This project is currently **under active development**.  
Features, APIs, and UI elements may change without prior notice.

---

## 📌 Overview
**ChatoraAI** is an AI-powered **voice + chat bot** built with **Python FastAPI** and **Cohere NLP**, featuring an **interactive Three.js 3D interface**.  
It supports **text-based conversations** and **real-time voice interactions**, delivering a human-like chat experience with immersive visuals.

![alt text](<frontend\assets\ChatoraAI.png>)

---

## ✨ Features
- 🗣 **Voice Interaction** – Real-time **speech-to-text** and **text-to-speech** conversion.
- 💬 **Chat Mode** – Context-aware conversation powered by **Cohere’s LLM**.
- 🎨 **3D Interface** – Engaging visuals using **Three.js**.
- 🔌 **FastAPI Backend** – High-performance and async-friendly.
- 🌐 **Cross-Platform** – Runs in web browsers; extendable to desktop/mobile.

---

## 🛠 Tech Stack
**Backend:**  
- Python  
- FastAPI  
- Cohere API (NLP/LLM)  

**Frontend:**  
- HTML, CSS, JavaScript  
- Three.js (3D graphics)  

**Voice Processing:**  
- Web Speech API (Speech Recognition & Speech Synthesis)  

---

## 📂 Project Structure
```

ChatoraAI/
│── backend/
│   ├── main.py          # FastAPI backend
│   ├── routes.py        # API endpoints
│   ├── cohere\_client.py # Cohere integration
│   ├── requirements.txt
│
│── frontend/
│   ├── index.html       # Main 3D UI
│   ├── script.js        # Three.js + Chat logic
│   ├── style.css
│
│── README.md
│── .env.example         # Example environment variables

````

---

## ⚙️ Installation & Setup
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ChatoraAI.git
cd ChatoraAI
````

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
COHERE_API_KEY=your_cohere_api_key_here
```

> Get your API key from [Cohere Dashboard](https://dashboard.cohere.com/).

### 4️⃣ Run the Backend

```bash
uvicorn main:app --reload
```

Backend will start on: `http://127.0.0.1:8000`

---

## 🚀 Running the Frontend

Simply open `frontend/index.html` in your browser, or serve it via a local web server:

```bash
cd frontend
python -m http.server 8080
```

Frontend will be available at: `http://localhost:8080`

---

## 📐 Architecture

```
User ↔ Browser (Three.js UI + Voice API)
     ↕
FastAPI Backend ↔ Cohere API
```

---

## 📌 Roadmap

* [ ] Improve 3D UI animations
* [ ] Add multilingual support
* [ ] Enhance voice-to-text accuracy
* [ ] Deploy to cloud

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome! Please **fork** the repo and create a **pull request**.

---

💡 *Made with ❤️ using Python, FastAPI, Cohere, and Three.js.*

