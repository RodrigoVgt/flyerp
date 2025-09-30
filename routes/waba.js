const express = require('express')
const router = express.Router()
require ('dotenv').config()

const MessageEntry = require('../controllers/MessageEntry')

router.post('/waba/:phone', async function(req, res) {
    try {

        if (!req?.body?.entry?.length || !req.body.entry[0].changes?.length) {
            return res.status(200).send({})
        }

        const change = req.body.entry[0].changes[0]
        const messages = change.value?.messages || []

        if (messages.length === 0) {
            return res.status(200).send({})
        }

        const message = messages[0].text?.body || ''
        const sender = messages[0].from || ''

        if(!message || !sender) {
            return res.status(200).send({})
        }

        const params = {
            body: {
                sender: sender,
                mensagem: message,
                fromMe: false
            },
            params: {
                phone: req.params.phone || req?.body?.entry[0]?.changes[0]?.value?.metadata?.display_phone_number || ''
            }
        }
        const response = await MessageEntry.entry(params)
    
        return res.status(200).send(response)
    } catch (e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/waba/:phone', async function (req, res) {
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