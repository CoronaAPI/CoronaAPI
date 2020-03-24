const { readJsonFileSync, coronaDataMapper, ratingFilter, sourceFilter, countryFilter, countryDatasourceReducer } = require('./utils/functions')
var dayjs = require('dayjs')
const cors = require("cors");
const requireDir = require('require-dir')
const dir = requireDir('./data/', { recurse: true })

const whitelist = ["*"];
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
    // if (process.env.NODE_ENV === "dev") {
    //   callback(null, true);
    // } else {
    //   if (whitelist.indexOf(origin) !== -1 || !origin) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // }
  }
};

module.exports.setup = function (app) {
  /**
   * @swagger
   * definitions:
   *   CoronaData:
   *     required:
   *       - country
   *       - source
   *       - rating
   *     properties:
   *       country:
   *         type: string
   *         example: USA
   *         description: The country according to <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a> for which the data is valid.
   *       state:
   *         type: string
   *         example: MO
   *         description: The geographical region of a country for which the data is valid.
   *       county:
   *         type: string
   *         example: Knox County
   *         description: The geographical region of a state or country for which the data is valid.
   *       cases:
   *         type: integer
   *         example: 19848
   *         description: The total number of cases taken into account the specified date filters 'since' and 'until'.
   *       population:
   *         type: integer
   *         example: 19848
   *         description: The number of people living in the country/state/county.
   *       recovered:
   *         type: integer
   *         example: 180
   *         description: The number of recovered people taken into account the specified date filters 'since' and 'until'.
   *       deaths:
   *         type: integer
   *         example: 68
   *         description: The number of people that died due to Corona Virus taken into account the specified date filters 'since' and 'until'.
   *       active:
   *         type: integer
   *         example: 19600
   *         description: The number of people that are currently infected with Corona Virus taken into account the specified date filters 'since' and 'until'.
   *       url:
   *         type: string
   *         example: https://covid19-germany.appspot.com/now
   *         description: The url (source) from which the data has been taken.
   *       rating:
   *         type: number
   *         example: 0.17073170731707318
   *         description: A rating of the data that takes into account completeness, machine readability and best practices.
   *       coordinates:
   *         type: array
   *         items:
   *           type: number
   *         minItems: 2
   *         maxItems: 2
   *         example: [10.2, 51.0]
   *         description: The coordinates (longitude and latitude) representing the data set.
   *
   *   CoronaTimeSeries:
   *     required:
   *       - result
   *     properties:
   *       timeSpan: 
   *         type: string
   *         enum: 
   *           - 'week'
   *           - 'month'
   *           - 'year'
   *       startingDay: 
   *         type: string
   *         description: Starting day for your request
   *         example: '2020-03-22'
   *       timeseries: 
   *         type: object
   *         properties:
   *           date: 
   *             type: string
   *             description: Current day whose data will follow
   *             example: '2020-03-22'
   *           data:
   *             type: array
   *             items:
   *               type: object
   *               $ref: '#/definitions/CoronaData'
   *             description:
   *               An array containing the Corona data for a specific day.
   *   
   *   CoronaPerCountryAndDatasource:
   *     properties:
   *       cases:
   *         type: integer
   *         example: 19848
   *         description: The total number of cases for a country and data source.
   *       population:
   *         type: integer
   *         example: 19848
   *         description: The number of people living in the country.
   *       recovered:
   *         type: integer
   *         example: 180
   *         description: The number of recovered people for a country and data source.
   *       deaths:
   *         type: integer
   *         example: 68
   *         description: The number of people that died due to Corona Virus for a country and data source.
   *       active:
   *         type: integer
   *         example: 19600
   *         description: The number of people that are currently infected with Corona Virus for a country and data source.
   *       rating:
   *         type: number
   *         example: 0.17073170731707318
   *         description: A rating of the data that takes into account completeness, machine readability and best practices.
   *       coordinates:
   *         type: array
   *         items:
   *           type: number
   *         minItems: 2
   *         maxItems: 2
   *         example: [10.2, 51.0]
   *         description: The coordinates (longitude and latitude) representing the data set.
   *
   *   MetaData:
   *     required:
   *       - repo
   *       - bug
   *       - lastUpdate
   *     properties:
   *       repo:
   *         type: string
   *         example: https://github.com/CoronaAPI/Corona
   *         description: The GitHub repository where this REST API lives in.
   *       bug:
   *         type: string
   *         example: https://github.com/CoronaAPI/CoronaAPI/issues/new
   *         description: The link that can be used to create a ticket in case you find a bug or wish a new functionality.
   *       lastUpdate:
   *         type: string
   *         example: 2020-03-22
   *         description: The date on which data has been fetched from different sources the last time.
   *
   * @swagger
   * /api/daily:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get high-level daily data on Corona infections around the world or for a specific country.
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type string
   *         required: false
   *         description: Please enter the 3-digit ISO Country Code. 
   *           For valid codes to use see <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a> (e.g. DEU for Germany). 
   *       - in: query
   *         name: rating
   *         schema:
   *           type number
   *         required: false
   *         minimum: 0.0
   *         maximum: 0.99
   *         description: Please enter a minimum rating of the data quality based upon (<a href="https://github.com/lazd/coronadatascraper">@lazd/coronadatascraper</a> data rating).
   *           The rating takes into account completeness, machine readability and best practices.
   *       - in: query
   *         name: source
   *         schema:
   *           type string
   *         required: false
   *         description: Enter a source URL. For available sources, please check `/api/datasources` endpoint.
   *     responses:
   *       200:
   *         description: The available Corona Virus data per country as a JSON array. The array as well as the data for each country is filtered according to the request parameters.
   *         schema:
   *           type: array
   *           items:
   *             type: object
   *             $ref: '#/definitions/CoronaData'
   * /api/timespan:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get high-level daily data for a given country over time.
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type string
   *         required: false
   *         description: Please enter the 3-digit ISO Country Code. 
   *           For valid codes to use see <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a> (e.g. DEU for Germany).
   *       - in: query
   *         name: time
   *         schema:
   *           type: string
   *           enum: 
   *             - 'week'
   *             - 'month'
   *             - 'year'
   *           default: 'week'
   *         required: true
   *         description: Please choose a timespan, how far back you want data. Must be one of "week", "month", "year".
   *         examples:
   *           oneId:
   *             summary: Example of a single ID
   *             value: ['week', 'month']
   *     responses:
   *       200:
   *         description: The available COVID-19 data per country as a JSON array. The array of days for the time span requested for the country requested.
   *         schema:
   *           type: array
   *           items:
   *             type: object
   *             $ref: '#/definitions/CoronaTimeSeries'
   * /api/countries:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get Corona data for each country from different data sources.
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type string
   *         required: false
   *         description: Please enter the 3-digit ISO Country Code. 
   *           For valid codes to use see <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a> (e.g. DEU for Germany).
   *     responses:
   *       200:
   *         description: The Corona data for each country from different data sources.
   *         schema: 
   *           type: object
   *           additionalProperties:
   *             type: object
   *             description: The country for which the data is bundled per data source.
   *             example: DEU
   *             additionalProperties:
   *               type: object
   *               description: The data source
   *               example: gdfg
   *               $ref: '#/definitions/CoronaPerCountryAndDatasource'
   *             
   * /api/datasources:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get a list of datasources available via this API.
   *     responses:
   *       200:
   *         description: The metadata on the REST API under use.
   *         schema:
   *           type: array
   *           items:
   *             type: object
   *             $ref: '#/definitions/MetaData'
   * /meta:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get metadata on the REST API under use. That includes information like where to find the code, where to create new tickets
   *       or when the underlying data has been updated the last time.
   *     responses:
   *       200:
   *         description: The metadata on the REST API under use.
   *         schema:
   *           type: array
   *           items:
   *             type: object
   *             $ref: '#/definitions/MetaData'
   */
  const dateToday = dayjs().format('YYYY-MM-DD')
  let scrapedData = ''
  if (process.env.NODE_ENV === 'dev') {
    scrapedData = readJsonFileSync(__dirname + `/data/${dateToday}/data.json`)
  } else {
    scrapedData = readJsonFileSync(__dirname + `/../data/${dateToday}/data.json`)
  }

  app.get("/meta", cors(corsOptions), (req, res) => {
    res.status(200).json({
      lastUpdate: dateToday,
      repo: 'https://github.com/CoronaAPI/CoronaAPI',
      bug: 'https://github.com/CoronaAPI/CoronaAPI/issues/new'
    });
  })

  app.get("/api/daily", cors(corsOptions), (req, res) => {

    const countryParam = req.query.country
    const minRating = req.query.rating
    const source = req.query.source

    const filteredData = scrapedData
      .map(coronaDataMapper)
      .filter(ratingFilter(minRating))
      .filter(countryFilter(countryParam))
      .filter(sourceFilter(source))

    res.status(200).json(filteredData);
  });

  app.get("/api/timespan", cors(corsOptions), (req, res) => {
    const country = req.query.country
    const timeSpan = req.query.time

    if (undefined == timeSpan) {
      res.status(400).json({ result: {}, error: 'Please provide timespan' })
      return
    }

    const dayMap = { 'week': 7, 'month': 30, 'year': 365 }
    const dateFolders = Array.from(Array(dayMap[timeSpan])).map((_, i) => {
      return dayjs(dateToday).subtract(i, 'day').format('YYYY-MM-DD')
    });

    let returnData = []

    dateFolders.forEach(date => {
      if (process.env.NODE_ENV === 'dev') {
        scrapedData = readJsonFileSync(__dirname + `/data/${date}/data.json`)
      } else {
        scrapedData = readJsonFileSync(__dirname + `/../data/${date}/data.json`)
      }
      const countryDay = scrapedData
        .map(coronaDataMapper)
        .filter(countryFilter(country))

      returnData.push({ date: date, data: countryDay })
    })

    const settings = { timeSpan, startingDay: dateToday, timeseries: returnData }

    res.status(200).json(settings)
  });

  app.get("/api/countries", cors(corsOptions), (req, res) => {
    const countryParam = req.query.country

    const filteredData = scrapedData
      .map(coronaDataMapper)
      .filter(countryFilter(countryParam))
      .reduce(countryDatasourceReducer, {})

    res.status(200).json(filteredData)
  });

  app.get("/api/datasources", cors(corsOptions), (req, res) => {

    let sources = []
    scrapedData.map(data => sources.push({ source: data.url }))
    returnData = [...new Set(sources.map(x => x.source))]

    res.status(200).json(returnData)
  });
};