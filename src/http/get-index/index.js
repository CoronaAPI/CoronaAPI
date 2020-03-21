let arc = require("@architect/functions");
let express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
let app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Beispiel whitelist
// const whitelist = ['https://domain.de']
const whitelist = ["*"];
const corsOptions = {
  origin: function(origin, callback) {
    if (process.env.NODE_ENV === "dev") {
      callback(null, true);
    } else {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  }
};

app.get("/", (req, res) => {
  res.json({ message: "Corona REST API" });
});

app.get("/cool", (req, res) => res.send("very very cool"));

app.get("/test", cors(corsOptions), (req, res) => {
  res.status(200).sendFile(__dirname + "/package.json");
});

exports.handler = arc.http.express(app);
