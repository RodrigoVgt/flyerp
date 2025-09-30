const express = require('express')
const router = express.Router()
require ('dotenv').config()

const FilesToSend = require('../models/files_to_send')
const SentFiles = require('../models/sent_files')

const Files = require('../controllers/files')

router.get('/get_files', async (req, res) => {
    try {
        const fileList = await Files.getFilesToSend(req, res)
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/get_customers', async (req, res) => {
    try {
        const customerList = await Files.getCustomersToSend(req, res)
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/', async (req, res) => {
    try {
        //rota teste
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/files_to_send', async (req, res) => {
    try {
        await FilesToSend.deleteMany({})
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/sent_files', async (req, res) => {
    try {
        await SentFiles.deleteMany()
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router