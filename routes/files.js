const express = require('express');
const router = express.Router();

const SentFiles = require('../models/sent_files'); 

router.get('/', async (req, res) => {
    try {
        console.log("ok")
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

module.exports = router