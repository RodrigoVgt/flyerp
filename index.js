const express = require('express')
const FilesRoute = require('./routes/files')
const WabaRouter = require('./routes/waba')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(
    '/files', FilesRoute,
    '/waba', WabaRouter
);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
});