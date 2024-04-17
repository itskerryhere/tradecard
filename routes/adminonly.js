const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// add new card route
router.get('/addcard', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`

    connection.query(checkAdmin, [userid], (err, result) => {
        if (err) throw err;

        // if admin
        if (result.length > 0) {

            res.render('addcard', {title: 'Add Card', sessionobj});


        // if not admin 
        } else {
            res.redirect(`/cards`);
        }
       

    });
    //isAdmin = JSON.stringify(isAdmin[0][0].user_id);




    // check if card already exists in system
    // add card step by step 



});

module.exports = router;