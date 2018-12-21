const config = require('../config');
const IdCard = require('composer-common').IdCard;
const fs = require('fs');
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
const AdminConnection = require('composer-admin').AdminConnection;
const adminConnection = new AdminConnection();
const CardExport = require('composer-cli').Card.Export;
const NetworkPing = require('composer-cli').Network.Ping;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

async function create(identity, participantRegistry) {

    const metadata = {
        userName: identity.userID,
        version: identity.version,
        enrollmentSecret: identity.userSecret,
        businessNetwork: config.networkName
    };

    const idCardData = new IdCard(metadata, config.connectionProfile);
    const idCardName = BusinessNetworkCardStore.getDefaultCardName(idCardData);
    await adminConnection.importCard(idCardName, idCardData);

    let options = {
        card: idCardName
    };

    await NetworkPing.handler(options);

    options = {
        file: `cards/${idCardName}.card`,
        card: idCardName
    };
    await CardExport.handler(options);

    await adminConnection.disconnect();
    return 'success';
}


async function importCardToNetwork(cardData) {
    const idCardData = await IdCard.fromArchive(cardData);
    const idCardName = await BusinessNetworkCardStore.getDefaultCardName(idCardData);
    await adminConnection.importCard(idCardName, idCardData);
    let options = {
        card: idCardName
    };

    await NetworkPing.handler(options);
    return idCardName;
}

async function deleteCard(cardName) {
    let adminConnection = new AdminConnection();
    await adminConnection.deleteCard(cardName)
}

module.exports = {
    create,
    importCardToNetwork,
    deleteCard
};