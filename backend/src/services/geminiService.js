const { genAI } = require('../utils/geminiClient');

/**
 * Interact with Gemini model to generate a response based on context and query
 * @param {string} query - The user's prompt or question
 * @param {string} context - The retrieved context to ground the response
 * @returns {Promise<string>} - The AI generated answer
 */
const generateResponse = async (query, context) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // or gemini-1.5-flash / gemini-1.5-pro
        
        const systemPrompt = "You are YUDO, a personal AI assistant with access to user's private memory. Answer using the provided context only.";
        
        const fullPrompt = `${systemPrompt}\n\nContext:\n${context}\n\nUser Query: ${query}`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating Gemini response:", error);
        throw error;
    }
};

/**
 * Summarize or process notes based on a query
 * @param {string} query - The user's action query
 * @param {string} notesContext - The notes to process
 * @returns {Promise<string>}
 */
const processNotes = async (query, notesContext) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `You are YUDO, a personal AI assistant. 
Perform the user's requested action (summarization, reasoning, or math calculations) based purely on the provided notes context.

Notes:
${notesContext}

User Query: ${query}

Answer clearly and concisely.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error processing notes with Gemini:", error);
        throw error;
    }
};

module.exports = {
    generateResponse,
    processNotes
};
