# HiveFind Setup Guide

Follow these steps to get HiveFind running locally on your machine.

---

## 1. Prerequisites

* **Node.js** (v18 or higher)
* **MongoDB Community Server**
* **MongoDB Compass** (recommended)
* **Ollama** (for local embeddings)
* **Gemini API Key** (from Google AI Studio)

---

## 2. MongoDB Setup (IMPORTANT)

MongoDB must be running BEFORE backend starts.

### Step 1 — Create data directory (only once)

Create this folder manually:
C:\data\db

---

### Step 2 — Start MongoDB

Open terminal:

```bash
cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe
```

You should see:

```
Waiting for connections on port 27017
```

⚠️ Keep this terminal open.

---

### Step 3 — (Optional) Verify with Compass

Connect using:

```
mongodb://127.0.0.1:27017
```

---

## 3. Ollama Setup (Local Embeddings)

1. Install from https://ollama.com
2. Run:

```bash
ollama pull nomic-embed-text
```

3. Keep Ollama running in background

---

## 4. Backend Setup

```bash
cd backend
npm install
```

### Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hivefind
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_URL=http://localhost:11434
```

### Start backend:

```bash
npm run dev
```

---

## 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 6. How to Run the Project (Daily Routine)

Every time you start the project:

### 1. Start MongoDB

```bash
cd "C:\Program Files\MongoDB\Server\8.2\bin"
.\mongod.exe
```

---

### 2. Start Backend

```bash
cd backend
npm run dev
```

---

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

---

## 7. Testing Steps

1. Upload a PDF/DOCX (under 5MB)
2. Wait for indexing confirmation
3. Ask a question → should answer from document
4. Ask unrelated question → must return:
   "Invalid: Answer not found in uploaded documents."
5. Generate quiz from "Quiz Me"

---

## 8. Expected Behavior

* Answers are based ONLY on uploaded content
* No external hallucinated answers
* Chat history stored in MongoDB
* Vector index stored locally in `backend/data/`

---

## 9. Folder Structure

```text
hiveFind/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
│   └── vite.config.js
└── GEMINI.md
```

---

## ⚠️ Common Issues

* MongoDB not running → data won’t persist
* Wrong port → frontend won’t connect
* Missing API key → Gemini won’t respond
* Ollama not running → embeddings fail

---

## 🚀 Notes

* MongoDB runs continuously — it does NOT “finish”
* Do not close Mongo terminal while using the app
* Use MongoDB Compass to inspect stored data

---

Created by @pranav-ggez
