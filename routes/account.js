const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/account/', (req, res) => {

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

module.exports = router;