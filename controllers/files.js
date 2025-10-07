const Files = () => {}

require('dotenv').config()
const FilesToSend = require('../models/files_to_send')

const axios = require('axios')

Files.getFilesToSend = async (date) => {
    try {
      const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
      const fileList = []

      const tokenList = process.env.TOKEN_LIST.split(',')

      for(const token of tokenList){
          const fileListAux = await fetchAllRecords(stringDate, token);

          const fileListWithToken = fileListAux.map(iterator => ({
              ...iterator,
              token: token 
          }));

          fileList.push(...fileListWithToken);
      }

      return fileList
    } catch (err) {
        console.log(err)
        return []
    }
}

Files.getNewEmission = async (date) => {
    try {
      const stringDate = new Date(date).toISOString('pt-BR').split('T')[0]
      const fileList = []

      const tokenList = process.env.TOKEN_LIST.split(',')

      for(const token of tokenList){
          const fileListAux = await fetchDayRecords(stringDate, token);

          const fileListWithToken = fileListAux.map(iterator => ({
              ...iterator,
              token: token 
          }));

          fileList.push(...fileListWithToken);
      }

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

async function getCustomer(code, token) {
  try {
    const url = `https://${process.env.BUSSINESS_NAME}.flyerp.com.br/apis/GetClienteEFornecedores`
    const response = await axios.get(url, {
        params: {
            "codigo": code
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response?.data[0] || []
  } catch (err) {
    console.log(err)
    return null
  }
}


module.exports = Files