const fs = require("fs");

function readJsonFileSync(filepath, encoding) {
  if (typeof (encoding) == 'undefined'){
      encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function mapDataModel(coronaData) {
  return {
    country: coronaData.country,
    state: coronaData.state,
    county: coronaData.county,
    recovered: coronaData.recovered,
    deaths: coronaData.deaths,
    active: coronaData.active,
    url: coronaData.url,
    rating: coronaData.rating
  }
}

function countryFilter(allowedCountry) {
  if (undefined == allowedCountry) {
    return _ => true;
  }

  return coronaData => coronaData.country == allowedCountry
}

module.exports.setup = function(app) {
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

    const countryParam = req.query.country

    const scrapedData = readJsonFileSync(__dirname + '/data.json')

    const filteredData = scrapedData.map(mapDataModel)
      .filter(countryFilter(countryParam))

    res.json(filteredData);
  });
};