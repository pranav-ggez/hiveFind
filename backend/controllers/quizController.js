const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const Quiz = require('../models/Quiz');

/**
 * Generate a quiz based ONLY on active document context
 */
const generateQuiz = async (req, res, next) => {
  try {
    // 1. Safety Check: Verify active document exists
    const activeDocName = vectorStore.activeDocument;
    const chunkCount = vectorStore.getDocCount();

    if (!activeDocName || chunkCount === 0) {
      console.log('[Quiz] Attempted generation with no active document.');
      return res.status(400).json({ 
        message: 'No active document loaded. Please upload a document in the Student Space first.' 
      });
    }

    console.log(`[Quiz] Generating quiz for active document: "${activeDocName}" using ${chunkCount} chunks.`);

    // 2. Retrieve semantic context (using generic educational prompt to find representative chunks)
    const topicEmbedding = await generateEmbeddings("key concepts and definitions");
    const relevantChunks = await vectorStore.search(topicEmbedding, 10);

    const contextText = relevantChunks.map(c => c.content).join('\n\n');

    // 3. Prompt Gemini for JSON Quiz
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      ROLE: Educational content creator.
      TASK: Create a quiz based ONLY on the provided document context below.
      SOURCE DOCUMENT: ${activeDocName}

      STRICT RULES:
      1. Use ONLY the context provided to generate questions.
      2. Output EXACTLY in this JSON structure:
      {
        "title": "Quiz: [Topic Name]",
        "questions": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option B",
            "type": "MCQ"
          },
          {
            "question": "Short Answer Question?",
            "answer": "Concise correct answer",
            "type": "SHORT"
          }
        ]
      }
      3. Requirements: 3 MCQs and 2 Short Answer questions.
      
      CONTEXT:
      ${contextText}
    `;

    const result = await model.generateContent(prompt);
    const quizData = JSON.parse(result.response.text());

    res.json(quizData);

  } catch (error) {
    console.error('[Quiz] Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate quiz from current document.', error: error.message });
  }
};

/**
 * Save Quiz Result
 */
const saveQuizResult = async (req, res) => {
  try {
    const { title, questions, score } = req.body;
    const newQuiz = new Quiz({ 
      title, 
      questions, 
      score,
      sourceDocument: vectorStore.activeDocument // Log the source
    });
    await newQuiz.save();
    res.json({ message: 'Quiz result saved successfully', id: newQuiz._id });
  } catch (error) {
    res.status(500).json({ message: 'Error saving quiz', error: error.message });
  }
};

module.exports = { generateQuiz, saveQuizResult };
