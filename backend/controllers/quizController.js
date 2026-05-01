const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const Quiz = require('../models/Quiz');

/**
 * Generate a quiz based on document context
 */
const generateQuiz = async (req, res, next) => {
  try {
    // Topic is optional but helpful
    const topic = req.body.topic?.trim() || 'General document content';

    // 1. Get some context from FAISS
    const topicEmbedding = await generateEmbeddings(topic);
    const relevantChunks = await vectorStore.search(topicEmbedding, 6);

    if (!relevantChunks || relevantChunks.length === 0) {
      return res.status(400).json({ message: 'Please upload documents before generating a quiz.' });
    }

    const contextText = relevantChunks.map(c => c.content).join('\n\n');

    // 2. Prompt Gemini for JSON Quiz
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Create a quiz based ONLY on the provided context.
      Output in JSON format with this structure:
      {
        "title": "Quiz Title",
        "questions": [
          {
            "question": "MCQ Question text?",
            "options": ["A", "B", "C", "D"],
            "answer": "Correct Option",
            "type": "MCQ"
          },
          {
            "question": "Short Answer Question?",
            "answer": "Brief correct answer",
            "type": "SHORT"
          }
        ]
      }
      
      Requirements: 3 MCQs and 2 Short Answer questions.
      
      Context:
      ${contextText}
    `;

    const result = await model.generateContent(prompt);
    const quizData = JSON.parse(result.response.text());

    res.json(quizData);
  } catch (error) {
    console.error('Quiz Gen Error:', error);
    res.status(500).json({ message: 'Error generating quiz', error: error.message });
  }
};

/**
 * Save Quiz Result
 */
const saveQuizResult = async (req, res) => {
  try {
    const { title, questions, score } = req.body;
    const newQuiz = new Quiz({ title, questions, score });
    await newQuiz.save();
    res.json({ message: 'Quiz result saved successfully', id: newQuiz._id });
  } catch (error) {
    res.status(500).json({ message: 'Error saving quiz', error: error.message });
  }
};

module.exports = { generateQuiz, saveQuizResult };
