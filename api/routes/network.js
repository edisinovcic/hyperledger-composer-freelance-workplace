/**
 * Network info route
 */

const {deleteCard} = require('../service/card.service')

const {importCardToNetwork} = require('../service/card.service');

//import DitsNetwork from "../DitsNetwork";

let express = require('express');
let router = express.Router()
const {networkCtrl} = require('../controller');

/**
 * URL: (GET) http://localhost:3000/api/network/info
 */
router.get('/info', async (req, res) => {
    let result = await networkCtrl.info();
    res.status(result.code).send(result);
});

/**
 * URL: (POST) http://localhost:3000/api/network/login
 */
router.post('/login', async (req, res) => {
    let idCardName = await importCardToNetwork(req.files.card.data);
    if (!idCardName) {
        res.status(403).json({message: "Logging failed"});
    }
    res.json({message: "Logging Successful", accessToken: idCardName})
});

/**
 * URL: (POST) http://localhost:3000/api/network/logout
 */
router.post('/logout', async (req, res) => {
    let cardName = req.headers.authorization;
    await deleteCard(cardName);
    res.json({message: "User added Successfully"});
})
;

module.exports = router;