const Files = () => {}

require('dotenv').config()
const FilesToSend = require('../models/files_to_send')

const axios = require('axios')

Files.getFilesToSend = async (date) => {
    try {
      const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
      const fileList = await fetchAllRecords(stringDate)
      return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getNewEmission = async (date) => {
    try {
        const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
        const fileList = await fetchDayRecords(stringDate)
        return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getCustomersToSend = async (id) => {
    try {
        const customerList = await getCustomer(id)
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

async function fetchAllRecords(date, inicioRegistros = 0, allRecords = []) {
  try {
    const url = `https://${process.env.BUSSINESS_NAME}.flyerp.com.br/apis/GetContasAReceber`
    const response = await axios.get(url, {
      params: {
        "status": "aberto",
        "inicioRegistros": inicioRegistros,
        "dataVencimentoInicial": date,
        "dataVencimentoFinal": date
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

    return fetchAllRecords(inicioRegistros + 500, allRecords, date);
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
          "dataEmissaoFinal": date
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

      return fetchDayRecords(inicioRegistros + 500, allRecords, date);
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
            "codigo": code
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