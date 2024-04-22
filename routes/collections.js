const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// view all collections 
router.get('/collections', (req, res) => {

    const sessionobj = req.session;

    // access if only a member / has session 
    if (sessionobj.authen) {

        // get all collections 
        const getAllCollections = `SELECT * FROM collection;`;

        connection.query(getAllCollections, (err, result) => {
            if (err) throw err;

            let collectionResult = result;
            let collectionCount = collectionResult.length;

            res.render('allcollections', {title: 'All Collections', collectionlist: collectionResult, collectionCount, sessionobj});

        });

    // if not a member - login
    } else {

        res.redirect(`/login`);
    }

});


// user's owned collections route 
router.get('/collections/mycollections', (req, res) => {

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
            let collectionCount = mycollectionsResult.length;
            
            // pass the fetched user data to the accounts route
            res.render('mycollections', {title: 'My Collections',userinfo: userResult, mycollections: mycollectionsResult, message: message, collectionCount, sessionobj});
        });

    } else {
        res.redirect(`/login`);
    }
});

// user create a new collection 
router.post('/collections/mycollections', (req, res) => {

    const sessionobj = req.session;
    let collectionname = req.body.collectionName;
    let userid = sessionobj.authen;

    // check if name of collection already exists by user
    const checkCollectionName = `SELECT collection_name FROM collection WHERE user_id = ? AND collection_name = ?;`

    connection.query(checkCollectionName, [userid, collectionname], async (err, result) => {
        if (err) throw err;

        // if collection name exist - error message
        if (result.length > 0) {

            // redirect with message
            req.session.message = 'Collection name already used by yourself or someone else';
            res.redirect(`/collections/mycollections`);


        // if doesn't exist - add to collection 
        } else {
            
            const createCollection = `INSERT INTO collection (collection_name, user_id) VALUES (? ,?);`;
            await connection.promise().query(createCollection, [collectionname, userid]);

            // redirect with message
            req.session.message = 'Collection Added';
            res.redirect(`/collections/mycollections`);

        }

    });

});



module.exports = router;