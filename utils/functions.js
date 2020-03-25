const fs = require("fs");

const readJsonFileSync = (filepath, encoding) => {
  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }

  try {
    const content = fs.readFileSync(filepath, encoding);
    return JSON.parse(content);
  } catch (err) {
    console.error("No file exists for filepath='" + filepath + "'")
    return []
  }
}

const coronaDataMapper = (coronaData) => {
  return {
    cases: coronaData.cases,
    country: coronaData.country,
    state: coronaData.state,
    county: coronaData.county,
    city: coronaData.city,
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

const ratingFilter = (minRating) => {
  if (minRating === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.rating >= minRating
}

const countryFilter = (allowedCountry) => {
  if (allowedCountry === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.country === allowedCountry.toUpperCase()
}

const stateFilter = (state) => {
  if (state === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.state === state
}

const countyFilter = (county) => {
  if (county === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.county === county
}

const cityFilter = (city) => {
  if (city === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.city === city
}

const sourceFilter = (source) => {
  if (source === undefined) {
    return _ => true;
  }

  return coronaData => coronaData.url === source
}

const countryDatasourceReducer = (intermediateResult, coronaData) => {
  const { country, url, ...otherCoronaData } = coronaData
  const getOrZero = number => number === undefined ? 0 : number

  let newResult = intermediateResult

  if (intermediateResult[country] === undefined) {
    newResult[country] = {}
  }

  if (intermediateResult[country][url] === undefined) {
    newResult[country][url] = {
      cases: getOrZero(otherCoronaData.cases),
      recovered: getOrZero(otherCoronaData.recovered),
      deaths: getOrZero(otherCoronaData.deaths),
      active: getOrZero(otherCoronaData.active),
      rating: getOrZero(coronaData.rating),
      population: getOrZero(otherCoronaData.population),
      coordinates: getOrZero(otherCoronaData.coordinates)
    }
    return newResult
  }

  let intermediateForCountryAndDatasource = newResult[country][url]
  intermediateForCountryAndDatasource.cases += getOrZero(otherCoronaData.cases)
  intermediateForCountryAndDatasource.active += getOrZero(otherCoronaData.active)
  intermediateForCountryAndDatasource.recovered += getOrZero(otherCoronaData.recovered)
  intermediateForCountryAndDatasource.deaths += getOrZero(otherCoronaData.deaths)
  intermediateForCountryAndDatasource.population += getOrZero(otherCoronaData.population)
  newResult[country][url] = intermediateForCountryAndDatasource

  return newResult
}

exports.readJsonFileSync = readJsonFileSync
exports.coronaDataMapper = coronaDataMapper
exports.ratingFilter = ratingFilter
exports.countryFilter = countryFilter
exports.stateFilter = stateFilter
exports.countyFilter = countyFilter
exports.cityFilter = cityFilter
exports.sourceFilter = sourceFilter
exports.countryDatasourceReducer = countryDatasourceReducer
