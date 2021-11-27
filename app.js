require('dotenv').config()
const express = require('express')
const http = require('http')
const socket = require('socket.io')
const path = require('path');
const { exec } = require("child_process");



// exec('pg_dump -f "sql.sql" "postgres://postgres:vahegh77@database-1.cmv6nqow7jh3.ca-central-1.rds.amazonaws.com:5433/treppr" ', (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//
//     console.log('Database dump success')
// });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dashboard/index.html'));
});

const server = http.Server(app);
const io = new socket.Server(server, {cors: {origin: `https://pgdumper.herokuapp.com/`}});

io.on('connection', (socket) => {

    console.log(`User connected`)
});


app.listen(PORT, (err) => {

    if (!err) {

        console.log(`STARTING SERVER - OK - : ${PORT}`);

        server.listen("7000", (err) => {
            if (!err) {
                console.log(`STARTING SOCKET SERVER - OK - : 7000`);
            } else {
                console.log(`STARTING SERVER - ERROR - ${err.message}`)
            }
        })
    } else {
        console.log(`STARTING SERVER - ERROR - : ${err}`);
    }
})