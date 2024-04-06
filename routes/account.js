const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/account/:userid?', (req, res) => {

    // get userid
    let userid = req.params.userid;

    // fetch the new user data after successful insertion
    let getUser = `SELECT * FROM user WHERE user_id = ?`;

    connection.query(getUser, [userid], (err, userResult) => {
        if (err) throw err;

        // pass the fetched user data to the accounts route
        res.render('account', { title: 'Account',  userinfo: userResult });
    });
});

module.exports = router;