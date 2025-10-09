const Files = () => {}

require('dotenv').config()
const FilesToSend = require('../models/files_to_send')

const axios = require('axios')

Files.getFilesToSend = async (date) => {
    try {
      const fileList = await fetchAllRecords(date)

      return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getNewEmission = async (date) => {
    try {
        const fileList = await fetchDayRecords(date)

        return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getCustomersToSend = async (id, token) => {
    try {
        const customerList = await getCustomer(id, token)
        return customerList
    } catch (err) {
      console.log(err + id)
      return null
    }
}

Files.getDayFiles = async function () {
  try {
    return await FilesToSend.find({sent: false})
  } catch (err) {
    console.log(err)
    return null
  }
}

Files.updateOne = async function (id, data) {
  try {
    return await FilesToSend.updateOne({ _id: id }, { $set: data })
  } catch (err) {
    console.log(err)
    return null
  }
}

Files.getContract = async function (data) {
  try {
    const { cpf_cnpj_cliente } = data

    const { BUSSINESS_NAME, TOKEN } = process.env
    const ENDPOINT = `https://${BUSSINESS_NAME}.flyerp.com.br/apis/GetContrato`
    const SEARCH_TERMS = ["anuidade"]

    if (!cpf_cnpj_cliente) {
        throw new Error("CPF/CNPJ do cliente é obrigatório para a busca do contrato.")
    }

    const response = await axios.get(ENDPOINT, {
        params: {
          "recorrencia" : 12, 
          "situacao": 1, 
          "cnpj_cpf_cliente" : cpf_cnpj_cliente,
          "buscarEmTodasFiliais": true
        },
        headers: {
            'Authorization': `Bearer ${TOKEN}` 
        }
    })

    const contracts = response.data.contratos
    if (!Array.isArray(contracts) || contracts.length === 0) {
        return false
    }

    const hasMatch = contracts.some(contract => {
        const contractDescription = (contract.descricao || '').toLowerCase()

        return SEARCH_TERMS.some(term => 
            contractDescription.includes(term)
        )
    })

    return hasMatch
  } catch (err) {
    console.log(err)
    return false
  }
}

async function fetchAllRecords(date, inicioRegistros = 0, allRecords = []) {
  try {
    const url = `https://${process.env.BUSSINESS_NAME}.flyerp.com.br/apis/GetContasAReceber`
    const response = await axios.get(url, {
      params: {
        "status": "aberto",
        "inicioRegistros": inicioRegistros,
        "dataVencimentoInicial": date,
        "dataVencimentoFinal": date,
        "buscarEmTodasFiliais": true
      },
      headers: {
        'Authorization': `Bearer ${process.env.TOKEN}`
      }
    });

    const newRecords = response.data
    allRecords.push(...newRecords)

    if (newRecords.length < 500) {
      return allRecords
    }

    return fetchAllRecords(date, token, inicioRegistros + 500, allRecords);
  } catch (err) {
    console.log(err)
    return []
  }
}

async function fetchDayRecords(date, inicioRegistros = 0, allRecords = []) {
  try {
    const url = `https://${process.env.BUSSINESS_NAME}.flyerp.com.br/apis/GetContasAReceber`
      const response = await axios.get(url, {
        params: {
          "status": "aberto",
          "inicioRegistros": inicioRegistros,
          "dataEmissaoInicial": date,
          "dataEmissaoFinal": date,
          "buscarEmTodasFiliais": true
        },
        headers: {
          'Authorization': `Bearer ${process.env.TOKEN}`
        }
      });
      const newRecords = response.data
      allRecords.push(...newRecords)

      if (newRecords.length < 500) {
        return allRecords
      }

      return fetchDayRecords(date, inicioRegistros + 500, allRecords);
  } catch (err) {
    console.log(err)
    return []
  }
}

async function getCustomer(code) {
  try {
    const url = `https://${process.env.BUSSINESS_NAME}.flyerp.com.br/apis/GetClienteEFornecedores`
    const response = await axios.get(url, {
        params: {
            "codigo": code,
            "buscarEmTodasFiliais": true
        },
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
        }
    });
    return response?.data[0] || []
  } catch (err) {
    console.log(err)
    return null
  }
}


module.exports = Files