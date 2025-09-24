const Sender = () => {}

const WabaController = require('../controllers/wabaController')

Sender.sendFile = async (file) => {
    try {
       let response
       switch (file.origin) {
           case 10:
               response = await WabaController.sendFile(file, "tenDays")
           case 7:
               response = await WabaController.sendFile(file, "sevenDays")
           case 3:
               response = await WabaController.sendFile(file, "threeDays")
           case 1:
               response = await WabaController.sendFile(file, "oneDay")
           case 0:
               response = await WabaController.sendFile(file, "day")
           case -1:
               response = await WabaController.sendFile(file, "oneDayAfter")
           case -5:
               response = await WabaController.sendFile(file, "fiveDaysAfter")
           case -10:
               response = await WabaController.sendFile(file, "tenDaysAfter")
           case 'emissao':
               response = await WabaController.sendFile(file, "emissao")
           default:
               return null
       }
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = Sender