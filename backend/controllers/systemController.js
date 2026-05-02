const File = require('../models/File');
const vectorStore = require('../utils/vectorStore');

/**
 * Clear the entire knowledge base index.
 * This is a destructive action.
 */
const clearIndex = async (req, res, next) => {
  try {
    // 1. Clear the vector store (FAISS index and metadata)
    vectorStore.clear();

    // 2. Clear the file metadata from MongoDB
    await File.deleteMany({});

    console.log('[API] Knowledge base index cleared successfully.');
    res.json({ message: 'Knowledge base has been cleared successfully.' });

  } catch (error) {
    console.error('[Clear Index] Critical Error:', error);
    res.status(500).json({ message: 'Error clearing the index', error: error.message });
  }
};

module.exports = { clearIndex };
