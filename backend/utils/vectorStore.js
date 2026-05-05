const { IndexFlatIP } = require('faiss-node');
const fs = require('fs');
const path = require('path');

const normalize = (vector) => {
  let norm = 0;
  for (let i = 0; i < vector.length; i++) {
    norm += vector[i] * vector[i];
  }

  norm = Math.sqrt(norm);
  if (!norm) return vector.map(() => 0);

  return vector.map(v => v / norm);
};

class VectorService {
  constructor() {
    this.dimension = 768;
    this.index = new IndexFlatIP(this.dimension);
    this.metadata = [];
    this.activeDocument = null;

    this.indexPath = path.join(__dirname, '../data/faiss.index');
    this.metadataPath = path.join(__dirname, '../data/metadata.json');

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    this.loadIndex();
  }

  async addDocuments(chunks, filename) {
    if (!chunks || chunks.length === 0) return;

    const embeddings = [];

    for (const c of chunks) {
      const norm = normalize(c.embedding);
      embeddings.push(...norm);

      this.metadata.push({
        content: c.content,
        filename
      });
    }

    this.index.add(embeddings);
    this.activeDocument = filename;

    this.saveIndex();
  }

  async search(queryEmbedding, k = 8) {
    const total = this.index.ntotal();
    if (total === 0) return [];

    const safeK = Math.min(k, total);

    const normalizedQuery = normalize(queryEmbedding);

    let results;
    try {
      results = this.index.search(normalizedQuery, safeK);
    } catch {
      return [];
    }

    const output = [];

    for (let i = 0; i < results.labels.length; i++) {
      const label = results.labels[i];
      if (label === -1 || !this.metadata[label]) continue;

      output.push({
        content: this.metadata[label].content,
        filename: this.metadata[label].filename,
        score: results.distances[i] || 0
      });
    }

    output.sort((a, b) => b.score - a.score);

    let filtered = output.filter(c => c.score > 0.35);

    if (filtered.length < 3) {
      filtered = output.slice(0, safeK);
    }

    return filtered;
  }

  saveIndex() {
    this.index.write(this.indexPath);

    fs.writeFileSync(
      this.metadataPath,
      JSON.stringify({
        activeDocument: this.activeDocument,
        metadata: this.metadata
      })
    );
  }

  loadIndex() {
    if (fs.existsSync(this.indexPath) && fs.existsSync(this.metadataPath)) {
      try {
        this.index = IndexFlatIP.read(this.indexPath);

        const data = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));

        this.metadata = data.metadata || [];
        this.activeDocument = data.activeDocument || null;

        console.log(`[VectorStore] Loaded: ${this.activeDocument} (${this.index.ntotal()} chunks)`);
      } catch {
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
  }

  getDocCount() {
    return this.index.ntotal();
  }
}

module.exports = new VectorService();