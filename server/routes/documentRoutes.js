const express = require('express');
const router = express.Router();
const { 
    createDocument, 
    getSentDocuments, 
    getReceivedDocuments, 
    getDocument, 
    updateStatus 
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all routes

router.route('/').post(createDocument);
router.route('/sent').get(getSentDocuments);
router.route('/inbox').get(getReceivedDocuments);
router.route('/:id').get(getDocument);
router.route('/:id/status').put(updateStatus);

module.exports = router;
