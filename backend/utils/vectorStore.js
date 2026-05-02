const { IndexFlatIP } = require('faiss-node');
const fs = require('fs');
const path = require('path');

/**
 * Helper to normalize vectors for Cosine Similarity using FlatIP
 */
const normalize = (vector) => {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / (norm || 0.00001));
};

/**
 * Vector Service using FAISS (Cosine Similarity)
 * Isolated for "One Active Document" logic
 */
class VectorService {
  constructor() {
    this.dimension = 768;
    this.index = new IndexFlatIP(this.dimension);
    this.metadata = [];
    this.activeDocument = null; // Tracks the currently loaded document
    
    this.indexPath = path.join(__dirname, '../data/faiss.index');
    this.metadataPath = path.join(__dirname, '../data/metadata.json');

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    this.loadIndex();
  }

  /**
   * Add documents to the index
   */
  async addDocuments(chunks, filename) {
    const normalizedEmbeddings = chunks.map(c => normalize(c.embedding)).flat();
    this.index.add(normalizedEmbeddings);
    
    chunks.forEach(c => {
      this.metadata.push({ 
        content: c.content, 
        filename: filename 
      });
    });

    this.activeDocument = filename;
    this.saveIndex();
  }

  /**
   * Search for top-k similar chunks
   */
  async search(queryEmbedding, k = 10) {
    if (this.index.ntotal() === 0) return [];

    const normalizedQuery = normalize(queryEmbedding);
    const results = this.index.search(normalizedQuery, k);
    
    return results.labels.map((label, idx) => {
      if (label === -1) return null;
      return {
        content: this.metadata[label].content,
        filename: this.metadata[label].filename,
        score: results.distances[idx]
      };
    }).filter(r => r !== null);
  }

  saveIndex() {
    this.index.write(this.indexPath);
    fs.writeFileSync(this.metadataPath, JSON.stringify({
      activeDocument: this.activeDocument,
      metadata: this.metadata
    }));
  }

  loadIndex() {
    if (fs.existsSync(this.indexPath) && fs.existsSync(this.metadataPath)) {
      try {
        this.index = IndexFlatIP.read(this.indexPath);
        const data = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
        this.metadata = data.metadata || [];
        this.activeDocument = data.activeDocument || null;
        console.log(`[VectorStore] Loaded active document: ${this.activeDocument} (${this.index.ntotal()} chunks)`);
      } catch (e) {
        this.clear();
      }
    }
  }

  clear() {
    this.index = new IndexFlatIP(this.dimension);
    this.metadata = [];
    this.activeDocument = null;
    if (fs.existsSync(this.indexPath)) fs.unlinkSync(this.indexPath);
    if (fs.existsSync(this.metadataPath)) fs.unlinkSync(this.metadataPath);
    console.log('[VectorStore] Index cleared for new document.');
  }

  getDocCount() {
    return this.index.ntotal();
  }
}

module.exports = new VectorService();
