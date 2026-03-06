const express = require('express')
const router = express.Router()
require ('dotenv').config()

const FilesToSend = require('../models/files_to_send')
const SentFiles = require('../models/sent_files')
const ManualSending = require('../Sender/manual_sending')

const sentFilesController = require('../controllers/sentFilesController')
const userImportController = require('../controllers/userImportController')

router.get('/', async (req, res) => {
    try {
        //rota teste
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/create_mock_data_to_send', async (req, res) => {
    try {
        const phone = req.body.phone
        const name = req.body.name
        const types = req.body.types

        for(const iterator of types){
            await FilesToSend.create({
                customer_id: 2739,
                name,
                phone,
                payment_end_date: "08/10/2025",
                link_boleto: "https://renovaonline.flyerp.com.br/VisualizarFatura.aspx?guid=e42c43fc-a0bc-4917-8c40-72c459337ffe",
                origin: iterator,
                value: (25.000000).toFixed(2).toString().replace('.', ',')
            })
        }

        return res.status(200).json("ok")
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.delete('/files_to_send', async (req, res) => {
    try {
        return res.status(200).json("Nice try bozo")
        await FilesToSend.deleteMany({})
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/sent_files', async (req, res) => {
    try {
        return res.status(200).json("Nice try bozo")
        await SentFiles.deleteMany()
        return res.status(200).json("ok")
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/send_customers', async (req, res) => {
    try {
        const files = await ManualSending.send(req.query.template_name)
        return res.status(200).json(files)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/get_sent_files', async (req, res) => {
    try {
        const files = await sentFilesController.find()
        return res.status(200).json(files)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/failed_survey_templates_users', async (req, res) => {
    try {
        const failedUsers = await sentFilesController.findFailedSurveyUsers()
        return res.status(200).json(failedUsers)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.post('/import_users_nps', async (req, res) => {
    return userImportController.importFromNpsXlsx(req, res)
})

router.post('/resend_failed_template', async (req, res) => {
    try {
        const old_template = req.body ? req.body.old_template : null
        const new_template = req.body ? req.body.new_template : null

        const result = await ManualSending.resendFailedByTemplate(old_template, new_template)
        if (!result.success) {
            return res.status(400).json(result)
        }
        return res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

module.exports = router
