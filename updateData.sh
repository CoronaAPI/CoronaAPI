#!/bin/bash

##################
# VARIABLES
###################

TIME=$(date +%b-%d-%y)
DATE=$(date +%d%m%Y_%H%M)
# CURDATE1=$(date '+%d-%m-%Y %H:%M')
# DIFFTIME1=$(date '+%s%N')
DIR="/opt/corona-api/data"

##################
# SETUP
###################

echo "[*] Starting Daily Data Dump " + $TIME

mkdir $DIR/$DATE

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

cp dist/data.json .
echo "[*] Data successfully dumped " + $TIME

##################
# CLEAN-UP
###################

echo ""
echo "[*] Cleaning up data scrape"

rm -r !("data.json")

echo "[*] Daily Script Complete!"



