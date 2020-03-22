require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routes_v1 = require('./routes')

const PORT = process.env.port || 3001

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

let host
if (process.env.NODE_ENV === 'dev') {
  host = `localhost:${PORT}`
} else {
  host = `corona.ndo.dev`
}

const swaggerDefinition = {
  info: {
    title: 'COVID-19 API',
    version: '0.0.3',
    description: 'An HTTP API serving structured information on COVID-19\'s march around the globe.',
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  host: host,
  basePath: '/',
  tags: [
    {
      "name": "CoronaAPI",
      "description": "HTTP API for getting the latest COVID-19 Data."
    }
  ],
  schemes: [
    "https"
  ],
  produces: [
    "application/json"
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes*.js'],
  explorer: true
};

const swaggerSpec = swaggerJSDoc(options);

app.get('/', (req, res) => {
  res.redirect('https://corona-api-landingpage.netlify.com/');
})

app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

routes_v1.setup(app)

app.listen(PORT, () => {
  console.log(`Server is listening on localhost:${PORT}`);
});
