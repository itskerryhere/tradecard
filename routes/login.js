const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const bcrypt = require('bcrypt');


// log in route 
router.get('/login',  (req, res) =>  {

    const sessionobj = req.session;

    const message = req.session.message;
    req.session.message = null;
    
    // ensuring login page cannot be accessed again via url if already logged in
    if (!sessionobj.authen) {
        res.render('login', {title: 'Login', errorMessage: message, sessionobj});
    } else {
        res.redirect(`/account`);
    };

   
});

router.post('/login', async (req, res) =>  { 

    const sessionobj = req.session; 

    // get input data 
    let email = req.body.email;
    let password = req.body.password;


    try {

        // see if any user in database matches email and password 
        const checkUser = `SELECT * FROM user WHERE email = ? `;
        let [checkUserResult] = await connection.promise().query(checkUser, [email]);

        let getNumOfUsers = checkUserResult.length; // should be 1 always, as no duplicate email 

        // if user exist
        if (getNumOfUsers > 0) {

            // bcrypt 
            let storedPassword = checkUserResult[0].password.toString(); // convert to string as its an object
            let match = await bcrypt.compare(password, storedPassword);

            if (match) {

                let userid = JSON.stringify(checkUserResult[0].user_id); 
                sessionobj.authen = userid; // creating session with user id

                res.redirect(`/account`);
                
            } else {

                // redirect with message
                req.session.message = 'Incorrect password, try again';
                res.redirect(`/login`);

            }

            // // SHA1
            // // unhash password 
            // const getSaltInUse = `SELECT SUBSTRING(password, 1, 6) AS salt FROM user WHERE email = ?;`;
            // let saltInUse = await connection.promise().query(getSaltInUse, [email]);
            // saltInUse = saltInUse[0][0].salt; // accessing the Buffer values, auto converts from numerical to values

        
            // const getStoredSaltedHashInUse = `SELECT SUBSTRING(password, 7, 40) AS storedSaltedHash FROM user WHERE email = ?;`;
            // let storedSaltedHashInUse = await connection.promise().query(getStoredSaltedHashInUse, [email]);
            // storedSaltedHashInUse = storedSaltedHashInUse[0][0].storedSaltedHash;
            

            // const getSaltedHash = `SELECT SHA1(CONCAT(?, ?)) AS saltedHash;`
            // let saltedHash = await connection.promise().query(getSaltedHash, [saltInUse, password]);
            // saltedHash = saltedHash[0][0].saltedHash;

            
            // const getSaltedInputPassword = `SELECT CONCAT(?, ?) AS saltedPassword;`;
            // let saltedInputPassword = await connection.promise().query(getSaltedInputPassword, [saltInUse, saltedHash]);
            // saltedInputPassword = saltedInputPassword[0][0].saltedPassword;


            // const attemptLogin = `SELECT user_id FROM user WHERE email = ? AND password = ?;`;
            // let result = await connection.promise().query(attemptLogin, [email, saltedInputPassword]);
            

            // // if correct password
            // if (result[0].length > 0) {
                
            //     let userid = JSON.stringify(result[0][0].user_id); 
            //     sessionobj.authen = userid; // creating session with user id

            //     res.redirect(`/account`);
            
            // // if incorrect password 
            // } else {

            //     // redirect with message
            //     req.session.message = 'Incorrect password, try again';
            //     res.redirect(`/login`);

            // }

            // if user does not exists
        } else {
                
            // redirect with message
            req.session.message = 'Invalid email, try again';
            res.redirect(`/login`);
        }
       

    } catch (err) {
            
        console.error("Error:", err);
        req.session.message = 'Failed to log in, unexpected error';
        res.redirect(`/login`);
        
    }

});

router.get('/logout', (req, res) => {
    
    req.session.destroy();

    // 1 sec delay
    setTimeout( () => {
        res.redirect(`/`);
    }, 1000);
    

});


module.exports = router;