const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/account', (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // fetch user data 
        const getUser = `SELECT * FROM user WHERE user_id = ?;`;

        connection.query(getUser, [userid], (err, userResult) => {
            if (err) throw err;

            // pass the fetched user data to the accounts route
            res.render('account', { title: 'Account', userinfo: userResult, sessionobj });
        });

    } else {
        res.redirect(`/login`);
    }

});

// account settings route
router.get('/account/settings', (req, res) => {

    const sessionobj = req.session;

    const message = req.session.message;
    req.session.message = null;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // fetch the new user data after successful insertion
        let getUser = `SELECT * FROM user WHERE user_id = ?`;

        connection.query(getUser, [userid], (err, userResult) => {
            if (err) throw err;

            // pass the fetched user data to the accounts route
            res.render('accountsettings', {title: 'Account Settings', userinfo: userResult, message: message, sessionobj });
        });

    } else {
        res.redirect(`/login`);
    }

});

// edit account details, change password and delete account post
router.post('/account/settings', async (req, res) => {

    const sessionobj = req.session;  
    const formId = req.body.accountForm;

    // edit details form
    if (formId === 'editDetails') {
       
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email; 
        let userid = sessionobj.authen;

        // execute the update query
        const editDetails = `UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?;`;
        await connection.promise().query(editDetails, [firstname, lastname, email, userid]);

        // redirect with new message
        req.session.message = 'Details changed successfully';
        res.redirect(`/account/settings`);


    // change password form
    } else if (formId === 'changePassword') {
        
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

            // redirect with message
            req.session.message = 'Password Changed Successfully';
            res.redirect(`/account/settings`);


        // if old password wrong.. error
        } else {

            // redirect with message
            req.session.message = 'Old Password Incorrect';
            res.redirect(`/account/settings`);

            
        }
       
    } else if (formId === 'deleteAccount') {

        const sessionobj = req.session;
        const deleteAccount = `DELETE FROM user WHERE user_id = ?`;
        let userid = sessionobj.authen;

        connection.query(deleteAccount, [userid], (err, result) => {
            if (err) throw err;

            // delete session
            req.session.destroy();

            // 1 sec delay
            setTimeout( () => {
                res.redirect(`/`);
            }, 1000);

        });

    } 

});

module.exports = router;