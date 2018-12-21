const {responseModel} = require('../model');
const config = require('../config');
const {cardService} = require('../service');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const uuid4 = require('uuid/v4');

async function createEmployee(employeeData) {

    try {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let uuid = uuid4();
        let type = "Employee";

        await businessNetworkConnection.connect(config.networkAdminCard);
        let factory = await businessNetworkConnection.getBusinessNetwork().getFactory();

        let employee = await factory.newResource(config.ns, type, uuid);
        employee.username = employeeData.username;
        if (employeeData.email) {
            employee.email = employeeData.email;
        }
        if (employeeData.language) {
            employee.language = employeeData.language
        }
        if (employeeData.firstName) {
            employee.firstName = employeeData.firstName
        }
        if (employeeData.lastName) {
            employee.lastName = employeeData.lastName
        }
        if (employeeData.phoneNumber) {
            employee.phoneNumber = employeeData.phoneNumber
        }
        if (employeeData.websiteUrl) {
            employee.websiteUrl = employeeData.websiteUrl
        }

        //TODO: Add address and work information

        let employeeRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${type}`);
        await employeeRegistry.add(employee);

        let identity = await businessNetworkConnection.issueIdentity(`${config.ns}.${type}#${employee.id}`, employee.username);
        await cardService.create(identity, employeeRegistry);

        await businessNetworkConnection.disconnect();
        //businessNetworkConnection = new BusinessNetworkConnection();
        const createdCard = `${employeeData.username}@${config.networkName}`;
        await businessNetworkConnection.connect(createdCard);
        await businessNetworkConnection.disconnect();
        return responseModel.successResponse("Employee created", employee);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function updateEmployee(employeeData) {
    try {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let type = "Employee";

        await businessNetworkConnection.connect(config.networkAdminCard);
        let employeeRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${type}`);

        let employee = await employeeRegistry.get(employeeData.id);
        employee.username = employeeData.username;
        if (employeeData.email) {
            employee.email = employeeData.email;
        }
        if (employeeData.language) {
            employee.language = employeeData.language
        }
        if (employeeData.firstName) {
            employee.firstName = employeeData.firstName
        }
        if (employeeData.lastName) {
            employee.lastName = employeeData.lastName
        }
        if (employeeData.phoneNumber) {
            employee.phoneNumber = employeeData.phoneNumber
        }
        if (employeeData.websiteUrl) {
            employee.websiteUrl = employeeData.websiteUrl
        }

        await employeeRegistry.update(employee);
        await businessNetworkConnection.disconnect();

        //businessNetworkConnection = new BusinessNetworkConnection();
        const createdCard = `${employeeData.username}@${config.networkName}`;
        await businessNetworkConnection.connect(createdCard);
        await businessNetworkConnection.disconnect();
        return responseModel.successResponse("Employee created", employee);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function createEmployer(employerData) {
    try {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let uuid = uuid4();
        let type = "Employer";

        await businessNetworkConnection.connect(config.networkAdminCard);
        let factory = await businessNetworkConnection.getBusinessNetwork().getFactory();

        let employer = factory.newResource(config.ns, type, uuid);
        employer.username = employerData.username;
        if (employerData.email) {
            employer.email = employerData.email;
        }
        if (employerData.language) {
            employer.language = employerData.language
        }
        if (employerData.firstName) {
            employer.firstName = employerData.firstName
        }
        if (employerData.lastName) {
            employer.lastName = employerData.lastName
        }
        if (employerData.phoneNumber) {
            employer.phoneNumber = employerData.phoneNumber
        }

        let employerRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${type}`);
        await employerRegistry.add(employer);

        let identity = await businessNetworkConnection.issueIdentity(`${config.ns}.${type}#${employer.id}`, employer.username);
        await cardService.create(identity, employer);
        await businessNetworkConnection.disconnect();

        //businessNetworkConnection = new BusinessNetworkConnection();
        const createdCard = `${employerData.username}@${config.networkName}`;
        await businessNetworkConnection.connect(createdCard);
        await businessNetworkConnection.disconnect();

        return responseModel.successResponse("Employer created", identity);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function updateEmployer(employerData) {
    try {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let type = "Employer";
        await businessNetworkConnection.connect(config.networkAdminCard);
        let employerRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${type}`);

        let employer = employerRegistry.get(employerData.id);
        employer.username = employerData.username;
        if (employerData.email) {
            employer.email = employerData.email;
        }
        if (employerData.language) {
            employer.language = employerData.language
        }
        if (employerData.firstName) {
            employer.firstName = employerData.firstName
        }
        if (employerData.lastName) {
            employer.lastName = employerData.lastName
        }
        if (employerData.phoneNumber) {
            employer.phoneNumber = employerData.phoneNumber
        }

        await employerRegistry.update(employer);
        await businessNetworkConnection.disconnect();

        const createdCard = `${employerData.username}@${config.networkName}`;
        await businessNetworkConnection.connect(createdCard);
        await businessNetworkConnection.disconnect();

        return responseModel.successResponse("Employer created", employer);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function addFavouriteEmployeeForEmployer(employeeId, cardName) {
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);

        const employerParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYER}`);
        const employeeParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYEE}`);

        const employer = employerParticipantRegistry.get()


    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function newConnection() {
    return new BusinessNetworkConnection();
}

async function disconnectUser(businessNetworkConnection) {
    return await businessNetworkConnection.disconnect();
}

module.exports = {
    createEmployee,
    createEmployer,
    addFavouriteEmployeeForEmployer,
    newConnection,
    disconnectUser
}