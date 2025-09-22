const Sender = () => {}

Sender.sendFile = async (file) => {
    try {
        return "Teste de envio"
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = Sender