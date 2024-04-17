const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// go into each collection for more detailed cards her collection
router.get('/mycollections/:collectionid?', (req, res) => {

    const sessionobj = req.session;
    let collectionid = req.params.collectionid;

    const message = req.session.message;
    req.session.message = null;

    if (sessionobj.authen) {

        const getCollectionAndCardsInfo = `SELECT * FROM collection WHERE collection_id = ?;
        SELECT * FROM card 
        INNER JOIN card_collection ON card.card_id = card_collection.card_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        WHERE collection_id = ?;`;

        connection.query(getCollectionAndCardsInfo, [collectionid, collectionid], (err, result) => {
            if (err) throw err;

            let collectionResult = result[0][0];
            let cardcollectionResult = result[1];

            res.render('collectioninfo', {collectioninfo: collectionResult, cardcollectioninfo: cardcollectionResult, message: message, sessionobj});
        });

    } else {
        res.redirect(`/login`);
    }

});

// edit collection name and delete collection route
router.post('/mycollections/:collectionid?', async (req, res) => {

    const sessionobj = req.session;

    let collectionid = req.params.collectionid;
    let formId = req.body.collectionSettings;
    let userid = sessionobj.authen;
    let newcollectionname = req.body.collectionName;
    let cardid = req.body.cardId;

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

                 // redirect with message
                req.session.message = 'Name updated';
                res.redirect(`/mycollections/${collectionid}`);

            }
        });
            

    } else if (formId === 'deleteCollection') {

        const deleteCollection = `DELETE FROM collection WHERE collection_id = ?;`;
        await connection.promise().query(deleteCollection, [collectionid]);

        // redirect with message
        req.session.message = 'Collection Deleted';
        res.redirect(`/mycollections`);

    } else if (formId === 'deleteCard') {

        const deleteCard = `DELETE FROM card_collection WHERE card_id = ? AND collection_id = ?;`;
        await connection.promise().query(deleteCard, [cardid, collectionid]);

        // redirect with message
        req.session.message = 'Card Deleted from Collection';
        res.redirect(`/mycollections/${collectionid}`);
    }

    
});


// delete cards per collection
// delete collection
// add collection to all collections 

module.exports = router;