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
   * @swagger
   * /:
   *   get:
   *     description: Get the scraped Corona data (example)
   *     responses:
   *       200:
   *         description: tbd
   */
  app.get("/", (req, res) => {
    const scrapedData = readJsonFileSync(__dirname + '/data.json')
    res.json(scrapedData);
  });
};