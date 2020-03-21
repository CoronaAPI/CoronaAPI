require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Beispiel whitelist
// const whitelist = ['https://domain.de']
const whitelist = ["*"];
const corsOptions = {
  origin: function (origin, callback) {
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

app.get("/test", cors(corsOptions), (req, res) => {
  res.status(200).sendFile(__dirname + '/package.json')
});

app.listen(process.env.port || 3001, () => {
  console.log("Server is listening on localhost:3001");
});
