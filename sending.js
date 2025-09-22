const schedule = require('node-schedule')

const Files = require('./controllers/files')

const FileToSend = require('./models/files_to_send')
const SentFiles = require('./models/sent_files')

const Sender = require('./sender')

schedule.scheduleJob('0 4 * * *', async () => {
    try {
        const tenDaysDate = createDate(10)
        const sevenDaysDate = createDate(7)
        const threeDaysDate = createDate(3)
        const oneDayDate = createDate(1)
        const dayDate = new Date()
        const oneDayAfterDate = createDate(-1)
        const fiveDaysAfterDate = createDate(-5)
        const tenDaysAfterDate = createDate(-10)

        const [tenDays, sevenDays, threeDays, oneDay, day, oneDayAfter, fiveDaysAfter, tenDaysAfter] = await Promise.all([
            Files.getFilesToSend(tenDaysDate),
            Files.getFilesToSend(sevenDaysDate),
            Files.getFilesToSend(threeDaysDate),
            Files.getFilesToSend(oneDayDate),
            Files.getFilesToSend(dayDate),
            Files.getFilesToSend(oneDayAfterDate),
            Files.getFilesToSend(fiveDaysAfterDate),
            Files.getFilesToSend(tenDaysAfterDate),
        ])

        const filesWithDate = [
            ...tenDays.map(file => ({ ...file, origin: 10 })),
            ...sevenDays.map(file => ({ ...file, origin: 7 })),
            ...threeDays.map(file => ({ ...file, origin: 3 })),
            ...oneDay.map(file => ({ ...file, origin: 1 })),
            ...day.map(file => ({ ...file, origin: 0 })),
            ...oneDayAfter.map(file => ({ ...file, origin: -1 })),
            ...fiveDaysAfter.map(file => ({ ...file, origin: -5 })),
            ...tenDaysAfter.map(file => ({ ...file, origin: -10 }))
        ]
        
        for(const iterator of filesWithDate){
            try {
                await createFileToSend(iterator)
            } catch (err) {
                console.log(err)
            }
        }

    }   catch (err) {
        console.log(err)
    }
})

schedule.scheduleJob('0 8 * * *', async () => {
    try {
        const filesToSend = await Files.getDayFiles()

        for(const iterator of filesToSend){
            try {
                const response = await Sender.sendFile(iterator)
                if(response)
                    await iterator.update({ sent: true, sent_at: new Date() })
                    await new SentFiles({ name: iterator.name, phone: iterator.phone, status: iterator.status, sent_at: new Date() }).save()
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
        const customer = await Files.getCustomersToSend(file.codigo_cliente)

        const newFile = new FileToSend({
            customer_id: file.codigo_cliente,
            name: file.nome_cliente,
            phone: customer[0].telefone,
            phone2: customer[0].telefone2,
            status: file.url_pagamento ? 'abertos' : 'pagos',
            payment_start_date: file.data_emissao,
            payment_end_date: file.data_vencimento,
            sent: false,
            origin: file.origin,
            link_boleto: file.link_boleto,
            link_fatura: file.link_fatura,
            url_pagamento: file.url_pagamento
        })

        await newFile.save()
    } catch (err) {
        console.log(err)
    }
}

function createDate(days){
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}
