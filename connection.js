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
    if(err) {
        return console.log(err.message);
    }else{
        return console.log(`Connection to local MySQL tradecard.`); // can use const for tradecard?
    };

});

module.exports = db;