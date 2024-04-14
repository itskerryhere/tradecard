const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/account', (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // fetch the new user data after successful insertion
        let getUser = `SELECT * FROM user WHERE user_id = ?`;

        connection.query(getUser, [userid], (err, userResult) => {
            if (err) throw err;

            // pass the fetched user data to the accounts route
            res.render('account', { title: 'Account', userinfo: userResult, sessionobj });
        });

    } else {
        res.redirect('login');
    }

});

router.get('/account/settings', (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // fetch the new user data after successful insertion
        let getUser = `SELECT * FROM user WHERE user_id = ?`;

        connection.query(getUser, [userid], (err, userResult) => {
            if (err) throw err;

            // pass the fetched user data to the accounts route
            res.render('accountsettings', {title: 'Account Settings', userinfo: userResult, message: '', sessionobj });
        });

    } else {
        res.redirect('login');
    }

});

router.post('/account/settings', async (req, res) => {

    // const formId = req.body.formId;
    const sessionobj = req.session;  

    // if (formId === 'editDetails') {
       
        // let firstname = req.body.firstname;
        // let lastname = req.body.lastname;
        // let email = req.body.email; 
        // let userid = sessionobj.authen;

        // // execute the update query
        // const editDetails = `UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?;`;
        // await connection.promise().query(editDetails, [firstname, lastname, email, userid]);


        // // get the updated user details from the database
        // const getUser = `SELECT * FROM user WHERE user_id = ?;`;

        // connection.query(getUser, [userid], (err, result) => {
        //     if (err) throw err;

        //     res.render('accountsettings', {title: 'Account Settings', userinfo: result, message: 'Details changed successfully', sessionobj });
        // });

    // } else if (formId === 'changePassword') {
        
        let oldpassword = req.body.oldpassword;
        let newpassword = req.body.newpassword;
        let userid = sessionobj.authen;

        // check old password is correct
        // unhash password 
        const getSaltInUse = `SELECT SUBSTRING(password, 1, 6) AS salt FROM user WHERE user_id = ?;`;
        let saltInUse = await connection.promise().query(getSaltInUse, [userid]);
        saltInUse = saltInUse[0][0].salt; // accessing the Buffer values, auto converts from numerical to values

       
        const getStoredSaltedHashInUse = `SELECT SUBSTRING(password, 7, 40) AS storedSaltedHash FROM user WHERE user_id = ?;`;
        let storedSaltedHashInUse = await connection.promise().query(getStoredSaltedHashInUse, [userid]);
        storedSaltedHashInUse = storedSaltedHashInUse[0][0].storedSaltedHash;
        

        const getSaltedHash = `SELECT SHA1(CONCAT(?, ?)) AS saltedHash;`
        let saltedHash = await connection.promise().query(getSaltedHash, [saltInUse, oldpassword]);
        saltedHash = saltedHash[0][0].saltedHash;

        
        const getSaltedInputPassword = `SELECT CONCAT(?, ?) AS saltedPassword;`;
        let saltedInputPassword = await connection.promise().query(getSaltedInputPassword, [saltInUse, saltedHash]);
        saltedInputPassword = JSON.stringify(saltedInputPassword[0][0].saltedPassword);

        // get stored password
        const getStoredPassword = `SELECT password AS oldpassword FROM user WHERE user_id = ?;`;
        let storedPassword = await connection.promise().query(getStoredPassword, [userid]);
        storedPassword = JSON.stringify(storedPassword[0][0].oldpassword);


        //if old password correct
        if (storedPassword === saltedInputPassword) {

            // salt new input password 
            const hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
            SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
            SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

            await connection.promise().query(hashPassword, [newpassword]);

            // execute the update query
            const changePassword = `UPDATE user SET password = @storedSaltedHash WHERE user_id = ?;`;
            await connection.promise().query(changePassword, [userid]);

            // get new details
            const getUser = `SELECT * FROM user WHERE user_id = ?;`;

            connection.query(getUser, [userid], (err, result) => {
                if (err) throw err;

                res.render('accountsettings', {title: 'Successful', userinfo: result, message: 'Password Changed Successfully', sessionobj });
            });


        // if old password wrong.. error
        } else {

            // get new details
            const getUser = `SELECT * FROM user WHERE user_id = ?;`;

            connection.query(getUser, [userid], (err, result) => {
                if (err) throw err;

                res.render('accountsettings', {title: 'Unsuccessful', userinfo: result, message: 'Old Password Incorrect', sessionobj });
            });
            
        }

        

       
    // }
    

});

module.exports = router;