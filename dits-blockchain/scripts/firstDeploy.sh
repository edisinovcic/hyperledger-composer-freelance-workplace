#!bin/bash
# First start fabric if fabric is not started in home repository
npm install
npm run archive:create
npm run local:install
npm run local:start
composer card import --file admin.card --card admin
composer network ping -c admin
