const axios = require('axios');

/**
 * Generate embeddings using Ollama local API
 * Model: nomic-embed-text
 */
const generateEmbeddings = async (text) => {
  try {
    const response = await axios.post(`${process.env.OLLAMA_URL}/api/embed`, {
      model: 'nomic-embed-text',
      input: text,
    });
    
    return response.data.embeddings[0];
  } catch (error) {
    if (error.response) {
      console.error('Ollama Error Detail:', error.response.data);
    }
    console.error('Ollama Error:', error.message);
    throw new Error('Failed to generate embedding via Ollama');
  }
};

module.exports = { generateEmbeddings };
