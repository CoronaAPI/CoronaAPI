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
git clone --recursive https://github.com/lazd/coronadatascraper

echo "[*] Repo successfully cloned"

##################
# WORK
###################

cd coronadatascraper
echo "[*] Installing coronadatascraper..."
yarn install
echo "[*] Starting coronadatascraper..."
yarn start

cp $DIR/$DATE/coronadatascraper/dist/data.json $DIR/$DATE
echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

shopt -s extglob
rm -r !("data.json")

echo "[*] Daily Script Complete!"



