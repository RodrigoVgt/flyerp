const WabaController = () => {}

require('dotenv').config()

WabaController.sendFile = async (file, type) => {
    try {
        const params = {
            phone: file.phone ? file.phone : file.phone2,
            link: file.link_boleto ? file.link_boleto : file.link_fatura,
            name: file.name
        }
        const config = await buildWabaMessage(params, type)

        const response = await sendWabaMessage(config)        

        return response
    } catch (err) {
        console.log(err)
        return {
            success: false,
            message: err
        }
    }
}

WabaController.sendNoParamMessage = async (data) => {
    try {
        const config = await buildNoParamWabaMessage(data)
        const response = await sendWabaMessage(config)
        return response
    } catch (err) {
        console.log(err)
        return {
            success: false,
            message: err
        }
    }
}

WabaController.sendContact = async (file) => {
    try {
        const phone = file.phone ? file.phone : file.phone2
        const config = await buildWabaContact({phone})
        const response = await sendWabaMessage(config)
        return response
    } catch (err) {
        console.log(err)
        return {
            success: false,
            message: err
        }
    }
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
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.WABA_ACCESS_TOKEN
            },
            body: JSON.stringify(config)
        })
        if(response.status != 200)
            throw new Error(response.statusText ? response.statusText : response.data.error.message)
        
        return {
            success: true,
            message: response
        }
    } catch (err) {
        console.log(err)
        return {
            success: false,
            message: err
        }
    }
}

async function buildWabaMessage(params, type){
    const config = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": params.phone,
        "type": "template",
        "template": {
            "name": type,
            "language": {
                "code": "pt_BR"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": params.name
                        },
                        {
                            "type": "text",
                            "text": params.link
                        }
                    ]
                }
            ]
        }
    }

    return config
}

async function buildNoParamWabaMessage(data){
        const config = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": data.phone,
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

async function buildWabaContact(params){
    const config = {
        "messaging_product": "whatsapp",
        "to": params.phone,
        "type": "contacts",
        "contacts": [
            {
                "name": {
                    "formatted_name": process.env.CONTACT_FULL_NAME,
                    "first_name": process.env.CONTACT_FIRST_NAME,
                    "last_name": process.env.CONTACT_LAST_NAME
                },
                "phones": [
                    {
                        "phone": process.env.CONTACT_PHONE,
                        "wa_id": process.env.CONTACT_WABA_ID,
                        "type": "WORK"
                    }
                ],
            }
        ]
    }

    return config
}

module.exports = WabaController