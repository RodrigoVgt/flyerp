const SentFiles = require('../models/sent_files')
const FilesToSend = require('../models/files_to_send')
const CnpjList = require('../extras/cnpj')

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

module.exports = SentFilesController