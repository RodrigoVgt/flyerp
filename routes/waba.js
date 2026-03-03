const express = require('express')
const router = express.Router()
require ('dotenv').config()

const MessageEntry = require('../controllers/MessageEntry')
const SentFiles = require('../models/sent_files')

router.post('/:phone', async function(req, res) {
    try {
        if (!req.body || !req.body.entry || !req.body.entry.length) {
            return res.status(200).send({})
        }

        res.status(200).send({})
        for (const entry of req.body.entry) {
            const changes = entry && entry.changes ? entry.changes : []
            console.log('CHANGES:   ', changes)
            for (const change of changes) {
                const statuses = change.value && change.value.statuses ? change.value.statuses : []
                for (const item of statuses) {
                    try {
                        const messageId = item.id || null
                        if (!messageId) continue

                        const newStatus = item.status || 'unknown'
                        const errorData = item.errors && item.errors[0] ? item.errors[0] : null

                        const updateData = {
                            status: newStatus
                        }

                        if (errorData && errorData.title) {
                            updateData.status = 'failed'
                        }

                        await SentFiles.findOneAndUpdate(
                            { messageId: messageId },
                            { $set: updateData },
                            { sort: { sent_at: -1 } }
                        )
                    } catch (statusErr) {
                        console.log('Erro ao processar status do webhook:', statusErr)
                    }
                }

                const messages = change.value && change.value.messages ? change.value.messages : []
                if (messages.length === 0) {
                    continue
                }

                const message = messages[0] && messages[0].text ? messages[0].text.body || '' : ''
                const sender = messages[0].from || ''

                if(!message || !sender) {
                    continue
                }

                const params = {
                    body: {
                        sender: sender,
                        mensagem: message,
                        fromMe: false
                    },
                    params: {
                        phone: req.params.phone || (change.value && change.value.metadata ? change.value.metadata.display_phone_number : '') || ''
                    }
                }
                await MessageEntry.entry(params)
            }
        }
    } catch (e){
        console.log(e)
        try {
            res.status(200).send({})
        } catch (err) {}
    }
})

router.get('/:phone', async function (req, res) {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    const phone = req.params.phone

    if(phone != process.env.VERIFY_PHONE){
        console.warn('❌ Verificação do webhook falhou')
        res.sendStatus(403)
        return
    }

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('✅ Verificação do webhook aceita')
        res.status(200).send(challenge)
    } else {
        console.warn('❌ Verificação do webhook falhou')
        res.sendStatus(403)
    }
})

module.exports = router
