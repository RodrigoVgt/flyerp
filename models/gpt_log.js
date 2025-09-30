const mongoose = require('../database/db');

const GptLog = new mongoose.Schema({
    user_message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    entry_tokens: {
        type: Number,
        required: true
    },
    response_tokens: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('GptLog', GptLog);