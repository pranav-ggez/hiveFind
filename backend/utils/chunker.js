/**
 * Improved text chunking with overlap
 * Ensures concepts split between chunks are still retrievable
 */
const chunkText = (text, maxWords = 150, overlap = 30) => {
  const words = text.split(/\s+/);
  const chunks = [];
  
  if (words.length <= maxWords) {
    return [text];
  }

  for (let i = 0; i < words.length; i += (maxWords - overlap)) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    chunks.push(chunk);
    // Break if we've reached the end of the text
    if (i + maxWords >= words.length) break;
  }
  
  return chunks;
};

module.exports = { chunkText };
