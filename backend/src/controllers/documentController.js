const { supabase } = require('../utils/supabaseClient');
const { generateEmbedding } = require('../services/embeddingService');
const { generateResponse } = require('../services/geminiService');
const pdfParse = require('pdf-parse');

const uploadDocument = async (req, res) => {
    try {
        const user = req.user;
        const { context, type } = req.body; // e.g. "Bank Statement", "PAN Card"
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}_${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`;

        // Extract Text
        let extractedText = '';
        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer);
            extractedText = pdfData.text;
        } else {
            // Very basic text extraction placeholder for other files/images
            // A real implementation would use Tesseract or Gemini vision capabilities
            extractedText = `Text content of ${file.originalname}`;
        }

        const finalContent = `Context: ${context || type}\nContent:\n${extractedText}`;

        // Generate Embeddings
        // Performance Note: In a production app, we would chunk `finalContent` if it's very large.
        // For simplicity in this demo, we assume the content is reasonably sized.
        const embedding = await generateEmbedding(finalContent);

        // Save to DB
        const { error: dbError } = await supabase.from('embeddings').insert({
            user_id: user.id,
            content: finalContent,
            embedding,
            source_type: 'document',
            file_url: fileUrl,
            context: context || type
        });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return res.status(500).json({ error: 'Failed to save document metadata' });
        }

        res.status(201).json({ message: 'Document uploaded successfully', file_url: fileUrl });
    } catch (error) {
        console.error('uploadDocument error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchDocument = async (req, res) => {
    try {
        const user = req.user;
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const queryEmbedding = await generateEmbedding(query);

        // Search in vector DB
        const { data: matches, error } = await supabase.rpc('match_embeddings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            p_user_id: user.id,
            p_source_type: 'document'
        });

        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: 'Failed to search documents' });
        }

        if (!matches || matches.length === 0) {
            return res.status(200).json({ answer: "I couldn't find relevant documents for your query." });
        }

        // Combine retrieved documents
        const contextText = matches.map(m => m.content).join('\n---\n');

        // Answer via Gemini
        const answer = await generateResponse(query, contextText);

        res.status(200).json({ answer, matches });
    } catch (error) {
        console.error('searchDocument error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    uploadDocument,
    searchDocument
};
