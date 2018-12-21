/**
* Asset routes
*/
const {connectUser} = require('../controller/participant');

let express = require('express');
let router = express.Router();
const { assetCtrl } = require('../controller');

/**
 * URL: (GET) http://localhost:3000/api/asset/job
 */
router.get('/job', async (req, res) => {
    let result = await assetCtrl.getAll(req.headers.authorization.split(' ')[1]);
    res.status(result.code).send(result);
});

/**
 * URL: (GET) http://localhost:3000/api/asset/job/:id
 */
router.get('/job/:id', async (req, res) => {
    let result = await assetCtrl.getAll(req.params.id, req.headers.authorization.split(' ')[1]);
    res.status(result.code).send(result);
});

/**
 * URL: (POST) http://localhost:3000/api/asset/job
 * Request Obj:
 * {
 * "shortDescription": "Description",
 * "category":"Programming",
 * "subCategory":"Blockchain",
 * "employer": "Employer1"
 * }
 */
router.post('/job', async (req, res) => {
    let result = await assetCtrl.addJob(req.body, req.headers.authorization.split(' ')[1]);
    res.status(result.code).send(result);
});

/**
 * URL: (PUT) http://localhost:3000/api/asset/job/:id
 * Request Obj:
 * {
 * "shortDescription": "Description",
 * "category":"Programming",
 * "subCategory":"Blockchain",
 * "employer": "Employer1"
 * }
 */
router.put('/job/:id', async (req, res) => {
    let result = await assetCtrl.addJob(req.params.id, req.headers.authorization.split(' ')[1]);
    res.status(result.code).send(result);
});

//----------------------------------------------------------

/**
 * URL: (POST) http://localhost:3000/api/participant/bid
 * Request Obj:
 * {
 *	"email":"employee1@gmail.com",
 *	"firstName":"fnameP1",
 *	"lastName":"lnameP1",
 *  "phoneNumber":"+385996666666",
 *  "websiteUrl":"www.example.com"
 * }
 */
router.post('/bid', async (req, res) => {
    let result = await assetCtrl.bidToJob(req.body,  req.headers.authorization.split(' ')[1]);
    await assetCtrl.disconnectUser(result);
    res.status(result.code).send(result);
});


module.exports = router;