const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const Query = require('../models/Query');

/**
 * Helper to detect if a query is complex/multi-part
 */
const isComplexQuery = (text) => {
  const indicators = [' and ', ' also ', ' compare ', ' both ', ' then ', ' whereas '];
  const questionMarks = (text.match(/\?/g) || []).length;
  // Multi-part if multiple questions, or clear conjunctions, or very long
  return questionMarks > 1 || indicators.some(i => text.toLowerCase().includes(i)) || text.length > 120;
};

/**
 * Helper to decompose complex queries using Gemini
 */
const decomposeQuery = async (model, query) => {
  const prompt = `
    Analyze this user query: "${query}"
    If it contains multiple distinct questions or topics, split it into a JSON array of simple independent strings.
    If it is already simple, return an array with just the original string.
    Example Input: "What is the capital and what is the population?"
    Example Output: ["What is the capital?", "What is the population?"]
    Only output JSON.
  `;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn('[RAG] Decomposition failed, falling back to original query.');
    return [query];
  }
};

/**
 * Handle RAG-based Chat Query (Supports Multi-part queries)
 */
const askQuestion = async (req, res, next) => {
  try {
    const { query } = req.body;

    // 1. Validation
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Query cannot be empty' });
    }

    if (!vectorStore.activeDocument) {
      return res.status(400).json({ message: 'No active document loaded. Please upload a document first.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // ── 1. ROUTING: Simple vs Complex ──
    const isComplex = isComplexQuery(query);
    const subQueries = isComplex 
      ? await decomposeQuery(model, query)
      : [query];

    const isMulti = subQueries.length > 1;
    console.log(`[RAG] Mode: ${isMulti ? 'Complex' : 'Simple'} | Sub-queries: ${subQueries.length}`);

    // ── 2. RETRIEVAL (Parallel for each sub-query) ──
    const allRelevantChunks = [];
    const seenContents = new Set();

    await Promise.all(subQueries.map(async (sq) => {
      const embedding = await generateEmbeddings(sq);
      // If multi-part, we retrieve fewer chunks per part to avoid context bloat
      const chunks = await vectorStore.search(embedding, isMulti ? 4 : 8);
      
      chunks.forEach(c => {
        if (!seenContents.has(c.content)) {
          seenContents.add(c.content);
          allRelevantChunks.push(c);
        }
      });
    }));

    if (allRelevantChunks.length === 0) {
      return res.json({ answer: 'Invalid: Answer not found in uploaded documents.' });
    }

    // ── 3. PROMPTING ──
    const contextText = allRelevantChunks.map(c => `[Source: ${c.filename}]\n${c.content}`).join('\n\n---\n\n');

    const prompt = `
      ROLE: Senior academic assistant.
      TASK: Answer the user's question(s) using ONLY the provided document context.
      
      STRICT CONSTRAINTS:
      1. Use ONLY the retrieved chunks below to answer.
      2. If an answer to a specific part of the user's request is NOT in the context, say "Not found in document" for that specific part.
      3. If NONE of the questions can be answered from context, respond EXACTLY with:
         "Invalid: Answer not found in uploaded documents."
      4. Provide a cohesive, professional response. Use numbers/bullets if the query is multi-part.
      5. Do NOT use outside knowledge or hallucinate.
      6. Format math/LaTeX clearly using Markdown.

      CONTEXT:
      ${contextText}
      
      USER QUESTION:
      ${query}
    `;

    // ── 4. AI GENERATION ──
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // ── 5. HISTORY & RESPONSE ──
    const newQuery = new Query({
      question: query,
      answer: text
    });
    await newQuery.save();

    res.json({
      answer: text,
      sources: allRelevantChunks.map(c => ({ 
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
