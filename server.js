require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const routesV1 = require('./routes')
const swaggerDocument = require('./swagger.json')
const responseTime = require('response-time')

const PORT = process.env.port || 3001

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(responseTime())
app.use(cors())

if (process.env.NODE_ENV === 'dev') {
  const host = `localhost:${PORT}`
  const schemes = ['http']
  swaggerDocument.host = host
  swaggerDocument.schemes = schemes
}

app.get('/', (req, res) => {
  res.redirect('https://corona-api.org/')
})

app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})

// Redirect for original URL
app.use('/api-docs/swagger-ui', (req, res) => {
  res.redirect('/api-docs')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

routesV1.setup(app)

app.listen(PORT, () => {
  console.log(`Server is listening on localhost:${PORT}`)
})
