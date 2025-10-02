const Sender = () => {}

const WabaController = require('../controllers/wabaController')

Sender.sendFile = async (file) => {
    try {
       let response
       switch (file.origin) {
           case 10:
               response = await WabaController.sendFile(file, "ten_days")
           case 7:
               response = await WabaController.sendFile(file, "seven_days")
           case 3:
               response = await WabaController.sendFile(file, "three_days")
           case 1:
               response = await WabaController.sendFile(file, "one_day")
           case 0:
               response = await WabaController.sendFile(file, "done")
           case -1:
               response = await WabaController.sendFile(file, "one_day_after")
           case -5:
               response = await WabaController.sendFile(file, "five_days_after")
           case -10:
               response = await WabaController.sendFile(file, "ten_days_after")
           case 'emissao':
               response = await WabaController.sendFile(file, "day")
           default:
               return null
       }
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = Sender