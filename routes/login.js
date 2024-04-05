const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// log in route 
router.get('/login',  (req, res) =>  {

    res.render('login', {title: 'Login', errorMessage: ''});
});

router.post('/login', async (req, res) =>  {

    // get input data 
    let email = req.body.email;
    let password = req.body.password;


    // see if any user in database matches email and password 
    let checkUser = `SELECT * FROM user WHERE email = ? `;

    connection.query(checkUser, [email], async (err, result) => {
       if (err) throw err;

       let getNumOfUsers = result.length; // should be 1 always, as no duplicate email 

       // if user exist
       if (getNumOfUsers > 0) {
    //        let sessionObj = req.session;
    //        sessionObj.sess_valid = true;
    //        sessionObj.email = result[0].email;
    //        sessionObj.password = result[0].password;

            // unhash password 
            let getSaltInUse = `SELECT SUBSTRING(password, 1, 6) AS salt FROM user WHERE email = ?;`;
            let saltInUse = await connection.promise().query(getSaltInUse, [email]);
            saltInUse = saltInUse[0][0].salt; // accessing the Buffer values, aut oconverts from numerical to values

           
            let getStoredSaltedHashInUse = `SELECT SUBSTRING(password, 7, 40) AS storedSaltedHash FROM user WHERE email = ?;`;
            let storedSaltedHashInUse = await connection.promise().query(getStoredSaltedHashInUse, [email]);
            storedSaltedHashInUse = storedSaltedHashInUse[0][0].storedSaltedHash;
            

            let getSaltedHash = `SELECT SHA1(CONCAT(?, ?)) AS saltedHash;`
            let saltedHash = await connection.promise().query(getSaltedHash, [saltInUse, password]);
            // saltedHash = JSON.stringify(saltedHash[0]); // to test 
            saltedHash = saltedHash[0][0].saltedHash;

            
            let getSaltedInputPassword = `SELECT @saltedPassword := CONCAT(?, ?) AS saltedPassword;`;
            let saltedInputPassword = await connection.promise().query(getSaltedInputPassword, [saltInUse, saltedHash]);
            saltedInputPassword = saltedInputPassword[0][0].saltedPassword;


            let attemptLogin = `SELECT user_id FROM user WHERE email = ? AND password = ?;`;
            let result = await connection.promise().query(attemptLogin, [email, saltedInputPassword]);
            

            // if correct password
            if (result[0].length > 0) {
                let userid = JSON.stringify(result[0][0].user_id);
                res.redirect(`/welcome?userid=${userid}`); 
            
            // if incorrect password 
            } else {
                res.render('login', { title: 'Login', errorMessage: 'Incorrect password, try again' })
            }

        // if user does not exists
       } else {
            
           res.render('login', {title: 'Login', errorMessage: 'Invalid email, try again'});
       }
       
   });

});


module.exports = router;