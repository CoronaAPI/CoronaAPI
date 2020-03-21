const { readJsonFileSync, mapDataModel, countryFilter } = require('./utils/functions')
const requireDir = require('require-dir')
const dir = requireDir('./data/', { recurse: true })

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
   */

  app.get("/api/daily", (req, res) => {
    const scrapedData = readJsonFileSync(__dirname + '/data/20032020/data.json')
    const countryParam = req.query.country
    if (!countryParam) {
      res.status(200).json(scrapedData);
    } else {
      const filteredData = scrapedData.map(mapDataModel)
        .filter(countryFilter(countryParam))
      res.status(200).json(filteredData);
    }
  });

  app.get("/api/timeseries", (req, res) => {
    const country = req.query.country

    // timeSpan: ['week', 'month', 'year'] -- what do you think?
    const timeSpan = req.query.time
    if (country.length() === 2) {
      matchCountryCode()
    }
    if (country.length() === 3) {
      res.status(200).json({ result: dir })
    }
    res.status(500).json({ result: {}, error: 'please provide a country name' })
  });

};