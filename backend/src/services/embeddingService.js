const { genAI } = require('../utils/geminiClient');

/**
 * Generate embeddings using Gemini text-embedding-004 model
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector (768 dimensions)
 */
const generateEmbedding = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

module.exports = {
    generateEmbedding
};
