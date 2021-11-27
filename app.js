const express = require('express')
const path = require('path');

const constants = require('./constant/vars.js')
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dashboard/index.html'));
});

app.listen(constants.PORT, constants.HOST, (err) => {

    if (!err) {

        console.log(`STARTING SERVER - OK - : ${constants.PORT}`);

    } else {
        console.log(`STARTING SERVER - ERROR - : ${err}`);
    }
})