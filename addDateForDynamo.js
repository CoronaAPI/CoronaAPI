const fs = require('fs');
const exec = require('child_process').exec;
const { uuid } = require('uuidv4')
const AWS = require('aws-sdk')
AWS.config.update({region:'eu-central-1'});
const docClient = new AWS.DynamoDB.DocumentClient()

const today = new Date()
const year = today.getFullYear()
const month = `${today.getMonth() + 1}`.padStart(2, 0)
const day = `${today.getDate()}`.padStart(2, 0)
const hour = today.getHours()
const minutes = today.getMinutes()
const stringDate = [year, month, day].join("-")
const fileDate = [year, month, day].join("")
const updateDate = `${stringDate} ${hour}:${minutes}`

const ddbTable = 'corona1'

  const uploadJSONtoDynamoDB = async (data) => {
    // Separate into batches for upload
    const batches = []
    const BATCH_SIZE = 25

    while (data.length > 0) {
      batches.push(data.splice(0, BATCH_SIZE))
    }

    console.log('Batches: ', batches.length)

    let batchCount = 0

    // Save each batch
    await Promise.all(
      batches.map(async (itemData) => {
        // Set up the params object for the DDB call
        const params = {
          RequestItems: {}
        }
        params.RequestItems[ddbTable] = []

        itemData.forEach((item) => {
          for (const key of Object.keys(item)) {
            // An AttributeValue may not contain an empty string
            if (item[key] === '') {
              delete item[key]
            }
          }

          // Build params
          // console.log(item)
          params.RequestItems[ddbTable].push({
            PutRequest: {
              Item: {
                ID: uuid(),
                ...item
              }
            }
          })
        })

        // Push to DynamoDB in batches
        try {
          batchCount++
          console.log('Trying batch: ', batchCount)
          const result = await docClient.batchWrite(params).promise()
          console.log(
            'Success: ',
            typeof result === 'string'
              ? result.substr(0, 100)
              : JSON.stringify(result).substr(0, 100)
          )
        } catch (err) {
          console.error('Error: ', err)
        }
      })
    )
  }

fs.readFile(`/opt/corona-api/data/${stringDate}/data.json`, 'utf8', (err, data) => {
  if (err) throw err;
  const fileContent = JSON.parse(data)
  fileContent.forEach(entry => {
    entry.date = stringDate
    entry.updated = updateDate
  })
  uploadJSONtoDynamoDB(fileContent)

  // fs.writeFileSync(`/opt/corona-api/data/${stringDate}/data-aws-${fileDate}.json`, JSON.stringify(fileContent))
  
  // exec(`aws s3 cp /opt/corona-api/data/${stringDate}/data-aws-${fileDate}.json s3://corona-api-json-content`, (err, stdout, stderr) => {
    // if (err) { console.error(err) }
  // })
})
