require('dotenv').config()
const express = require('express')
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dashboard/index.html'));
});

app.listen(PORT, (err) => {

    if (!err) {

        console.log(`STARTING SERVER - OK - : ${PORT}`);

    } else {
        console.log(`STARTING SERVER - ERROR - : ${err}`);
    }
})