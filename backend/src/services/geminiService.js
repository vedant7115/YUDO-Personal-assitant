const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Interact with Groq model to generate a response based on context and query
 * @param {string} query - The user's prompt or question
 * @param {string} context - The retrieved context to ground the response
 * @returns {Promise<string>} - The AI generated answer
 */
const generateResponse = async (query, context) => {
    try {
        const systemPrompt = "You are YUDO, a personal AI assistant with access to user's private memory. Answer using the provided context only.";
        
        const fullPrompt = `${systemPrompt}\n\nContext:\n${context}\n\nUser Query: ${query}`;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: fullPrompt }],
            model: 'llama3-8b-8192',
        });
        
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error generating Groq response:", error);
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
        const prompt = `You are YUDO, a personal AI assistant. 
Perform the user's requested action (summarization, reasoning, or math calculations) based purely on the provided notes context.

Notes:
${notesContext}

User Query: ${query}

Answer clearly and concisely.`;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-8b-8192',
        });
        
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error processing notes with Groq:", error);
        throw error;
    }
};

module.exports = {
    generateResponse,
    processNotes
};

