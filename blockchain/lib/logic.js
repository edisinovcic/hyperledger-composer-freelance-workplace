/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

let NS = 'com.dits.';
let _NS = 'com.dits';
const JOB = 'Job';
const RATE = 'Rate';
const EMPLOYER = 'Employer';
const EMPLOYEE = 'Employee';
const QUESTION = 'Question';
const ANSWER = 'Answer';
const VAULT = 'Vault';
const COIN_TRANSACTION = 'CoinTransaction';
const TRANSACTION_COMPLETED = 'TransactionCompleted';
const INVALID_AMOUNT = 'Amount must be greater then 0';
const INSUFFICIENT_FUNDS = 'Insufficient funds';
const BID = 'Bid';

/**
 * Add favourite 
 * @param {com.dits.AddFavouriteEmployeeForEmployer} addFavouriteEmployeeForEmployer
 * @transaction
 */
async function addFavouriteEmployeeForEmployer(transaction) {
    const employerParticipantRegistry = await getParticipantRegistry(NS + EMPLOYER);
    const employeeParticipantRegistry = await getParticipantRegistry(NS + EMPLOYEE);
    const factory = getFactory();
  
    const employer = await employerParticipantRegistry.get(transaction.employer.id);
  
    if(employer.favouriteEmployees){
    	employer.favouriteEmployees.push(transaction.employee);      
    } else {
    	employer.favouriteEmployees = [transaction.employee];
    }
  
    await employerParticipantRegistry.update(employer);
    return employer;
}

/**
 * Bid to job
 * @param {com.dits.BidToJob} bidToJob
 * @transaction
 */
async function bidToJob(transaction){
    const jobAssetRegistry = await getAssetRegistry(NS + JOB);
    const bidAssetRegistry = await getAssetRegistry(NS + BID);
    const factory = getFactory();

    let bid = await factory.newResource(_NS, BID, transaction.bidId);
    bid.amount = transaction.amount;
    bid.proposalDescription = transaction.proposalDescription;

    const jobRef = await factory.newRelationship(_NS, JOB, transaction.job.id);
    bid.job = jobRef;
  
    await bidAssetRegistry.add(bid);

    const job = await jobAssetRegistry.get(transaction.job.id);
  
    if(job.bids){
        job.bids.push(bid);
    } else {
        job.bids = [bid];
    }
  
    await jobAssetRegistry.update(job);
    return bid;
}


/**
 * Give job to employee
 * @param {com.dits.GiveJobToEmployee} giveJobToEmployee
 * @transaction
 */
async function giveJobToEmployee(transaction) {
    const employeeParticipantRegistry = await getParticipantRegistry(NS + EMPLOYEE);
    const jobAssetRegistry = await getAssetRegistry(NS + JOB);
    const factory = await getFactory();

    const employeeRef = await factory.newRelationship(_NS, EMPLOYEE, transaction.employee.id);
    let job = await jobAssetRegistry.get(transaction.job.id);
    job.employee = employeeRef;
   
    let employee = await employeeParticipantRegistry.get(transaction.employee.id);
    if(employee.jobs){
        employee.jobs.push(job);
    } else {
    	employee.jobs = [job];
    }
  
    await jobAssetRegistry.update(job);
    await employeeParticipantRegistry.update(employee);
    return job;
}


//TODO!! Just assing to other user, don't remove
/**
 * Remove job from employee
 * @param {com.dits.RemoveJobFromEmployee} removeJobFromEmployee
 * @transaction
 */
async function removeJobFromEmployee(transaction) {
    const employeeParticipantRegistry = await getParticipantRegistry(NS + EMPLOYEE);
    const jobAssetRegistry = await getAssetRegistry(NS + JOB);
    const factory = await getFactory();

    let job = await jobAssetRegistry.get(transaction.job.id);
    console.log(job);
    job.employee = 'none';
    await jobAssetRegistry.update(job);
  
    let employee = await employeeParticipantRegistry.get(transaction.employee.id);
    let jobs = [];
    for (let j of employee.jobs) {
      console.log(j);
      if(j.id !== job.id){
        jobs.push(job);
      }
    }
    employee.jobs = jobs;
    await employeeParticipantRegistry.update(employee);
    return job;
}

//TODO!!!!
/**
 * Rate job
 * @param {com.dits.RateJob} rateJob
 * @transaction
 */
async function rateJob(transaction) {
    const jobAssetRegistry = await getAssetRegistry(NS + JOB);
    const rateAssetRegistry = await getAssetRegistry(NS + RATE);
    const factory = await getFactory();

    const jobRef = await factory.newRelationship(_NS, JOB, transaction.job.id);
  
    let rate = await factory.newResource(_NS, RATE, transaction.rateId);
    rate.value = transaction.value;
    rate.job = jobRef;

    const job = await jobAssetRegistry.get(transaction.job.id);
    let participant = await getCurrentParticipant();
    console.log(participant);
    if(participant.getFullyQualifiedType === EMPLOYEE){
        job.employeeRating = transaction.rate;
    } else{
        job.employerRating = transaction.rate;
    }

    await rateAssetRegistry.add(rate);
    await jobAssetRegistry.update(job);
    return rate;
}


/**
 * Finish job
 * @param {com.dits.FinishJob} finishJob
 * @transaction
 */
async function finishJob(transaction) {
    const jobAssetRegistry = await getAssetRegistry(NS + JOB);
    let job = await jobAssetRegistry.get(transaction.job.id);
    job.isFinished = true;
    await jobAssetRegistry.update(job);
    return job;
}

/**
 * Propose question
 * @param {com.dits.ProposeQuestion} proposeQuestion
 * @transaction
 */
async function proposeQuestion(transaction) {
    const questionAssetRegistry = await getAssetRegistry(NS + QUESTION);
    const employeeParticipantRegistry = await getParticipantRegistry(NS + EMPLOYEE);
    const factory = await getFactory();
  
    let newQuestion = await factory.newResource(_NS, QUESTION, transaction.questionId);
    newQuestion.question = transaction.question;
    newQuestion.correctAnswer = transaction.correctAnswer;
  
    const employeeRef = await factory.newRelationship(_NS, EMPLOYEE, transaction.owner.id);
    newQuestion.owner = employeeRef;
    await questionAssetRegistry.add(newQuestion);

    let employee = await employeeParticipantRegistry.get(transaction.owner.id);
    if(employee.questions){
    	employee.questions.push(newQuestion);    
    } else {
    	employee.questions = [newQuestion];
    }
    
    await employeeParticipantRegistry.update(employee);
    return newQuestion;
}


/**
 * Answer proposed question
 * @param {com.dits.AnswerProposedQuestion} answerProposedQuestion
 * @transaction
 */
async function answerProposedQuestion(transaction) {
    const questionAssetRegistry = await getAssetRegistry(NS + QUESTION);
    const answerAssetRegistry = await getAssetRegistry(NS + ANSWER);
    const factory = await getFactory();
  
    const employeeRef = await factory.newRelationship(_NS, EMPLOYEE, transaction.owner.id);
    const questionRef = await factory.newRelationship(_NS, QUESTION, transaction.question.id);
    let newAnswer = await factory.newResource(_NS, ANSWER, transaction.id);
    newAnswer.question = questionRef;
    newAnswer.owner = employeeRef;
    newAnswer.answer = transaction.answer;
    await answerAssetRegistry.add(newAnswer);
  
    let question = await questionAssetRegistry.get(transaction.question.id);
    if(question.answers){
    	question.answers.push(newAnswer); 
    } else {
     	question.answers = [newAnswer]; 
    }
  
    await questionAssetRegistry.update(question);
 
    return newAnswer;
}


/**
 * Calculate Top Employees
 * @param {com.dits.CalculateTopEmployees} calculateTopEmployees
 * @transaction
 */
async function calculateTopEmployees(transaction) {
    const employeeParticipantRegistry = await getParticipantRegistry(NS + EMPLOYEE);
    let employees = employeeParticipantRegistry.getAll();
    calculateScore();
    for (let employee of employees) {
      if(employee.score){
      }
    }

}
  
  
/**
 * Calculate top 10 percent
 * @param {com.dits.CalculateTopEmployees} calculateTopEmployees
 * @transaction
 */  
async function calculateScoreForTop10Percent(transaction){


}














const DEPOSIT = 'DEPOSIT';
const DEPOSIT_COMPLETED = 'Deposit completed';

/**
 * Deposit coin
 * @param {com.dits.DepositCoin} onDepositCoin
 * @transaction
 */
async function onDepositCoin(transaction) {
    validateAmount(transaction.amount);

    let vault = transaction.vault;
    vault.amount += transaction.amount;

    let newTransaction = await getFactory().newConcept(_NS, COIN_TRANSACTION);
    newTransaction.amount = transaction.amount;
    newTransaction.type = DEPOSIT;

    if(vault.transactions){
        vault.transactions.push(newTransaction);
    } else {
        vault.transactions = [newTransaction];
    }

    let vaultAssetRegistry = await getAssetRegistry(_NS, VAULT);
    vaultAssetRegistry.update(vault);
    sendEvent(DEPOSIT_COMPLETED);
}

const WITHDRAW = 'WITHDRAW';
const WITHDRAWAL_COMPLETED = 'Withdrawal completed';

/**
 * Withdraw coin
 * @param {com.dits.WithdrawCoin} onWithdrawCoin
 * @transaction
 */
async function onWithdrawCoin(transaction) {
    validateAmount(transaction.amount);

    let vault = transaction.vault;

    if(vault.amount < transaction.amount){
        throw new Error(INSUFFICIENT_FUNDS);
    }

    vault.amount -= transaction.amount;

    let newTransaction = await getFactory().newConcept(_NS, COIN_TRANSACTION);
    newTransaction.amount = transaction.amount;
    newTransaction.type = WITHDRAW;

    if(vault.transactions){
        vault.transactions.push(newTransaction);
    } else {
        vault.transactions = [newTransaction];
    }

    let vaultAssetRegistry = getAssetRegistry(NS, VAULT);
    vaultAssetRegistry.update(newTransaction);
    sendEvent(WITHDRAWAL_COMPLETED);
}


const SEND = 'SEND';
const RECEIVE = 'RECEIVE';

/**
 * Transfer coin
 * @param {com.dits.TransferCoin} onTransferCoin
 * @transaction
 */
async function onTransferCoin(transaction){
    validateAmount(transaction.amount);
    if(transaction.sender.amount < transaction.amount){
        throw new Error(INSUFFICIENT_FUNDS);
    }

    transaction.sender.amount -= transaction.amount;
    transaction.receiver.amount += transaction.amount;

    let sendTransaction = await getFactory().newConcept(NS, COIN_TRANSACTION);
    sendTransaction.amount = transaction.amount;
    sendTransaction.type = SEND;
    if(transaction.sender.transaction) {
        transaction.sender.transactions.push(sendTransaction);
    } else {
        transaction.sender.transaction = [sendTransaction];
    }
    let receiveTransaction = await getFactory().newConcept(NS, COIN_TRANSACTION);
    receiveTransaction.amount = transaction.amount;
    receiveTransaction.type = RECEIVE;
    if(transaction.receiver.transactions) {
        transaction.receiver.transaction.push(receiveTransaction);
    } else {
        transaction.receiver.transaction = [receiveTransaction];
    }

    let vaultAssetRegistry = getAssetRegistry(NS + VAULT);
    vaultAssetRegistry.updateAll([transaction.sender, transaction.receiver]);
    sendEvent(TRANSACTION_COMPLETED);
}

/**
 * Validate Amount
 * @amount
 */
async function validateAmount(amount) {
    if (amount <= 0) {
        throw new Error(INVALID_AMOUNT);
    }
}

/**
 * Send event
 * @msg
 */
function sendEvent(msg) {
    var coinEvent = getFactory().newEvent(_NS, TRANSACTION_COMPLETED);
    coinEvent.msg = msg;
    emit(coinEvent);
}