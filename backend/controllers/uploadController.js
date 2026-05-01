const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { chunkText } = require('../utils/chunker');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const File = require('../models/File');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // 1. Validation
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. PDF and DOCX only.' });
    }

    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Max 5MB allowed.' });
    }

    // Check for duplicate file in DB
    const existing = await File.findOne({ name: originalname });
    if (existing) {
      return res.status(400).json({ message: 'A file with this name is already indexed.' });
    }

    let extractedText = '';
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      extractedText = data.text;
    } else {
      const data = await mammoth.extractRawText({ buffer });
      extractedText = data.value;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ message: 'Could not extract text from file' });
    }

    // 2. Chunking (150 words / 30 overlap for slide-deck precision)
    const chunks = chunkText(extractedText, 150, 30);

    // 3. Embedding & Vector Storage
    const processedChunks = await Promise.all(
      chunks.map(async (content) => {
        const embedding = await generateEmbeddings(content);
        return { content, embedding, filename: originalname };
      })
    );

    await vectorStore.addDocuments(processedChunks);

    // 4. Persistence
    const newFile = new File({
      name: originalname,
      mimetype: mimetype,
      size: size
    });
    await newFile.save();

    res.json({
      message: 'Document successfully indexed',
      fileName: originalname,
      totalChunks: processedChunks.length,
      fileId: newFile._id
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ message: 'Internal processing error', error: error.message });
  }
};

module.exports = { uploadFile };
