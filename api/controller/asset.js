const {newConnection} = require('./participant');

const {responseModel} = require('../model');
const config = require('../config');
const {cardService} = require('../service');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const uuid4 = require('uuid/v4');

const BID = 'Bid';
const JOB = 'Job';
const EMPLOYER = 'Employer';
const EMPLOYEE = 'Employee';

async function findEmployerByUsername(username) {
    let adminConnection = await newConnection();
    await adminConnection.connect(config.networkAdminCard);

    const employerParticipantRegistry = await adminConnection.getParticipantRegistry(`${config.ns}.${EMPLOYER}`);
    const employers = await employerParticipantRegistry.getAll();
    let id;
    employers.forEach((employer) => {
        if (employer.username === username) {
            id = employer.id;
        }
    });
    return id;
}

async function findEmployeeByUsername(username) {
    let adminConnection = await newConnection();
    await adminConnection.connect(config.networkAdminCard);

    const employerParticipantRegistry = await adminConnection.getParticipantRegistry(`${config.ns}.${EMPLOYEE}`);
    const employers = await employerParticipantRegistry.getAll();
    let id;
    employers.forEach((employee) => {
        if (employee.username === username) {
            id = employee.id;
        }
    });
    return id;
}

module.exports = {
    bidToJob,
    findEmployerByUsername,
    findEmployeeByUsername
};
