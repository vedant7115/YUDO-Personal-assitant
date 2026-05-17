const express = require('express');
const cors = require('cors');

// Import routes
const documentRoutes = require('./routes/documentRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const noteRoutes = require('./routes/noteRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/agent', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'YUDO Backend is running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
