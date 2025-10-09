const mongoose = require('../database/db');

const FilesToSend = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
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
    },
    phone2: {
        type: String,
    },
    status: {
        type: String,
        default: 'abertos'
    },
    payment_start_date: {
        type: String,
    },
    payment_end_date: {
        type: String,
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
    },
    origin: {
        type: String,
        default: null
    },
    customer_cpf_cnpj: {
        type: String,
        default: ""
    },
    value: {
        type: String,
        default: "00,00"
    }
});

module.exports = mongoose.model('FilesToSend', FilesToSend);