const fs = require("fs");

const readJsonFileSync = (filepath, encoding) => {
  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

const mapDataModel = (coronaData) => {
  return {
    cases: coronaData.cases,
    country: coronaData.country,
    state: coronaData.state,
    county: coronaData.county,
    recovered: coronaData.recovered,
    deaths: coronaData.deaths,
    active: coronaData.active,
    url: coronaData.url,
    rating: coronaData.rating,
    population: coronaData.population,
    aggregate: coronaData.aggregate,
    coordinates: coronaData.coordinates
  }
}

const countryFilter = (allowedCountry) => {
  if (undefined == allowedCountry) {
    return _ => true;
  }

  return coronaData => coronaData.country == allowedCountry
}

exports.readJsonFileSync = readJsonFileSync
exports.mapDataModel = mapDataModel
exports.countryFilter = countryFilter
