const fs = require("fs");

function readJsonFileSync(filepath, encoding){
  if (typeof (encoding) == 'undefined'){
      encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

module.exports.setup = function(app) {
  /**
   *
   * @swagger
   * definitions:
   *   CoronaData:
   *     required:
   *       - country
   *       - cases
   *       - recovered
   *       - deaths
   *       - active
   *       - source
   *       - rating
   *     properties:
   *       country:
   *         type: string
   *         example: DEU
   *         description: If specified, filters the result array to only contain one entry representing the Corona Data for that specific country.
   *           The country codes must be specified according to <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a>.
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
   *       source:
   *         type: string
   *         example: https://covid19-germany.appspot.com/now
   *         description: The source from which the data has been taken.
   *       rating:
   *         type: number
   *         example: 0.17073170731707318
   *         description: A rating of the data that takes into account completeness, machine readability and best practices.
   *
   * @swagger
   * /:
   *   get:
   *     description: Get the scraped Corona data (example)
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type string
   *         required: false
   *         description: Can be used to get data only for one specific country.
   *           For valid codes to use see <a href=https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 target="_blank">ISO 3166-1 alpha-3</a> (e.g. DEU for Germany).
   *       - in: query
   *         name: since
   *         schema:
   *           type string
   *         required: false
   *         description: Can be used to restrict the presented results by defining a date since which data shall be taken into account.
   *           Dates must be formatted according to <a href=https://tools.ietf.org/html/rfc3339 target="_blank">RFC 3339</a> (YYYY-MM-DD, e.g. 2020-03-01).
   *       - in: query
   *         name: until
   *         schema:
   *           type string
   *         required: false
   *         description: Can be used to restrict the presented results by defining a date until which data shall be taken into account.
   *           Dates must be formatted according to <a href=https://tools.ietf.org/html/rfc3339 target="_blank">RFC 3339</a> (YYYY-MM-DD, e.g. 2020-03-01).
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
  app.get("/", (req, res) => {
    const scrapedData = readJsonFileSync(__dirname + '/data.json')
    res.json(scrapedData);
  });
};