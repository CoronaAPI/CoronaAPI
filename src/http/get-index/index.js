let arc = require('@architect/functions')
let express = require('express')
let app = express()

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/cool', (req, res)=> res.send('very cool'))

exports.handler = arc.http.express(app)
