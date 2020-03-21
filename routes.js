module.exports.setup = function(app) {
  /**
   * @swagger
   * /:
   *   get:
   *     description: Just an example that will be replaced later
   *     responses:
   *       200:
   *         description: tbd
   */
  app.get("/", (req, res) => {
    res.json({ message: "Corona REST API" });
  });
};