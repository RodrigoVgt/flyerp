const MessageEntry = () => {}

const gpt = require('./GptController')
const { contactPrompt } = require('../extras/prompts')
const WabaController = require('./wabaController')

/**
 * Processa a entrada de mensagem do whatsapp
 * @param {Object: {
 * body:{
 *  sender: String,
 *  mensagem: String,
 *  fromMe: Boolean
 * },
 * params: {phone: String}}} params - parâmetros da mensagem
 * @returns {Object} - mensagem de processamento
 */
MessageEntry.entry = async function(params){
    try {
        const userMessage = params.body.mensagem

        const validMessage = await gpt.getResponse((contactPrompt + userMessage))

        if(validMessage === -1)
            return { success: true, message: 'Mensagem processada com sucesso' }

        if(validMessage === 1){
            const log = await createGptLog(sender)
            const response =await WabaController.sendContact(params)
            if(!response || log) return { success: false, message: 'Mensagem processada com sucesso' }
            return { success: true, message: 'Mensagem processada com sucesso' }
        }

        return { success: true, message: 'Mensagem processada com sucesso' }
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = MessageEntry