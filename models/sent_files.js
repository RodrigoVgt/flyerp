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
        type: String,
    },
    sent_at: {
        type: Date,
        default: Date.now,
    },
    messageId: {
        type: String
    }
});

module.exports = mongoose.model('SentFiles', SentFiles);