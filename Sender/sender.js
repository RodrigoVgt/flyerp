const Sender = () => {}

const WabaController = require('../controllers/wabaController')

Sender.sendFile = async (file) => {
    try {
       let response
       switch (file.origin) {
           case "10":
               response = await WabaController.sendFile(file, "ten_days")
               break
           case "7":
               response = await WabaController.sendFile(file, "seven_days")
               break
           case "3":
               response = await WabaController.sendFile(file, "three_days")
               break
           case "1":
               response = await WabaController.sendFile(file, "one_day")
               break
           case "0":
               response = await WabaController.sendFile(file, "done")
               break
           case "-1":
               response = await WabaController.sendFile(file, "one_day_after")
               break
           case "-5":
               response = await WabaController.sendFile(file, "five_days_after")
               break
           case "-10":
               response = await WabaController.sendFile(file, "ten_days_after")
               break
           case 'emissao':
               response = await WabaController.sendFile(file, "day")
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

module.exports = Sender