const express = require('express');
const router = express.Router();
const connection = require("../connection.js");



// sign up route 
router.get('/signup',  (req, res) =>  {


    res.render('signup', {title: 'Sign Up', errorMessage: ''});
});

router.post('/signup', (req, res) => {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email; 
    let password = req.body.password;

    // check if email already exists in the database
    let checkEmailExist = 'SELECT * FROM user WHERE email = ?';

    connection.query(checkEmailExist, [email], async (err, userResult) => {
        if (err) throw err;

        // if duplicate email
        if (userResult.length > 0) {

            res.render('signup', { title: 'Sign Up', errorMessage: 'Email already exists' });
        
        // if new email
        } else {
            // salt password 
            let hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
            SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
            SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

            await connection.promise().query(hashPassword, [password]);

            // insert data with hashed password
            let insertUser = `INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, @storedSaltedHash);`;

            connection.query(insertUser, [firstname, lastname, email], (err, result) => {
                if (err) throw err;
        
                // Get the new user id
                let newuserid = result.insertId;
        
                res.redirect(`/account/${newuserid}`);
            });   
        }

    });                        
   
});

module.exports = router;