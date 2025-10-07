const schedule = require('node-schedule')
require('dotenv').config()

const Files = require('./controllers/files')

const FileToSend = require('./models/files_to_send')
const SentFiles = require('./models/sent_files')

const Sender = require('./Sender/sender')
const User = require('./controllers/user')

schedule.scheduleJob('00 12 * * *', async () => {// lembrar que aqui está -3h
    try {
        const tenDaysDate = createDate(10)
        const sevenDaysDate = createDate(7)
        const threeDaysDate = createDate(3)
        const oneDayDate = createDate(1)
        const dayDate = new Date()
        const oneDayAfterDate = createDate(-1)
        const fiveDaysAfterDate = createDate(-5)
        const tenDaysAfterDate = createDate(-10)
        const emissionDate = new Date()

        const tenDays = await Files.getFilesToSend(tenDaysDate)
        const sevenDays = await Files.getFilesToSend(sevenDaysDate)
        const threeDays = await Files.getFilesToSend(threeDaysDate)
        const oneDay = await Files.getFilesToSend(oneDayDate)
        const day = await Files.getFilesToSend(dayDate)
        const oneDayAfter = await Files.getFilesToSend(oneDayAfterDate)
        const fiveDaysAfter = await Files.getFilesToSend(fiveDaysAfterDate)
        const tenDaysAfter = await Files.getFilesToSend(tenDaysAfterDate)
        const emission = await Files.getNewEmission(emissionDate)

        const filesWithDate = [
            ...tenDays.map(file => ({ ...file, origin: 10 })),
            ...sevenDays.map(file => ({ ...file, origin: 7 })),
            ...threeDays.map(file => ({ ...file, origin: 3 })),
            ...oneDay.map(file => ({ ...file, origin: 1 })),
            ...day.map(file => ({ ...file, origin: 0 })),
            ...oneDayAfter.map(file => ({ ...file, origin: -1 })),
            ...fiveDaysAfter.map(file => ({ ...file, origin: -5 })),
            ...tenDaysAfter.map(file => ({ ...file, origin: -10 })),
            ...emission.map(file => ({ ...file, origin: 'emissao' }))
        ]
        
        for(const iterator of filesWithDate){
            try {
                await createFileToSend(iterator)
            } catch (err) {
                console.log(err)
            }
        }

        const done = true
    }   catch (err) {
        console.log(err)
    }
})

schedule.scheduleJob('00 13 * * *', async () => { //lembrar que aqui está -3h, se colocar pra enviar as 8, vai enviar as 5h da manha!
    try {
        const filesToSend = await Files.getDayFiles()

        for(const iterator of filesToSend){
            try {
                const response = await Sender.sendFile(iterator)
                if(response)
                    await Files.updateOne(iterator._id, {sent: true})
                    await new SentFiles({ name: iterator.name, phone: iterator.phone, status: iterator.status, sent_at: new Date(), messageId: response.messages ? response?.messages[0]?.id : null}).save()
            } catch (err) {
                console.log(err)
            }
        }

    } catch (err) {
        console.log(err)
    }
})

async function createFileToSend(file){
    try {
        if(file.nome_cliente !== "Vinicius Picoli" || file.nome_cliente !== "Ivanor Truccolo") return
        const customer = await Files.getCustomersToSend(file.codigo_cliente, file.token)

        const validCustomer = await validateCustomer(customer)
        if (!validCustomer) return

        const newFile = new FileToSend({
            customer_id: file.codigo_cliente,
            name: file.nome_cliente,
            phone: customer.telefone,
            phone2: customer.telefone2,
            status: file.url_pagamento ? 'pagos' : 'abertos',
            payment_start_date: file.data_emissao,
            payment_end_date: file.data_vencimento,
            sent: false,
            origin: file.origin,
            link_boleto: file.link_boleto,
            link_fatura: file.link_fatura,
            url_pagamento: file.url_pagamento,
            token: file.token
        })

        await newFile.save()
    } catch (err) {
        console.log(err)
    }
}

async function validateCustomer(customer){
    try {
        if(!customer) return false
        if(!customer.telefone && !customer.telefone2) return false

        const phone = customer.telefone ? customer.telefone : customer.telefone2
        const formattedPhone = phone.replace(/\D/g, '')

        const customerExists = await User.getUser(formattedPhone)
        if(!customerExists) return true

        if(customerExists && !customerExists.name)
            await User.updateUser({
                name: customer.nome_fantasia ? customer.nome_fantasia : customer.razao_social,
                phone: formattedPhone,
                block_messages: customerExists.block_messages,
                user_code: customer.codigo
            })

        if(customerExists.block_messages) return false

        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

function createDate(days){
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}
