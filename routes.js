const { readJsonFileSync, mapDataModel, countryFilter } = require('./utils/functions')
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
   *
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
   *
   * @swagger
   * /api/daily:
   *   get:
   *     tags:
   *       - CoronaAPI
   *     description: Get high-level daily data for a given country.
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
   *         description: The available Corona Virus data per country as a JSON array. The array as well as the data for each country
   *           is filtered according to the request parameters.
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
   *         required: true
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
   *             $ref: '#/definitions/CoronaData'
   */

  app.get("/api/daily", cors(corsOptions), (req, res) => {
    const scrapedData = readJsonFileSync(__dirname + '/data/2020-03-21/data.json')
    const countryParam = req.query.country
    if (!countryParam) {
      res.status(200).json(scrapedData.map(mapDataModel));
    } else {
      const filteredData = scrapedData.map(mapDataModel)
        .filter(countryFilter(countryParam.toUpperCase()))
      res.status(200).json(filteredData);
    }
  });

  app.get("/api/timespan", cors(corsOptions), (req, res) => {
    const country = req.query.country
    const dayMap = { 'week': 7, 'month': 30, 'year': 365 }
    // timeSpan: ['week', 'month', 'year'] -- what do you think?
    const timeSpan = req.query.time
    const dateToday = dayjs().format('YYYY-MM-DD')
    const dateFolders = Array.from(Array(dayMap[timeSpan])).map((_, i) => {
      return dayjs(dateToday).subtract(i, 'day').format('YYYY-MM-DD')
    });

    let returnData = []

    dateFolders.forEach(date => {
      const countryDay = readJsonFileSync(__dirname + `/data/${date}/data.json`)
        .map(mapDataModel)
        .filter(countryFilter(country))

      returnData.push(countryDay)
    })


    if (!country || !timeSpan) {
      res.status(500).json({ result: {}, error: 'please provide country ISO-3 Code and timespan' })
    }

    const settings = { timeSpan, dateToday, returnData }

    res.status(200).json({ result: settings })
  });

};