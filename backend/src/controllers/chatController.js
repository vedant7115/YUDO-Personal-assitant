const { supabase } = require('../utils/supabaseClient');
const { generateEmbedding } = require('../services/embeddingService');
const { generateResponse } = require('../services/geminiService');

const chat = async (req, res) => {
    try {
        const user = req.user;
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // 1. Convert query to embedding
        const queryEmbedding = await generateEmbedding(query);

        // 2. Search across documents, memory, and notes (source_type = null for all)
        const { data: matches, error } = await supabase.rpc('match_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: 5,
            p_user_id: user.id,
            p_source_type: null // null implies searching all source types
        });

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: 'Failed to search across data' });
        }

        // 3. Combine top results
        let contextText = '';
        if (matches && matches.length > 0) {
            contextText = matches.map(m => `[Source: ${m.source_type}] ${m.content}`).join('\n---\n');
        } else {
            contextText = "No relevant context found in user's data.";
        }

        // 4. Send context + query to Gemini
        const answer = await generateResponse(query, contextText);

        res.status(200).json({ answer, contextUsed: matches });
    } catch (error) {
        console.error('chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    chat
};
