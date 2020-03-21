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
   *       cases:
   *         type: integer
   *         example: 19848
   *       recovered:
   *         type: integer
   *         example: 180
   *       deaths:
   *         type: integer
   *         example: 68
   *       active:
   *         type: integer
   *         example: 19600
   *       source:
   *         type: string
   *         example: https://covid19-germany.appspot.com/now
   *       rating:
   *         type: number
   *         example: 0.17073170731707318
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