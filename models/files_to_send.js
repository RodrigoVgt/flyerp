const mongoose = require('mongoose');

const SentFiles = new mongoose.Schema({
    customer_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    phone2: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'abertos'
    },
    payment_start_date: {
        type: Date,
    },
    payment_end_date: {
        type: Date,
    },
    sent: {
        type: Boolean,
        required: true,
        default: false
    },
    link_boleto: {
        type: String,
        default: null
    },
    link_fatura: {
        type: String,
        default: null
    },
    url_pagamento: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('SentFiles', SentFiles);