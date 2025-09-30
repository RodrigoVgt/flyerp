const mongoose = require('../database/db');

const User = new mongoose.Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
        required: true
    },
    user_code: {
        type: String,
    },
    block_messages: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', User);