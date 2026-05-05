const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';

const clean = (text) => {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();
};

const callOllama = async (prompt) => {
  try {
    const res = await axios.post(
      OLLAMA_URL,
      {
        model: process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:3b',
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 400,
          num_ctx: 2048
        }
      },
      { timeout: 45000 }
    );

    return clean(res.data?.response || '');

  } catch (err) {
    console.error('[Ollama Error]', err.message);
    return 'Temporary AI issue. Please try again.';
  }
};

module.exports = { callOllama };