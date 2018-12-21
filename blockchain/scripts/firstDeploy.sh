#!bin/bash
# Only run first time or if something breaks
cd ../fabric-dev-servers && ./startFabric.sh && ./createPeerAdminCard.sh && cd ../blockchain
npm install
npm run archive:create
npm run local:install
composer card import --file admin.card --card admin
composer network ping -c admin
npm run local:start
