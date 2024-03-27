// connecting database
const mysql  = require("mysql2");
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tradecard',
    port: '8889' 
});

db.connect( (err)=> {
    if(err) throw err;
    console.log(`Server connecting to database tradecard`); // can use const for tradecard?
});

module.exports = db;