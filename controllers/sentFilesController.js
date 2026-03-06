const SentFiles = require('../models/sent_files')
const FilesToSend = require('../models/files_to_send')
const UserModel = require('../models/user')
const CnpjList = require('../extras/cnpj')
const path = require('path')

const XLSX = require('xlsx')
const fs = require('fs')

const SentFilesController = () => {}

SentFilesController.find = async (req, res) => {
    try {
        const files = await SentFiles.find()
        const sentData = []
        const sentPhones = []
        const sentCnpjList = []
        const notSentCnpjList = [...CnpjList.CNPJ]

        for(const iterator of files){
            if(sentPhones.includes(iterator.phone)) continue
            
            const file = await FilesToSend.findOne({$or: [
                {phone: iterator.phone},
                {phone2: iterator.phone}
            ]})
            if(file){
                sentCnpjList.push(file.customer_cpf_cnpj)
                const cleanCnpj = file.customer_cpf_cnpj.replace(/\D/g, '')
                const index = notSentCnpjList.indexOf(cleanCnpj)
                if (index !== -1) notSentCnpjList.splice(index, 1)
                sentPhones.push(iterator.phone)

                sentData.push({
                    name: iterator.name,
                    phone: iterator.phone,
                    sent_at: new Date(iterator.sent_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}),
                    customer_cpf_cnpj: file.customer_cpf_cnpj
                })
            }
        }

        await generateXlsxFiles(sentData, notSentCnpjList)

        return res.status(200).json(files)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

SentFilesController.findFailedSurveyUsers = async () => {
    const templates = ['utility_survey_1', 'survey_2']
    const failedRows = await SentFiles.find({
        template: { $in: templates },
        status: 'failed'
    })
        .sort({ sent_at: -1 })
        .select('name phone template status sent_at messageId')
        .lean()

    const failedUsersByTemplate = {
        utility_survey_1: [],
        survey_2: []
    }

    const seenByTemplateAndPhone = new Set()
    for (const row of failedRows) {
        if (!row.phone || !row.template) continue
        const key = `${row.template}:${row.phone}`
        if (seenByTemplateAndPhone.has(key)) continue
        seenByTemplateAndPhone.add(key)

        failedUsersByTemplate[row.template].push({
            name: row.name || '',
            phone: row.phone,
            status: row.status,
            last_failed_at: row.sent_at || null,
            messageId: row.messageId || null
        })
    }

    const usersWithAnyFailureByPhone = new Map()
    for (const templateName of templates) {
        for (const user of failedUsersByTemplate[templateName]) {
            if (!usersWithAnyFailureByPhone.has(user.phone)) {
                usersWithAnyFailureByPhone.set(user.phone, {
                    name: user.name || '',
                    phone: user.phone,
                    failed_templates: []
                })
            }
            usersWithAnyFailureByPhone.get(user.phone).failed_templates.push(templateName)
        }
    }

    const uniqueUsersWithAnyFailure = Array.from(usersWithAnyFailureByPhone.values())
    const uniqueUsersWithFailureInBothTemplates = uniqueUsersWithAnyFailure.filter(function (user) {
        return user.failed_templates.includes('utility_survey_1') && user.failed_templates.includes('survey_2')
    })

    const phonesFromBothFailures = uniqueUsersWithFailureInBothTemplates.map(function (user) {
        return user.phone
    })
    const usersFromDb = await UserModel.find({ phone: { $in: phonesFromBothFailures } })
        .select('name phone cpf')
        .lean()
    const usersByPhone = new Map()
    for (const user of usersFromDb) {
        usersByPhone.set(user.phone, user)
    }

    const bothFailuresRowsToExport = uniqueUsersWithFailureInBothTemplates.map(function (user) {
        const userFromDb = usersByPhone.get(user.phone)
        return {
            nome: (userFromDb && userFromDb.name) ? userFromDb.name : (user.name || ''),
            cpf_cnpj: (userFromDb && userFromDb.cpf) ? userFromDb.cpf : '',
            telefone: user.phone
        }
    })
    const outputFile = path.resolve(process.cwd(), 'failed_survey_both_templates.xlsx')
    generateBothTemplatesFailureXlsx(bothFailuresRowsToExport, outputFile)

    return {
        templates,
        totals: {
            utility_survey_1: failedUsersByTemplate.utility_survey_1.length,
            survey_2: failedUsersByTemplate.survey_2.length,
            any_failure_unique_users: uniqueUsersWithAnyFailure.length,
            both_templates_unique_users: uniqueUsersWithFailureInBothTemplates.length
        },
        xlsx_report: {
            filename: 'failed_survey_both_templates.xlsx',
            path: outputFile,
            total_rows: bothFailuresRowsToExport.length
        },
        failed_users_by_template: failedUsersByTemplate,
        users_with_any_failure: uniqueUsersWithAnyFailure,
        users_with_failure_in_both_templates: uniqueUsersWithFailureInBothTemplates
    }
}

async function generateXlsxFiles(sentData, notSentCnpjList) {
  // Monta a planilha de enviados
  const worksheetSent = XLSX.utils.json_to_sheet(sentData)

  // Adiciona coluna dos CNPJs não enviados, se couber na mesma
  const maxLength = Math.max(sentData.length, notSentCnpjList.length)
  const dataWithPending = []

  for (let i = 0; i < maxLength; i++) {
    dataWithPending.push({
      ...sentData[i],
      not_sent_cnpj: notSentCnpjList[i] || ''
    })
  }

  const worksheetCombined = XLSX.utils.json_to_sheet(dataWithPending)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheetCombined, 'Enviados e Não Enviados')

  // Salva o arquivo
  const outputFile = 'sentData.xlsx'
  XLSX.writeFile(workbook, outputFile)

  console.log(`✅ Arquivo gerado: ${outputFile}`)
}

function generateBothTemplatesFailureXlsx(rows, outputFile) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Falha em Ambas')
  XLSX.writeFile(workbook, outputFile)
}

module.exports = SentFilesController
