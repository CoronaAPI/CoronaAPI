#!/bin/bash

##################
# VARIABLES
###################

TIME=$(date +%b-%d-%y)
DATE=$(date +%Y-%m-%d)
DIR="/opt/corona-api/data"

##################
# SETUP
###################

echo "[*] Starting Daily Data Dump " + $TIME

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
yarn install

# HACK UNTIL KS SOURCE IS REMOVED
# if [ -d "$DIR/$DATE/coronadatascraper/src/events/crawler/scrapers/USA/KS" ]
# then
  # rm -r $DIR/$DATE/coronadatascraper/src/events/crawler/scrapers/USA/KS
# fi
# END HACK

echo "[*] Starting coronadatascraper..."

yarn start

if [ -e "$DIR/$DATE/data.json" ]
then
  mv $DIR/$DATE/data.json{,.$(date +%Y%m%d_%H%M)}
fi

cp $DIR/$DATE/coronadatascraper/dist/data.json $DIR/$DATE

echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

cd $DIR/$DATE
rm -r coronadatascraper

echo "[*] Daily Script Complete!"

