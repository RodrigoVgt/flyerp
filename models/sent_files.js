const mongoose = require('mongoose');

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
});

module.exports = mongoose.model('SentFiles', SentFiles);