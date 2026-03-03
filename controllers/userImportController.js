const path = require('path')
const XLSX = require('xlsx')

const UserModel = require('../models/user')

const UserImportController = () => {}

function onlyDigits(value) {
    if (value === undefined || value === null) return ''
    return String(value).replace(/\D/g, '')
}

function getPriorityPhone(row) {
    const phone =
        row['Telefone Whatsapp'] ||
        row['Telefone'] ||
        row['Telefone 2'] ||
        ''

    return onlyDigits(phone)
}

UserImportController.importFromNpsXlsx = async function (req, res) {
    try {
        const filePath = path.resolve(process.cwd(), 'Cadastro-para-nps.xlsx')
        const requestedSheet = req.body && req.body.sheetName ? req.body.sheetName : null
        const dryRunFromBody = req.body && req.body.dryRun !== undefined ? req.body.dryRun : null
        const dryRunFromQuery = req.query && req.query.dryRun !== undefined ? req.query.dryRun : null
        const dryRunRaw = dryRunFromBody !== null ? dryRunFromBody : dryRunFromQuery
        const dryRun = String(dryRunRaw).toLowerCase() === 'true' || String(dryRunRaw) === '1'

        const workbook = XLSX.readFile(filePath)
        const sheetName = requestedSheet || 'NPS'

        if (!workbook.SheetNames.includes(sheetName)) {
            return res.status(400).json({
                message: `A aba "${sheetName}" não foi encontrada no arquivo.`,
                availableSheets: workbook.SheetNames
            })
        }

        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        let inserted = 0
        let updated = 0
        let skippedNoPhone = 0
        let skippedDuplicatesInFile = 0

        const seenPhones = new Set()
        const operations = []

        for (const row of rows) {
            const phone = getPriorityPhone(row)
            if (!phone) {
                skippedNoPhone += 1
                continue
            }

            if (seenPhones.has(phone)) {
                skippedDuplicatesInFile += 1
                continue
            }
            seenPhones.add(phone)

            const name = String(row['Razão Social'] || '').trim()
            const cpf = onlyDigits(row['CPF/CNPJ'])
            const userCodeRaw = row['Código']
            const user_code = userCodeRaw === undefined || userCodeRaw === null
                ? ''
                : String(userCodeRaw).trim()

            const existing = await UserModel.exists({ phone })
            if (existing) {
                updated += 1
            } else {
                inserted += 1
            }

            const setData = {}
            if (name) setData.name = name
            if (cpf) setData.cpf = cpf
            const updateDoc = {
                $setOnInsert: {
                    phone,
                    user_code,
                    block_messages: false
                }
            }
            if (Object.keys(setData).length > 0) {
                updateDoc.$set = setData
            }

            operations.push({
                updateOne: {
                    filter: { phone },
                    update: updateDoc,
                    upsert: true
                }
            })
        }

        if (!dryRun && operations.length > 0) {
            await UserModel.bulkWrite(operations, { ordered: false })
        }

        return res.status(200).json({
            message: dryRun
                ? 'Dry run finalizado com sucesso. Nenhum dado foi gravado.'
                : 'Importação finalizada com sucesso.',
            dryRun,
            filePath,
            sheetName,
            totalRowsRead: rows.length,
            processed: operations.length,
            inserted,
            updated,
            skippedNoPhone,
            skippedDuplicatesInFile
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

module.exports = UserImportController
