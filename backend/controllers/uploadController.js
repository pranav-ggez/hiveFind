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

    // 2. Clear Previous Context (Ensures "Active Document" isolation)
    console.log(`[Upload] Clearing previous index. Setting new active document: ${originalname}`);
    vectorStore.clear();

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

    // 3. Chunking & Processing
    const chunks = chunkText(extractedText, 150, 30);

    const processedChunks = await Promise.all(
      chunks.map(async (content) => {
        const embedding = await generateEmbeddings(content);
        return { content, embedding };
      })
    );

    // 4. Indexing (Isolated to this file only)
    await vectorStore.addDocuments(processedChunks, originalname);

    // 5. Persistence (Metadata only)
    const newFile = new File({
      name: originalname,
      mimetype: mimetype,
      size: size
    });
    await newFile.save();

    res.json({
      message: 'Document successfully indexed as active context',
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
