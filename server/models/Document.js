const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please add a document title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['Letter', 'Memo', 'Circular', 'Approval', 'Report'],
        default: 'Letter'
    },
    priority: {
        type: String,
        enum: ['Normal', 'Urgent', 'High'],
        default: 'Normal'
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.ObjectId, // Could be null if public/circular, but for now specific receiver
        ref: 'User',
        required: [true, 'Please specify a receiver']
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    history: [{
        status: String,
        updatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        comment: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
