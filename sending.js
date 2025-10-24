const schedule = require('node-schedule')
require('dotenv').config()

const Files = require('./controllers/files')

const FileToSend = require('./models/files_to_send')
const SentFiles = require('./models/sent_files')

const Sender = require('./Sender/sender')
const User = require('./controllers/user')

const { CNPJ } = require('./extras/cnpj')

schedule.scheduleJob('45 15 * * *', async () => {// lembrar que aqui está -3h, começar em 15:45->12:45
    try {
        const tenDaysDate = createDate(10)
        const fiveDaysDate = createDate(5)
        const oneDayDate = createDate(1)
        const dayDate = new Date()
        const twoDaysAfterDate = createDate(-2)
        const sevenDaysAfterDate = createDate(-7)
        const emissionDate = new Date()

        const tenDays = await Files.getFilesToSend(tenDaysDate)
        const fiveDays = await Files.getFilesToSend(fiveDaysDate)
        const oneDay = await Files.getFilesToSend(oneDayDate)
        const day = await Files.getFilesToSend(dayDate)
        const twoDaysAfter = await Files.getFilesToSend(twoDaysAfterDate)
        const sevenDaysAfter = await Files.getFilesToSend(sevenDaysAfterDate)
        const emission = await Files.getNewEmission(emissionDate)

        const filesWithDate = [
            ...tenDays.map(file => ({ ...file, origin: 10 })),
            ...fiveDays.map(file => ({ ...file, origin: 5 })),
            ...oneDay.map(file => ({ ...file, origin: 1 })),
            ...day.map(file => ({ ...file, origin: 0 })),
            ...twoDaysAfter.map(file => ({ ...file, origin: -2 })),
            ...sevenDaysAfter.map(file => ({ ...file, origin: -7 })),
            ...emission.map(file => ({ ...file, origin: 'emissao' }))
        ]
        
        for(const iterator of filesWithDate){
            try {
                //const contract = await Files.getContract(iterator)
                const validCnpj = validateCnpj(iterator.cpf_cnpj_cliente)
                if(!validCnpj) continue
                const alreadyExists = await Files.alreadyExists(iterator.id, iterator.origin)
                if(alreadyExists) continue
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

schedule.scheduleJob('00 16 * * *', async () => { //começar em 16:00 -> 13:00
    try {
        const filesToSend = await Files.getDayFiles()

        for(const iterator of filesToSend){
            try {
                const response = await Sender.sendFile(iterator)
                if(response)
                    await Files.updateOne(iterator._id, {sent: true})
                    await new SentFiles({ name: iterator.name, phone: iterator.phone, status: iterator.status, sent_at: new Date(), messageId: response.messages ? response?.messages[0]?.id : null}).save()
                    await new Promise(resolve => setTimeout(resolve, 3000))
            } catch (err) {
                console.log(err)
            }
        }

        const done = true
    } catch (err) {
        console.log(err)
    }
})

async function createFileToSend(file){
    try {
        const customer = await Files.getCustomersToSend(file.codigo_cliente)

        const validCustomer = await validateCustomer(customer)
        if (!validCustomer) return

        const newFile = new FileToSend({
            id: file.id,
            customer_id: file.codigo_cliente,
            customer_cpf_cnpj: file.cpf_cnpj_cliente,
            name: file.nome_cliente,
            phone: customer.contato_telefone ? customer.contato_telefone : customer.telefone,
            phone2: customer.telefone2,
            status: file.url_pagamento ? 'pagos' : 'abertos',
            payment_start_date: file.data_emissao,
            payment_end_date: file.data_vencimento,
            sent: false,
            origin: file.origin,
            link_boleto: file.link_boleto,
            link_fatura: file.link_fatura,
            url_pagamento: file.url_pagamento,
            value: file.valor?.toFixed(2).toString().replace('.', ',') || "*Valor não informado*"
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

function validateCnpj(cnpj){
    try {
        const clean = clearCNPJ(cnpj)
        return CNPJ.includes(clean)
    } catch (err) {
        console.log(err)
        return false
    }
}

function clearCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '')
}

function createDate(days){
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}
