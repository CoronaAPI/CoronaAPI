#!/bin/bash

##################
# VARIABLES
###################

TIME=$(date "+%Y-%m-%d %H:%M")
DATE=$(date +%Y-%m-%d)
DIR="/opt/corona-api/data"

cleanAndCopy () {
  FILE=$1
  if [ -e "$DIR/$DATE/$FILE" ]
  then
    rm $DIR/$DATE/$FILE
  fi

  cp $DIR/$DATE/coronadatascraper/dist/$FILE $DIR/$DATE
}

##################
# SETUP
###################

echo "[*] Starting Daily Data Dump " $TIME

mkdir -p $DIR/$DATE

cd $DIR/$DATE

if [ ! -d "$DIR/$DATE/coronadatascraper" ]
then
  git clone --recursive https://github.com/lazd/coronadatascraper
  echo "[*] Repo successfully cloned"
else 
  cd $DIR/$DATE/coronadatascraper
  git pull 
  echo "[*] Repo successfully updated"
fi

##################
# WORK
###################

cd $DIR/$DATE/coronadatascraper

echo "[*] Installing coronadatascraper..."
/usr/local/bin/yarn install

echo "[*] Starting coronadatascraper..."

/usr/local/bin/yarn start

cleanAndCopy "data.json"
cleanAndCopy "ratings.json"
cleanAndCopy "report.json"

# if [ -e "$DIR/$DATE/data.json" ]
# then
  # mv $DIR/$DATE/data.json{,.$(date +%Y%m%d-%H%M)}
# fi

# cp $DIR/$DATE/coronadatascraper/dist/data.json $DIR/$DATE

# if [ -e "$DIR/$DATE/ratings.json" ]
# then
  # rm $DIR/$DATE/ratings.json
# fi

# cp $DIR/$DATE/coronadatascraper/dist/ratings.json $DIR/$DATE

# if [ -e "$DIR/$DATE/report.json" ]
# then
  # rm $DIR/$DATE/report.json
# fi

# cp $DIR/$DATE/coronadatascraper/dist/report.json $DIR/$DATE

echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

cd $DIR/$DATE
rm -rf coronadatascraper

if [[ -e "$DIR/$DATE/data.json" && -e "$DIR/$DATE/report.json" ]]
then
  SOURCES=$(cat $DIR/$DATE/report.json | jq '.sources.numSources')
  ERRORS=$(cat $DIR/$DATE/report.json | jq '.sources.errors')
  ERRORS_TEXT=""
  if [ $ERRORS = "[]" ]
  then
    ERRORS_TEXT="without any errors"
  else
    ERRORS_TEXT="with the following errors: $ERRORS"
  fi

  PAYLOAD="{
    \"blocks\": [
      {
        \"type\":\"section\",
        \"text\": {
          \"type\":\"mrkdwn\",
          \"text\":\"🚀 coronadatascraper executed successfully at *$TIME*\"
        }
      },
      {
        \"type\":\"section\",
        \"text\": {
          \"type\":\"mrkdwn\",
          \"text\":\"Scraped $SOURCES sources, $ERRORS_TEXT\"
        }
      },
      {
        \"type\":\"divider\"
      },
      {
        \"type\":\"context\",
        \"elements\": [
          {
	    \"type\":\"mrkdwn\",
	    \"text\":\"For more info, checkout ssh:\/\/ec2-18-195-101-161.eu-central-1.compute.amazonaws.com\"
          }
        ]
      }
    ]
  }"

  curl -X POST --data-urlencode "payload=$PAYLOAD" $SLACK_URL >> /dev/null 2>&1
fi

echo "[*] Daily Script Complete!"

