const MessageEntry = () => {}

const gpt = require('./GptController')
const WabaController = require('./wabaController')
const User = require('./user')
const Messages = require('../extras/messages')

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
        const sender = params.body.sender

        const user = await getUser(sender)

        if(user && user.block_messages){
            if(userMessage.toLowerCase().includes("voltar")){
                await User.updateUser({ phone: sender, block_messages: false, user_code: user.user_code, name: user.name })
                await WabaController.sendNoTemplateMessage({phone: sender, message: Messages.welcomeMessage})
                return { success: true, message: 'Mensagem processada com sucesso' }
            }
            return { success: true, message: 'Mensagem processada com sucesso' }
        }

        const validMessage = await gpt.getResponse(userMessage, sender)

        if(validMessage === '1' || validMessage === '-1'){
            await WabaController.sendNoTemplateMessage({phone: sender, message: Messages.contactMessage})
            const response =await WabaController.sendContact({
                phone: sender
            })
            const log = await User.updateUser({ phone: sender, block_messages: false, user_code: user?.user_code, name: user?.name })
            if(!response || log) return { success: false, message: 'Mensagem processada com sucesso' }
            return { success: true, message: 'Mensagem processada com sucesso' }
        }
        if(validMessage == '0'){
            await WabaController.sendNoTemplateMessage({phone: sender, message: Messages.blockMessage})
            if(!user) {
                await createUser(sender)
                return { success: true, message: 'Mensagem processada com sucesso' }
            }
            if(user && user.block_messages){
                return { success: true, message: 'Mensagem processada com sucesso' }
            }
            await blockUser(sender)
            return { success: true, message: 'Mensagem processada com sucesso' }
        }

        return { success: true, message: 'Mensagem processada com sucesso' }
    } catch (err) {
        console.log(err)
        return null
    }
}

async function getUser(sender){
    try {
        const customer = await User.getUser(sender)
        return customer
    } catch (err) {
        console.log(err)
        return null
    }
}

async function createUser(sender){
    try {
        const user = await User.createUser(sender)
        return user
    } catch (err) {
        console.log(err)
        return null
    }
}

async function blockUser(sender){
    try {
        const user = await User.blockUser(sender)
        return user
    } catch (err) {
        console.log(err)
        return null
    }
}
module.exports = MessageEntry