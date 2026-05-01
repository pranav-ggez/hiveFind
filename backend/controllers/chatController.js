const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const Query = require('../models/Query');

/**
 * Handle RAG-based Chat Query
 */
const askQuestion = async (req, res, next) => {
  try {
    const { query } = req.body;

    // 1. Validation
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Query cannot be empty' });
    }

    // 2. Retrieval
    const queryEmbedding = await generateEmbeddings(query);
    const relevantChunks = await vectorStore.search(queryEmbedding, 8); // Top-8 for slides coverage
    
    console.log('--- [RAG DEBUG START] ---');
    console.log(`Query: ${query}`);
    console.log(`Chunks Retrieved: ${relevantChunks.length}`);
    relevantChunks.forEach((c, i) => {
      console.log(`Chunk ${i} | Score: ${c.score.toFixed(4)} | File: ${c.filename} | Snippet: ${c.content.substring(0, 60)}...`);
    });

    if (relevantChunks.length === 0) {
      console.log('Zero chunks retrieved. Returning "Invalid"');
      return res.json({ answer: 'Invalid: Answer not found in uploaded documents.' });
    }

    const contextText = relevantChunks.map(c => `[Source: ${c.filename}]\n${c.content}`).join('\n\n---\n\n');

    // 3. Strict Prompting
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
      ROLE: Senior academic assistant.
      TASK: Answer the user's question using ONLY the provided document context.
      
      STRICT CONSTRAINTS:
      1. Use ONLY the retrieved chunks below to answer.
      2. If the specific answer is NOT in the context, respond EXACTLY with:
         "Invalid: Answer not found in uploaded documents."
      3. Do NOT use outside knowledge or hallucinate.
      4. Do NOT apologize or explain why you can't answer, just use the exact phrase if missing.
      5. Format math/LaTeX clearly using Markdown if found.

      CONTEXT:
      ${contextText}
      
      USER QUESTION:
      ${query}
    `;

    console.log('--- [FINAL PROMPT] ---');
    console.log(prompt);

    // 4. AI Generation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log(`AI Response: ${text}`);
    console.log('--- [RAG DEBUG END] ---');

    // 5. History & Response
    const newQuery = new Query({
      question: query,
      answer: text
    });
    await newQuery.save();

    res.json({
      answer: text,
      sources: relevantChunks.map(c => ({ 
        filename: c.filename, 
        content: c.content 
      }))
    });

  } catch (error) {
    console.error('[Chat] Critical Error:', error);
    res.status(500).json({ message: 'Error processing your query', error: error.message });
  }
};

module.exports = { askQuestion };
