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

sudo -u ubuntu mkdir -p $DIR/$DATE

cd $DIR/$DATE

sudo -u ubuntu git clone --recursive https://github.com/lazd/coronadatascraper

echo "[*] Repo successfully cloned"

##################
# WORK
###################

cd coronadatascraper
echo "[*] Installing coronadatascraper..."
sudo -u ubuntu yarn install
echo "[*] Starting coronadatascraper..."
sudo -u ubuntu yarn start

sudo -u ubuntu cp $DIR/$DATE/coronadatascraper/dist/data.json $DIR/$DATE
echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

cd $DIR/$DATE
rm -r coronadatascraper

echo "[*] Daily Script Complete!"



