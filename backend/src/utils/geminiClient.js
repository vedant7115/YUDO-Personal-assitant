const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing from environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

module.exports = { genAI };
