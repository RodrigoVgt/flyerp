const Sender = () => {}

const WabaController = require('../controllers/wabaController')
const User = require('../controllers/user')

Sender.sendFile = async (file) => {
    try {
       let response
       const user = await User.getUser(file.phone ? file.phone : file.phone2)
       if(user && user.block_messages) return true
       switch (file.origin) {
           case "10":
               response = await WabaController.sendFile(buildParams(file, "ten_days"))
               break
           case "5":
               response = await WabaController.sendFile(buildParams(file, "five_days"))
               break
           case "1":
               response = await WabaController.sendFile(buildParams(file, "one_day"))
               break
           case "0":
               response = await WabaController.sendFile(buildParams(file, "done"))
               break
           case "-2":
               response = await WabaController.sendFile(buildParams(file, "two_days_after"))
               break
           case "-7":
               response = await WabaController.sendFile(buildParams(file, "seven_days_after"))
               break
           case 'emissao':
               response = await WabaController.sendFile(buildParams(file, "day"))
               break
           default:
               return null
       }
       return response
    } catch (err) {
        console.log(err)
        return null
    }
}

function buildParams(file, origin){
    const phone = file.phone ? file.phone : file.phone2
    const template_name = origin
    const link = file.link_boleto ? file.link_boleto : file.link_fatura
    const name = file.name
    const payment_date = file.payment_end_date
    const value = "R$" + file.value
    const valueWithNoSymbol = file.value

    switch(origin){
        case 'ten_days':
            return {
                phone,
                template_name,
                toReplace: [
                    payment_date,
                    valueWithNoSymbol,
                    link
                ]
            }
        case 'five_days':
            return {
                phone,
                template_name,
                toReplace: [
                    payment_date,
                    value,
                    link
                ]
            }
        case 'one_day':
            return {
                phone,
                template_name,
                toReplace: [
                    name,
                    value,
                    payment_date,
                    link
                ]
            }
        case 'done':
            return {
                phone,
                template_name,
                toReplace: [
                    link
                ]
            }
        case 'two_days_after':
            return {
                phone,
                template_name,
                toReplace: [
                    payment_date,
                    link
                ]
            }
        case 'seven_days_after':
            return {
                phone,
                template_name,
                toReplace: [
                    link
                ]
            }
        case 'day':
            return { 
                phone,
                template_name,
                toReplace: [
                    name,
                    value,
                    payment_date,
                    link
                ]
            }
        default:
            return null
    }

}

module.exports = Sender