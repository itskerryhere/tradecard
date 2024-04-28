const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const bcrypt = require('bcrypt');


// sign up route 
router.get('/signup',  (req, res) =>  {

    const sessionobj = req.session;

    const message = req.session.message;
    req.session.message = null;

    // ensuring sign up page cannot be accessed again via url if already logged in
    if (!sessionobj.authen) {
        res.render('signup', {title: 'Sign Up', errorMessage: message, sessionobj});
    } else {
        res.redirect(`/account`);
    }

    
});

router.post('/signup', async (req, res) => {

    const sessionobj = req.session;  

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email; 
    let password = req.body.password;

    try {
        
        // check if email already exists in the database
        const checkEmailExist = `SELECT * FROM user WHERE email = ?`;
        
        let [userResult] = await connection.promise().query(checkEmailExist, [email]);
            

        // if duplicate email
        if (userResult.length > 0) {

            // redirect with message
            req.session.message = 'Email already exists';
            res.redirect(`/signup`);
        
        // if new email
        } else {

            // bcrypt
            const saltRounds = 10;
            let bcrypthash = await bcrypt.hash(password, saltRounds);

            const insertUser = `INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?);`;
            let [result] = await connection.promise().query(insertUser, [firstname, lastname, email, bcrypthash]);

            // SHA1 
            // const hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
            // SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
            // SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

            // await connection.promise().query(hashPassword, [password]);

            // insert data with hashed password
            // const insertUser = `INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, @storedSaltedHash);`;
            // let [result] = await connection.promise().query(insertUser, [firstname, lastname, email]);
            
            // Get the new user id
            let newuserid = result.insertId;
            sessionobj.authen = newuserid; // creating session with user id
    
            res.redirect(`/account`);
             
        }

        
    
    } catch (err) {
                
        console.error("Error:", err);
        req.session.message = 'Failed to sign-up, unexpected error';
        res.redirect(`/signup`);
        
    }
   
});

module.exports = router;