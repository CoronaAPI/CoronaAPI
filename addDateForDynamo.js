const fs = require('fs');
const exec = require('child_process').exec;

const today = new Date()
const year = today.getFullYear()
const month = `${today.getMonth() + 1}`.padStart(2, 0)
const day = `${today.getDate()}`.padStart(2, 0)
const stringDate = [year, month, day].join("-")

fs.readFile(`/opt/corona-api/data/${stringDate}/data.json`, 'utf8', (err, data) => {
  if (err) throw err;
  const fileContent = JSON.parse(data)
  fileContent.forEach(entry => {
    entry.date = stringDate
  })
  fs.writeFileSync(`/opt/corona-api/data/${stringDate}/data-aws.json`, JSON.stringify(fileContent))
  exec(`aws s3 cp /opt/corona-api/data/${stringDate}/data-aws.json s3://corona-api-json-content`, (err, stdout, stderr) => {
    if (err) { console.error(err) }
  })
})
