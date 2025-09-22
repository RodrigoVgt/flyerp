const Files = () => {}

const SentFiles = require('../models/sent_files')
const FilesToSend = require('../models/files_to_send')

const axios = require('axios')

Files.getFilesToSend = async (date) => {
    try {
      const date = new Date().toISOString('pt-BR').split('T')[0]
      const fileList = await fetchAllRecords(date)
      return fileList
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

Files.getCustomersToSend = async (id) => {
    try {
        const customerList = await getCustomer(id)
        return customerList
    } catch (err) {
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

async function fetchAllRecords(inicioRegistros = 0, allRecords = [], date) {
  const response = await axios.get(`${process.env.BUSSINES_NAME}.flyerp.com.br/apis/GetContasAReceber`, {
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
}

async function getCustomer(code) {
    const response = await axios.get(`${process.env.BUSSINES_NAME}.flyerp.com.br/apis/GetClienteEFornecedores`, {
        params: {
            "codigoCliente": code
        },
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
        }
    });
    return response.data
}


module.exports = Files