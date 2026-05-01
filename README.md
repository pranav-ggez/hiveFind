# HiveFind Setup Guide

Follow these steps to get HiveFind running locally on your machine.

## 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Running locally or Atlas)
- **Ollama** (For local embeddings)
- **Gemini API Key** (From Google AI Studio)

---

## 2. Ollama Setup (Local Embeddings)
1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Open your terminal and run:
   ```bash
   ollama pull nomic-embed-text
   ```
3. Keep the Ollama application running in the background.

---

## 3. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Update `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hivefind
   GEMINI_API_KEY=your_gemini_api_key_here
   OLLAMA_URL=http://localhost:11434
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

---

## 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`.

---

## 5. Testing Steps
1. **Upload:** Go to "Student Space", upload a PDF/DOCX (under 5MB). Wait for "File processed and indexed!".
2. **Q&A:** Type a question in the chat box based on the document content. Gemini should answer using the context.
3. **Validation:** Ask a question unrelated to the document. It should return: *"Invalid: Answer not found in uploaded documents."*
4. **Quiz:** Go to "Quiz Me", click "Generate Quiz". Take the quiz and check your score.
5. **Persistence:** Refresh the page and check if you can still ask questions about the uploaded document (FAISS persists locally in `backend/data/`).

---

## 📦 Final Folder Structure
```text
hiveFind/
├── backend/
│   ├── config/ (DB connection)
│   ├── controllers/ (Logic)
│   ├── data/ (FAISS index storage)
│   ├── middleware/ (Error handling)
│   ├── models/ (MongoDB Schemas)
│   ├── routes/ (API endpoints)
│   ├── utils/ (Chunker, Embeddings, VectorStore)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ (Sidebar, Chat, Upload, Quiz)
│   │   └── App.jsx
│   └── vite.config.js
└── GEMINI.md
```
