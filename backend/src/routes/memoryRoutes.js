const express = require('express');
const { addMemory, queryMemory } = require('../controllers/memoryController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add-memory', requireAuth, addMemory);
router.get('/query-memory', requireAuth, queryMemory);

module.exports = router;
