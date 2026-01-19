const express = require('express');
const router = express.Router();
const {
    createDocument,
    getSentDocuments,
    getReceivedDocuments,
    getDocument,
    updateStatus,
    forwardDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all routes

router.route('/').post(createDocument);
router.route('/sent').get(protect, getSentDocuments);
router.route('/received').get(protect, getReceivedDocuments);
router.route('/:id').get(protect, getDocument);
router.route('/:id/status').put(protect, updateStatus);
router.route('/:id/forward').put(protect, forwardDocument);

module.exports = router;
