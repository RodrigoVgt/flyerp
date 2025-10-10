const ManualSending = () => {}

const { default: axios } = require('axios')
require('dotenv').config()

// 1. Importa o módulo de File System para ler arquivos (necessário no Node.js)
const { readFile } = require('fs/promises')

const SentFiles = require('../models/sent_files')

/**
 * Função para processar a string CSV e extrair os campos necessários
 * @param {string} csvString - O conteúdo completo do arquivo CSV em formato string
 * @returns {Array<Object>} Um array de objetos com as chaves cnpj, name e phone
 */
const processarCSV = (csvString) => {
  // Divide a string em linhas
    try {
        const linhas = csvString.trim().split('\n')

        // A primeira linha são os cabeçalhos (headers)
        // Nota: Usa split(',') e não manipula vírgulas dentro de aspas (pode ser problema em CSVs complexos)
        const headers = linhas[0].split(';')

        // Mapeamento dos cabeçalhos para os nomes das propriedades
        const indexCnpj = headers.indexOf('CNPJ Cliente')
        const indexNomeFantasia = headers.indexOf('Nome Fantasia Cliente')
        const indexTelefone = headers.indexOf('Telefone Final')

        if (indexCnpj === -1 || indexNomeFantasia === -1 || indexTelefone === -1) {
            console.error('Erro: Um ou mais cabeçalhos necessários não foram encontrados no CSV')
            return []
        }

        // Processa as linhas de dados (a partir da segunda linha)
        const dados = linhas.slice(1).map(linha => {
            const valores = linha.split(';')

            // Retorna o objeto formatado
            return {
            cnpj: valores[indexCnpj],
            name: valores[indexNomeFantasia],
            phone: valores[indexTelefone]
            }
        })

        return dados
    } catch (error) {
        console.error('Erro ao processar o CSV:', error)
        return []
    }
}

/**
 * Função principal para carregar o arquivo e iniciar o processamento
 */
const carregarEProcessarLista = async () => {
  const filePath = 'customers/list.csv'

  try {
    // Lê o arquivo de forma assíncrona, codificação 'utf-8' para texto
    const fileContent = await readFile(filePath, { encoding: 'utf-8' })
    
    console.log(`Arquivo ${filePath} carregado com sucesso`)

    // Chama a função de processamento
    const dadosClientes = processarCSV(fileContent)
    
    console.log('Total de clientes processados:', dadosClientes.length)

    return dadosClientes
  } catch (error) {
    // Trata erros, como arquivo não encontrado
    if (error.code === 'ENOENT') {
      console.error(`Erro: Arquivo não encontrado no caminho esperado: ${filePath}`)
      console.error('Verifique se a pasta "customers" e o arquivo "list.csv" existem e estão na raiz do projeto')
    } else {
      console.error('Erro ao ler ou processar o arquivo:', error)
    }
    return null
  }
}


ManualSending.send = async () => {
    const data = await carregarEProcessarLista()

    for(const iterator of data){
        try {
            if(!iterator.phone) continue
            const config = await buildNoParamWabaMessage({phone: iterator.phone, template: "announcement"})
            const response = await sendWabaMessage(config)
            await new SentFiles({ name: iterator.name, phone: iterator.phone, sent_at: new Date()}).save()
            await new Promise(resolve => setTimeout(resolve, 3000))
        } catch (err) {
            console.log("Nome: " + iterator.name, "Telefone: " + iterator.phone)
        }
    }

    const done = true
}


async function buildNoParamWabaMessage(data){
    let phone = data.phone.toString().match(/\d/g).join('')
    if(!phone.startsWith('55')) phone = '55' + phone
    if(phone.length < 11) phone = '55' + phone
    const config = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
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


async function sendWabaMessage(config) {
    try {
        if(process.env.TESTING == 'true'){
            return {
                success: true,
                message: config
            }
        }
        const url = `https://graph.facebook.com/${process.env.WABA_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages`
        const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.WABA_ACCESS_TOKEN
            }
        const response = await axios.post(url, JSON.stringify(config), {headers})
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
module.exports = ManualSending