const { supabase } = require('../utils/supabaseClient');
const { generateEmbedding } = require('../services/embeddingService');
const { generateResponse } = require('../services/geminiService');

const addMemory = async (req, res) => {
    try {
        const user = req.user;
        const { memory } = req.body; // e.g. "I have a dentist appointment tomorrow at 10 AM"

        if (!memory) {
            return res.status(400).json({ error: 'Memory content is required' });
        }

        const embedding = await generateEmbedding(memory);

        const { error: dbError } = await supabase.from('embeddings').insert({
            user_id: user.id,
            content: memory,
            embedding,
            source_type: 'memory'
        });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return res.status(500).json({ error: 'Failed to save memory' });
        }

        res.status(201).json({ message: 'Memory added successfully' });
    } catch (error) {
        console.error('addMemory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const queryMemory = async (req, res) => {
    try {
        const user = req.user;
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const queryEmbedding = await generateEmbedding(query);

        const { data: matches, error } = await supabase.rpc('match_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Lower threshold for memories which might be short
            match_count: 5,
            p_user_id: user.id,
            p_source_type: 'memory'
        });

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: 'Failed to search memory' });
        }

        const contextText = matches && matches.length > 0 
            ? matches.map(m => m.content).join('\n') 
            : 'No relevant memories found.';

        const answer = await generateResponse(query, contextText);

        res.status(200).json({ answer, matches });
    } catch (error) {
        console.error('queryMemory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addMemory,
    queryMemory
};
