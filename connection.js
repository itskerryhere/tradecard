// connecting database
const mysql  = require("mysql2");
const db = mysql.createPool({
    connectionLimit: 10, // this property specifices the maximum number of connections to create in the pool, i.e 10 SQLs in a query queue
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tradecard_practice',
    port: '8889',
    multipleStatements: true
});

db.getConnection((err) => {
    if(err) {
        return console.log(err.message);
    }else{
        return console.log(`Connection to local MySQL tradecard_practice.`); // can use const for tradecard?
    };

});

module.exports = db;