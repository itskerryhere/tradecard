const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// user's owned collections route 
router.get('/mycollections', (req, res) => {

    const sessionobj = req.session;
    const message = req.session.message; 
    req.session.message = null; 

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        const getUserAndOwnedCollections = `SELECT * FROM user WHERE user_id = ?;
        SELECT * FROM collection WHERE user_id = ?;`; 

        connection.query(getUserAndOwnedCollections, [userid, userid], (err, result) => {
            if (err) throw err;

            let userResult = result[0];
            let mycollectionsResult = result[1];
            
            // pass the fetched user data to the accounts route
            res.render('mycollections', {title: 'My Collections',userinfo: userResult, mycollections: mycollectionsResult, message: message, sessionobj});
        });

    } else {
        res.redirect('/login');
    }
});

// user create a new collection 
router.post('/mycollections', (req, res) => {

    const sessionobj = req.session;
    let collectionname = req.body.collectionName;
    let userid = sessionobj.authen;

    // check if name of collection already exists by user
    const checkCollectionName = `SELECT collection_name FROM collection WHERE user_id = ? AND collection_name = ?;`

    connection.query(checkCollectionName, [userid, collectionname], async (err, result) => {
        if (err) throw err;

        // if collection name exist - error message
        if (result.length > 0) {

            req.session.message = 'Collection Name Already Exists';

            res.redirect(`/mycollections`);


        // if doesn't exist - add to collection 
        } else {
            
            const createCollection = `INSERT INTO collection (collection_name, user_id) VALUES (? ,?);`;
            await connection.promise().query(createCollection, [collectionname, userid]);

            req.session.message = 'Collection Added';

            res.redirect(`/mycollections`);

        }

    });

});


// delete cards per collection
// delete collection
// add collection to all collections 

module.exports = router;