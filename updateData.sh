#!/bin/bash

##################
# VARIABLES
###################

TIME=$(date +%b-%d-%y)
DATE=$(date +%Y-%m-%d)
DIR="/opt/corona-api/data"
export node=/home/ubuntu/.nvm/versions/node/v12.16.1/bin/node

##################
# SETUP
###################

echo "[*] Starting Daily Data Dump " + $TIME

sudo -u ubuntu mkdir -p $DIR/$DATE

cd $DIR/$DATE

sudo -u ubuntu git clone --recursive https://github.com/lazd/coronadatascraper

echo "[*] Repo successfully cloned"

##################
# WORK
###################

cd coronadatascraper
echo "[*] Installing coronadatascraper..."

# HACK UNTIL KS SOURCE IS REMOVED
if [ -d "$DIR/$DATE/coronadatascraper/src/events/crawler/scrapers/USA/KS" ]
then
  rm -r $DIR/$DATE/coronadatascraper/src/events/crawler/scrapers/USA/KS
fi
# END HACK

yarn install
echo "[*] Starting coronadatascraper..."
# sudo -u ubuntu /home/ubuntu/.nvm/versions/node/v12.16.1/bin/node src/events/crawler/cli.js
yarn start

cp $DIR/$DATE/coronadatascraper/dist/data.json $DIR/$DATE
echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

cd $DIR/$DATE
# rm -r coronadatascraper

echo "[*] Daily Script Complete!"



