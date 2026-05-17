const multer = require('multer');

// Use memory storage to process file before uploading to Supabase
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = { upload };
