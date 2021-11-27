const socket = io("https://pgdumper.herokuapp.com:7000");

socket.on('handshake',(data) => {
    console.log(data)
})

function makeRandomName(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function dump(){
    const host = document.getElementById('host').value
    const port = document.getElementById('port').value
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const db_name = document.getElementById('db_name').value

    const fileName = makeRandomName(30)
    const command = `pg_dump -h "${host}" -p "${port}" -U "${username}" -f "${fileName}.sql" -b "${db_name}"`
    console.log(command)

    exec()
}