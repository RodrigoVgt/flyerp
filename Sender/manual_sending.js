const ManualSending = () => {}

const { default: axios } = require('axios')
require('dotenv').config()

const SentFiles = require('../models/sent_files')
const UserModel = require('../models/user')

/**
 * Função principal para carregar os contatos da base de usuários
 */
const carregarEProcessarLista = async () => {
  try {
    const dadosClientes = await UserModel.find({
        block_messages: { $ne: true },
        phone: { $exists: true, $ne: '' }
    })
    .select('name phone cpf user_code')
    .lean()

    console.log('Total de clientes carregados da base:', dadosClientes.length)

    return dadosClientes
  } catch (error) {
    console.error('Erro ao carregar usuários da base:', error)
    return []
  }
}


ManualSending.send = async (template_name) => {
    const data = await carregarEProcessarLista()
    if (!Array.isArray(data) || data.length === 0) {
        return []
    }

    for(const iterator of data){
        try {
            if(!iterator.phone) continue
            const config = await buildNoParamWabaMessage({phone: iterator.phone, template: template_name})
            const response = await sendWabaMessage(config)
            if (!response.success) {
                console.log('Falha no envio:', {
                    name: iterator.name,
                    phone: iterator.phone,
                    details: response.message
                })
                continue
            }
            const messageId = response && response.message && response.message.messages && response.message.messages[0]
                ? response.message.messages[0].id
                : null
            await new SentFiles({
                name: iterator.name,
                phone: iterator.phone,
                sent_at: new Date(),
                template: template_name,
                status: 'accepted',
                messageId
            }).save()
            await new Promise(resolve => setTimeout(resolve, 3000))
        } catch (err) {
            console.log("Nome: " + iterator.name, "Telefone: " + iterator.phone)
        }
    }

    const done = true
}


async function buildNoParamWabaMessage(data){
    let phone = data.phone.toString().match(/\d/g).join('')
    if(!phone.startsWith('55')) phone = '55' + phone
    const config = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "template",
        "template": {
            "name": data.template,
            "language": {
                "code": "pt_BR"
            },
        }
    }

    return config
}


async function sendWabaMessage(config) {
    try {
        if(process.env.TESTING == 'true'){
            return {
                success: true,
                message: config
            }
        }
        const url = `https://graph.facebook.com/${process.env.WABA_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages`
        const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.WABA_ACCESS_TOKEN
            }
        const response = await axios.post(url, config, { headers })
        if(response.status != 200)
            throw new Error(response.statusText ? response.statusText : response.data.error.message)

        const messageId = response
            && response.data
            && response.data.messages
            && response.data.messages[0]
            ? response.data.messages[0].id
            : null

        if (!messageId) {
            return {
                success: false,
                message: {
                    reason: 'API retornou 200, mas sem message id',
                    response: response.data
                }
            }
        }
        
        return {
            success: true,
            message: response.data
        }
    } catch (err) {
        const details = err && err.response && err.response.data ? err.response.data : err.message
        console.log('Erro no envio WABA:', details)
        return {
            success: false,
            message: details
        }
    }
}
module.exports = ManualSending
