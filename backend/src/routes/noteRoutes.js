const express = require('express');
const { addNote, queryNotes } = require('../controllers/noteController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add-note', requireAuth, addNote);
router.get('/query-notes', requireAuth, queryNotes);

module.exports = router;
