const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { chunkText } = require('../utils/chunker');
const { generateEmbeddings } = require('../utils/embeddings');
const vectorStore = require('../utils/vectorStore');
const File = require('../models/File');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large' });
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
      return res.status(400).json({ message: 'Empty document' });
    }

    vectorStore.clear();

    const chunks = chunkText(extractedText, 150, 30);

    const processedChunks = await Promise.all(
      chunks.map(async (content) => {
        const embedding = await generateEmbeddings(content);
        return { content, embedding };
      })
    );

    await vectorStore.addDocuments(processedChunks, originalname);

    const newFile = new File({
      name: originalname,
      mimetype,
      size
    });

    await newFile.save();

    res.json({
      message: 'Document indexed',
      fileName: originalname,
      totalChunks: processedChunks.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = { uploadFile };