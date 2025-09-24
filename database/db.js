const mongoose = require('mongoose')
require ('dotenv').config()

let dbConnection = process.env.DB_CONNECTION
mongoose.Promise = global.Promise
mongoose.connect(dbConnection)

mongoose.connection.on('connected', () => {
  console.log('Conectado ao DB ')
})
mongoose.connection.on('error', (error) => {
  console.error.bind(console.error, 'Connection Error:')
  mongoose.disconnect()
});

module.exports = mongoose