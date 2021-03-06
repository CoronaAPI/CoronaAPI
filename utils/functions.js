const fs = require("fs")

const readJsonFileSync = (filepath, encoding) => {
  if (typeof encoding === "undefined") {
    encoding = "utf8"
  }

  try {
    const content = fs.readFileSync(filepath, encoding)
    return JSON.parse(content)
  } catch (err) {
    console.error("No file exists for filepath='" + filepath + "'")
    return []
  }
}

const casesMap = coronaData => {
  return {
    cases: coronaData.cases,
    country: coronaData.country,
    url: coronaData.url
  }
}

const recoveredMap = coronaData => {
  return {
    recovered: coronaData.recovered,
    country: coronaData.country,
    url: coronaData.url
  }
}

const deathMap = coronaData => {
  return {
    deaths: coronaData.deaths,
    country: coronaData.country,
    url: coronaData.url
  }
}

const coronaDataMapper = coronaData => {
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

const ratingFilter = minRating => {
  if (minRating === undefined) {
    return _ => true
  }

  return coronaData => coronaData.rating >= minRating
}

const countryFilter = allowedCountry => {
  if (allowedCountry === undefined) {
    return _ => true
  }

  return coronaData => coronaData.country === allowedCountry.toUpperCase()
}

const stateFilter = state => {
  if (state === undefined) {
    return _ => true
  }

  return coronaData => coronaData.state === state
}

const countyFilter = county => {
  if (county === undefined) {
    return _ => true
  }

  return coronaData => coronaData.county === county
}

const cityFilter = city => {
  if (city === undefined) {
    return _ => true
  }

  return coronaData => coronaData.city === city
}

const sourceFilter = source => {
  if (source === undefined) {
    return _ => true
  }

  return coronaData => coronaData.url === source
}

const countryDatasourceReducer = (intermediateResult, coronaData) => {
  const { country, url, ...otherCoronaData } = coronaData
  const getOrZero = number => (number === undefined ? 0 : number)

  const newResult = intermediateResult

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

  const intermediateForCountryAndDatasource = newResult[country][url]
  intermediateForCountryAndDatasource.cases += getOrZero(otherCoronaData.cases)
  intermediateForCountryAndDatasource.active += getOrZero(
    otherCoronaData.active
  )
  intermediateForCountryAndDatasource.recovered += getOrZero(
    otherCoronaData.recovered
  )
  intermediateForCountryAndDatasource.deaths += getOrZero(
    otherCoronaData.deaths
  )
  intermediateForCountryAndDatasource.population += getOrZero(
    otherCoronaData.population
  )
  newResult[country][url] = intermediateForCountryAndDatasource

  return newResult
}

const reduceData = (data, reduced, countries = []) => {
  return data.forEach(d => {
    if (!reduced.countries.includes(d.country)) {
      const totalOfCountry = data.reduce(
        (result, current) => {
          if (d.country === current.country) {
            return {
              cases: current.cases
                ? result.cases + current.cases
                : result.cases + 0,
              active: current.active
                ? result.active + current.active
                : result.active + 0,
              deaths: current.deaths
                ? result.deaths + current.deaths
                : result.deaths + 0,
              recovered: current.recovered
                ? result.recovered + current.recovered
                : result.recovered + 0,
              tested: current.tested
                ? result.tested + current.tested
                : result.tested + 0
            }
          }
          return result
        },
        {
          cases: 0,
          active: 0,
          deaths: 0,
          recovered: 0,
          tested: 0
        }
      )

      const country = countries.find(
        c => c.country === d.country && c.cases > totalOfCountry.cases
      )

      if (country) {
        reduced.cases = reduced.cases + country.cases
        reduced.active =
          !country.active || country.active < totalOfCountry.active
            ? reduced.active + totalOfCountry.active
            : reduced.active + country.active
        reduced.recovered =
          !country.recovered || country.recovered < totalOfCountry.recovered
            ? reduced.recovered + totalOfCountry.recovered
            : reduced.recovered + country.recovered
        reduced.deaths =
          !country.deaths || country.deaths < totalOfCountry.deaths
            ? reduced.deaths + totalOfCountry.deaths
            : reduced.deaths + country.deaths
        reduced.tested =
            !country.tested || country.tested < totalOfCountry.tested
              ? reduced.tested + totalOfCountry.tested
              : reduced.tested + country.tested
      } else {
        reduced.cases = reduced.cases + totalOfCountry.cases
        reduced.active = reduced.active + totalOfCountry.active
        reduced.recovered = reduced.recovered + totalOfCountry.recovered
        reduced.deaths = reduced.deaths + totalOfCountry.deaths
        reduced.tested = reduced.tested + totalOfCountry.tested
      }
      reduced.countries.push(d.country)
    }
  })
}

exports.readJsonFileSync = readJsonFileSync
exports.coronaDataMapper = coronaDataMapper
exports.casesMap = casesMap
exports.recoveredMap = recoveredMap
exports.deathMap = deathMap
exports.ratingFilter = ratingFilter
exports.countryFilter = countryFilter
exports.stateFilter = stateFilter
exports.countyFilter = countyFilter
exports.cityFilter = cityFilter
exports.sourceFilter = sourceFilter
exports.countryDatasourceReducer = countryDatasourceReducer
exports.reduceData = reduceData
