const express = require('express');
const router = express.Router();
const connection = require("../connection.js");



// sign up route 
router.get('/signup',  (req, res) =>  {

    const sessionobj = req.session;

    // ensuring sign up page cannot be accessed again via url if already logged in
    if (!sessionobj.authen) {
        res.render('signup', {title: 'Sign Up', errorMessage: '', sessionobj});
    } else {
        res.redirect('account');
    }

    
});

router.post('/signup', (req, res) => {

    const sessionobj = req.session;  

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email; 
    let password = req.body.password;

    // check if email already exists in the database
    const checkEmailExist = `SELECT * FROM user WHERE email = ?`;

    connection.query(checkEmailExist, [email], async (err, userResult) => {
        if (err) throw err;

        // if duplicate email
        if (userResult.length > 0) {

            res.render('signup', { title: 'Sign Up', errorMessage: 'Email already exists' });
        
        // if new email
        } else {
            // salt password 
            const hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
            SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
            SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

            await connection.promise().query(hashPassword, [password]);

            // insert data with hashed password
            const insertUser = `INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, @storedSaltedHash);`;

            connection.query(insertUser, [firstname, lastname, email], (err, result) => {
                if (err) throw err;
        
                // Get the new user id
                let newuserid = result.insertId;
                sessionobj.authen = newuserid; // creating session with user id
        
                res.redirect('/account');
            });   
        }

    });                        
   
});

module.exports = router;