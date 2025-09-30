const MessageEntry = () => {}


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
        return { success: true, message: 'Mensagem processada com sucesso' }
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = MessageEntry