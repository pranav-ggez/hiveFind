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
 * Includes filename in metadata for better source transparency
 */
class VectorService {
  constructor() {
    this.dimension = 768;
    this.index = new IndexFlatIP(this.dimension);
    this.metadata = [];
    this.indexPath = path.join(__dirname, '../data/faiss.index');
    this.metadataPath = path.join(__dirname, '../data/metadata.json');

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    this.loadIndex();
  }

  /**
   * Add documents to the index
   * @param {Array} chunks - Array of objects { content, embedding, filename }
   */
  async addDocuments(chunks) {
    const normalizedEmbeddings = chunks.map(c => normalize(c.embedding)).flat();
    this.index.add(normalizedEmbeddings);
    
    chunks.forEach(c => {
      this.metadata.push({ 
        content: c.content, 
        filename: c.filename || 'Unknown Document' 
      });
    });

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
    fs.writeFileSync(this.metadataPath, JSON.stringify(this.metadata));
  }

  loadIndex() {
    if (fs.existsSync(this.indexPath) && fs.existsSync(this.metadataPath)) {
      try {
        this.index = IndexFlatIP.read(this.indexPath);
        this.metadata = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
        console.log(`[VectorStore] Cosine Index Loaded: ${this.index.ntotal()} documents`);
      } catch (e) {
        console.error('[VectorStore] Error loading index:', e.message);
        this.clear();
      }
    }
  }

  clear() {
    this.index = new IndexFlatIP(this.dimension);
    this.metadata = [];
    if (fs.existsSync(this.indexPath)) fs.unlinkSync(this.indexPath);
    if (fs.existsSync(this.metadataPath)) fs.unlinkSync(this.metadataPath);
    console.log('[VectorStore] Index cleared');
  }
}

module.exports = new VectorService();
