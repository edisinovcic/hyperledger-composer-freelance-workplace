const {newConnection} = require('../participant');

const {responseModel} = require('../../model');
const config = require('../../config');
const {cardService} = require('../../service');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const uuid4 = require('uuid/v4');

const BID = 'Bid';
const JOB = 'Job';
const EMPLOYER = 'Employer';
const EMPLOYEE = 'Employee';

async function bidToJob(bidData, cardName) {

    try {
        let businessNetworkConnection = newConnection();
        await businessNetworkConnection.connect(cardName);

        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);
        const bidAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${BID}`);
        const factory = await businessNetworkConnection.getBusinessNetwork().getFactory();

        let bid = await factory.newResource(config.ns, BID, bidData.id);
        bid.amount = bidData.amount;
        bid.proposalDescription = bidData.proposalDescription;

        const jobRef = await factory.newRelationship(config.ns, JOB, bidData.job.id);
        bid.job = jobRef;

        await bidAssetRegistry.add(bid);

        const job = await jobAssetRegistry.get(bidData.job.id);

        if (job.bids) {
            job.bids.push(bid);
        } else {
            job.bids = [bid];
        }

        await jobAssetRegistry.update(job);
        return responseModel.successResponse(bid);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}


module.exports = {
    bidToJob
}