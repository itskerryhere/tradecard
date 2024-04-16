const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// go into each collection for more detailed cards her collection
router.get('/mycollections/:collectionid?', (req, res) => {

    const sessionobj = req.session;
    let collectionid = req.params.collectionid;

    // Retrieve the message from the session
    const message = req.session.message;
    // Clear the message from the session to prevent it from being displayed multiple times
    req.session.message = null;

    if (sessionobj.authen) {

        const getCollectionInfo = `SELECT * FROM collection WHERE collection_id = ?;`;

        connection.query(getCollectionInfo, [collectionid], (err, result) => {
            if (err) throw err;

            let collectionResult = result[0];

            res.render('collectioninfo', {collectioninfo: collectionResult, message: message, sessionobj});
        });

    } else {
        res.redirect('/login');
    }

});

// edit collection name and delete collection route
router.post('/mycollections/:collectionid?', async (req, res) => {

    const sessionobj = req.session;

    let collectionid = req.params.collectionid;
    let formId = req.body.collectionSettings;
    let userid = sessionobj.authen;
    let newcollectionname = req.body.collectionName;

    if (formId === 'editCollectionName') {

        // check if name of collection already exists by user
        const checkCollectionName = `SELECT collection_name FROM collection WHERE user_id = ? AND collection_name = ?;`

        connection.query(checkCollectionName, [userid, newcollectionname], async (err, result) => {
            if (err) throw err;

            // if collection name exist - error message
            if (result.length > 0) {

                req.session.message = 'Name already exists';

                res.redirect(`/mycollections/${collectionid}`);
                
            // if name doesn't exist - change name   
            } else {

                const editCollectionName = `UPDATE collection SET collection_name = ? WHERE collection_id = ?;`;
                await connection.promise().query(editCollectionName, [newcollectionname, collectionid]);

                req.session.message = 'Name updated';

                res.redirect(`/mycollections/${collectionid}`);

            }
        });
            

    } else if (formId === 'deleteCollection') {

        const deleteCollection = `DELETE FROM collection WHERE collection_id = ?;`;
    
        await connection.promise().query(deleteCollection, [collectionid]);

        req.session.message = 'Collection Deleted';

        res.redirect('/mycollections');

    }

    
});


// delete cards per collection
// delete collection
// add collection to all collections 

module.exports = router;