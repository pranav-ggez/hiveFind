const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const Query = require('../models/Query');
const { callOllama } = require('../utils/ollama');

const FALLBACK = 'Invalid: Answer not found in uploaded documents.';

const memory = new Map();

const getKey = (req) => `${req.ip}-${(req.headers['user-agent'] || '').slice(0, 20)}`;

const getHistory = (req) => {
  const key = getKey(req);
  if (!memory.has(key)) memory.set(key, []);
  return memory.get(key);
};

const pushHistory = (req, q, a) => {
  const hist = getHistory(req);
  hist.push({ q, a });
  if (hist.length > 3) hist.shift();
};

const isFollowUp = (text) => text.trim().length < 20;

const rewriteFollowUp = (prevQ, curQ) => {
  if (!prevQ) return curQ;
  return `${curQ} about ${prevQ}`;
};

const askQuestion = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Query cannot be empty.' });
    }

    if (!vectorStore.activeDocument || vectorStore.getDocCount() === 0) {
      return res.status(400).json({ message: 'No document loaded.' });
    }

    const history = getHistory(req);
    const prevQ = history.length ? history[history.length - 1].q : null;

    const effectiveQuery = isFollowUp(query) && prevQ
      ? rewriteFollowUp(prevQ, query)
      : query;

    const embedding = await generateEmbeddings(effectiveQuery);

    let chunks = await vectorStore.search(embedding, 8);

    if (!chunks || chunks.length === 0) {
      return res.json({ answer: FALLBACK, sources: [] });
    }

    const topChunks = chunks.slice(0, 3);

    let context = topChunks.map(c => c.content).join('\n---\n');
    if (context.length > 2500) context = context.slice(0, 2500);

    const wantsTable = /compare|table|vs|difference|types|categories/i.test(query);

    const prompt = `
Answer the question using ONLY relevant parts of the context.

STRICT RULES:
- Answer ONLY what is asked
- Do NOT include extra topics
- Do NOT explain unrelated concepts
- If answer not clearly found → return EXACTLY:
${FALLBACK}

${wantsTable ? 'If comparison is needed, return ONLY a markdown table.' : ''}

Context:
${context}

Question:
${effectiveQuery}

Answer:
`.trim();

    let answer = await callOllama(prompt);

    if (!answer || answer.length < 3) {
      return res.json({ answer: FALLBACK, sources: [] });
    }

    const qWords = query.toLowerCase().split(/\s+/);

    const isRelevant = qWords.some(word =>
      answer.toLowerCase().includes(word)
    );

    if (!isRelevant) {
      return res.json({ answer: FALLBACK, sources: [] });
    }

    pushHistory(req, effectiveQuery, answer);

    await new Query({ question: query, answer }).save().catch(() => {});

    res.json({
      answer,
      sources: topChunks.map(c => ({
        filename: c.filename,
        content: c.content
      }))
    });

  } catch (err) {
    console.error('[Chat Error]', err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

module.exports = { askQuestion };