const mongoose = require('../database/db');

const SentFiles = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    sent_at: {
        type: Date,
        default: Date.now,
    },
    messageId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('SentFiles', SentFiles);