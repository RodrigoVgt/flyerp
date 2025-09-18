const Files = () => {}

const SentFiles = require('../models/sent_files')

const axios = require('axios')

Files.getFilesToSend = async (req, res) => {
    try {
        const fileList = await fetchAllRecords()
        return fileList
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

Files.getCustomersToSend = async (req, res) => {
    try {
        const customerList = await getCustomer()
        return customerList
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

async function fetchAllRecords(inicioRegistros = 0, allRecords = []) {
  const response = await axios.get(`${process.env.BUSSINES_NAME}.flyerp.com.br/apis/GetContasAReceber`, {
    params: {
      "status": "aberto",
      "inicioRegistros": inicioRegistros
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

  return fetchAllRecords(inicioRegistros + 500, allRecords);
}

async function getCustomer() {
    const response = await axios.get(`${process.env.BUSSINES_NAME}.flyerp.com.br/apis/GetClienteEFornecedores`, {
        params: {
            "enquadramento": 1
        },
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`
        }
    });
    return response.data
}


module.exports = Files