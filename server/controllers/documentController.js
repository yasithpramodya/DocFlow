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

// @desc    Get documents sent or handled by me (Outbox)
// @route   GET /api/documents/sent
// @access  Private
exports.getSentDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            $or: [
                { sender: req.user.id },
                { "history.updatedBy": req.user.id }
            ]
        })
        .populate('sender', 'email name')
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
            .populate('receiver', 'email name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('sender', 'name email department')
            .populate('receiver', 'name email department')
            .populate('history.updatedBy', 'name email department');

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Access Control: Sender, Receiver, OR anyone in the history
        const isSender = document.sender && document.sender._id.toString() === req.user.id.toString();
        const isReceiver = document.receiver && document.receiver._id.toString() === req.user.id.toString();
        const isInHistory = document.history.some(h => h.updatedBy && h.updatedBy._id && h.updatedBy._id.toString() === req.user.id.toString());

        if (!isSender && !isReceiver && !isInHistory) {
            return res.status(401).json({ success: false, error: 'Not authorized to view this document' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, comment } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Only receiver can update status
        if (document.receiver.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this document' });
        }

        document.status = status;
        document.history.push({
            status,
            updatedBy: req.user.id,
            comment
        });

        await document.save();

        res.status(200).json({ success: true, data: document });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Forward document
// @route   PUT /api/documents/:id/forward
// @access  Private
exports.forwardDocument = async (req, res, next) => {
    try {
        const { receiverEmail, comment } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // Only current receiver can forward
        if (document.receiver.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to forward this document' });
        }

         const newReceiver = await User.findOne({ email: receiverEmail });
         if (!newReceiver) {
             return res.status(404).json({ success: false, error: 'Receiver user not found' });
         }
         
         if (newReceiver._id.toString() === req.user.id) {
             return res.status(400).json({ success: false, error: 'Cannot forward to yourself' });
         }

        // Update document
        document.receiver = newReceiver._id;
        document.status = 'Pending'; // Reset to Pending for the new receiver
        document.history.push({
            status: 'Forwarded',
            updatedBy: req.user.id,
            comment: `Forwarded to ${newReceiver.name} (${newReceiver.department}). ${comment || ''}`
        });

        await document.save();

        res.status(200).json({ success: true, data: document });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
