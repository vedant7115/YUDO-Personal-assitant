const { supabase } = require('../utils/supabaseClient');
const { generateEmbedding } = require('../services/embeddingService');
const { processNotes } = require('../services/geminiService');

const addNote = async (req, res) => {
    try {
        const user = req.user;
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({ error: 'Note content is required' });
        }

        const embedding = await generateEmbedding(note);

        const { error: dbError } = await supabase.from('embeddings').insert({
            user_id: user.id,
            content: note,
            embedding,
            source_type: 'note'
        });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return res.status(500).json({ error: 'Failed to save note' });
        }

        res.status(201).json({ message: 'Note added successfully' });
    } catch (error) {
        console.error('addNote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const queryNotes = async (req, res) => {
    try {
        const user = req.user;
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const queryEmbedding = await generateEmbedding(query);

        const { data: matches, error } = await supabase.rpc('match_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.4,
            match_count: 5,
            p_user_id: user.id,
            p_source_type: 'note'
        });

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: 'Failed to search notes' });
        }

        const notesContext = matches && matches.length > 0 
            ? matches.map(m => m.content).join('\n---\n') 
            : '';

        if (!notesContext) {
            return res.status(200).json({ answer: "I couldn't find relevant notes." });
        }

        // Use Gemini for summarization, reasoning or math based on notes
        const answer = await processNotes(query, notesContext);

        res.status(200).json({ answer, matches });
    } catch (error) {
        console.error('queryNotes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addNote,
    queryNotes
};
