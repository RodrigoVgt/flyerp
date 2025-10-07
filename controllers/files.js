const Files = () => {}

require('dotenv').config()
const FilesToSend = require('../models/files_to_send')

const axios = require('axios')

Files.getFilesToSend = async (date) => {
    try {
      const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
      const fileListAdm = await fetchAllRecords(stringDate, process.env.TOKEN_ADM)
      const fileListLtda = await fetchAllRecords(stringDate, process.env.TOKEN_LTDA)

      for(const iterator of fileListAdm){
        iterator.token = 'Adm'
      }
      for(const iterator of fileListLtda){
        iterator.token = 'Ltda'
      }
      const fileList = fileListAdm.concat(fileListLtda)
      return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getNewEmission = async (date) => {
    try {
        const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
        const fileListAdm = await fetchDayRecords(stringDate, process.env.TOKEN_ADM)
        const fileListLtda = await fetchDayRecords(stringDate, process.env.TOKEN_LTDA)

        for(const iterator of fileListAdm){
            iterator.token = 'Adm'
        }
        for(const iterator of fileListLtda){
            iterator.token = 'Ltda'
        }
        const fileList = fileListAdm.concat(fileListLtda)
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

Files.updateOne = async function (id, data) {
  try {
    return await FilesToSend.updateOne({ _id: id }, { $set: data })
  } catch (err) {
    console.log(err)
    return null
  }
}

async function fetchAllRecords(date, token, inicioRegistros = 0, allRecords = []) {
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
        'Authorization': `Bearer ${token}`
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

async function fetchDayRecords(date, token, inicioRegistros = 0, allRecords = []) {
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
          'Authorization': `Bearer ${token}`
        }
      });
      const newRecords = response.data
      allRecords.push(...newRecords)

      if (newRecords.length < 500) {
        return allRecords
      }

      return fetchDayRecords(date, token, inicioRegistros + 500, allRecords);
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