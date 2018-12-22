const {findEmployerByUsername} = require('../asset');

const {newConnection} = require('../participant');

const {responseModel} = require('../../model');
const config = require('../../config');
const {cardService} = require('../../service');
const uuid4 = require('uuid/v4');

async function createJob(jobData, cardName) {
    let uuid = uuid4();
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);

        const employerParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYER}`);
        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);
        const factory = await businessNetworkConnection.getBusinessNetwork().getFactory();
        let job = await factory.newResource(config.ns, JOB, uuid);

        job.shortDescription = jobData.shortDescription;
        job.category = jobData.category;
        job.subCategory = jobData.subCategory;

        let employerID = await findEmployerByUsername(jobData.employer);

        job.employer = await factory.newRelationship(config.ns, EMPLOYER, employerID);
        await jobAssetRegistry.add(job);

        const employer = await employerParticipantRegistry.get(employerID);
        if (employer.jobs) {
            employer.jobs.push(job);
        } else {
            employer.jobs = [job];
        }

        await employerParticipantRegistry.update(employer);
        return responseModel.successResponse(job);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function getAllJobs(cardName) {
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);
        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);
        let jobs = await jobAssetRegistry.getAll();
        return responseModel.successResponse(jobs);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function getJobById(jobId, cardName) {
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);
        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);
        let job = await jobAssetRegistry.get(jobId);
        return responseModel.successResponse(job);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function updateJob(jobId, jobData, cardName) {
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);

        const employerParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYER}`);
        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);
        const factory = await businessNetworkConnection.getBusinessNetwork().getFactory();

        let job = jobAssetRegistry.get(jobId);
        if (jobData.shortDescription) {
            job.shortDescription = jobData.shortDescription;
        }
        if (jobData.category) {
            job.category = jobData.category;
        }
        if (jobData.subCategory) {
            job.subCategory = jobData.subCategory;
        }

        if (jobData.employer) {
            let employerID = await findEmployerByUsername(jobData.employer);
            job.employer = await factory.newRelationship(config.ns, EMPLOYER, employerID);

            const employer = await employerParticipantRegistry.get(employerID);
            if (employer.jobs) {
                employer.jobs.push(job);
            } else {
                employer.jobs = [job];
            }
            await employerParticipantRegistry.update(employer);
        }
        await jobAssetRegistry.add(job);
        return responseModel.successResponse(job);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

async function deleteJob(jobId, cardName) {
    try {
        let businessNetworkConnection = await newConnection();
        await businessNetworkConnection.connect(cardName);

        const employerParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYER}`);
        const employeeParticipantRegistry = await businessNetworkConnection.getParticipantRegistry(`${config.ns}.${EMPLOYEE}`);
        const jobAssetRegistry = await businessNetworkConnection.getAssetRegistry(`${config.ns}.${JOB}`);

        let job = jobAssetRegistry.get(jobId);
        jobAssetRegistry.delete(job);

        if (job.employer) {
            let employer = employerParticipantRegistry.get(job.employer);
            employer.jobs.remove(job); //TODO: check if this works
        }
        if (job.employee) {
            let employee = employeeParticipantRegistry.get(job.employee);
            employee.jobs.remove(job); //TODO: check if this works
        }

        return responseModel.successResponse(job);
    } catch (err) {
        let errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Create employee failed", {}, errMessage);
    }
}

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
};