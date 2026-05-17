const express = require('express');
const { uploadDocument, searchDocument } = require('../controllers/documentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload-document', requireAuth, upload.single('file'), uploadDocument);
router.get('/search-document', requireAuth, searchDocument);

module.exports = router;
