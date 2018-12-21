const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const fileUpload = require('express-fileupload');

//var { mongoService } = require('./service');

let port = process.env.PORT || 3000

let app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//mongoService.connect();

app.use( bodyParser.json() );
app.use(fileUpload());
/*
app.use(cors({
    origin: ['<DOMAIN1>', '<DOMAIN2>', ...],
    credentials: true,
}));
*/
app.use('/api/network/', require('./routes/network'));
app.use('/api/participant/', require('./routes/participant'));
app.use('/api/asset/', require('./routes/asset'));
//app.use('/api/query/', require('./routes/query'));
//app.use('/api/transaction/', require('./routes/transaction'));

app.listen(port, () => {
    console.log(`The app is up on port ${port}`);
});