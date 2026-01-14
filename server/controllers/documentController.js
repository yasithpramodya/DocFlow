const Document = require('../models/Document');
const User = require('../models/User');

// Generate unique tracking ID
const generateTrackingId = () => {
    return 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
    try {
        const { title, description, type, priority, receiverEmail } = req.body;

        // Find receiver by email
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ success: false, error: 'Receiver email not found' });
        }

        const trackingId = generateTrackingId();

        const document = await Document.create({
            trackingId,
            title,
            description,
            type,
            priority,
            sender: req.user.id,
            receiver: receiver._id,
            history: [{
                status: 'Pending',
                updatedBy: req.user.id,
                comment: 'Document Created'
            }]
        });

        res.status(201).json({ success: true, data: document });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get documents sent by me (Outbox)
// @route   GET /api/documents/sent
// @access  Private
exports.getSentDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ sender: req.user.id })
            .populate('receiver', 'email name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get documents received by me (Inbox)
// @route   GET /api/documents/inbox
// @access  Private
exports.getReceivedDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ receiver: req.user.id })
            .populate('sender', 'email name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('sender', 'email name')
            .populate('receiver', 'email name')
            .populate('history.updatedBy', 'email name');

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Ensure user is related to document
        if (document.sender.toString() !== req.user.id && document.receiver.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
    try {
        const { status, comment } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Only receiver can approve/review (or sender depending on flow, but usually receiver acts)
        // For simplicity, allow receiver to change status
        if (document.receiver.toString() !== req.user.id) {
             return res.status(401).json({ success: false, error: 'Not authorized to update status' });
        }

        document.status = status;
        document.history.push({
            status,
            updatedBy: req.user.id,
            comment: comment || `Status updated to ${status}`
        });

        await document.save();

        res.status(200).json({ success: true, data: document });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
