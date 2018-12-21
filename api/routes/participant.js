/**
 * Participant management route
 */
let express = require('express');
let router = express.Router();
const { participantCtrl } = require('../controller');

router.post('/employee', async (req, res) => {
    let result = await participantCtrl.createEmployee(req.body);
    res.status(result.code).send(result);
});

router.post('/employer', async (req, res) => {
    let result = await participantCtrl.createEmployer(req.body);
    res.status(result.code).send(result);
});

module.exports = router;