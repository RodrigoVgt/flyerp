const express = require('express')
const router = express.Router()

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

module.exports = router