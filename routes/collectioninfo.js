const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// view a collection
router.get('/collections/:collectionid?', (req, res) => {

    const sessionobj = req.session;
    let collectionid = req.params.collectionid;
    let userid = sessionobj.authen;
    let collectionownerstatus = false; // default value


    const message = req.session.message;
    req.session.message = null;

    if (sessionobj.authen) {

        const getCollectionAndCardsInfo = `SELECT * FROM collection WHERE collection_id = ?;
        SELECT * FROM card 
        INNER JOIN card_collection ON card.card_id = card_collection.card_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        WHERE collection_id = ?;`;

        connection.query(getCollectionAndCardsInfo, [collectionid, collectionid], async (err, result) => {
            if (err) throw err;

            let collectionResult = result[0][0];
            let cardcollectionResult = result[1];
            let cardCount = cardcollectionResult.length;
            let likeStatus = false;
   
            
            // check if user owns selected collection 
            const checkCollectionOwner = `SELECT user_id FROM collection WHERE collection_id = ?;`
            let owner = await connection.promise().query(checkCollectionOwner, [collectionid]);
            owner = JSON.stringify(owner[0][0].user_id);

            if (owner === userid) {
                collectionownerstatus = true;
            }

            // check user's like status
            if (userid !== owner) {

                const checkLikeStatus = `SELECT * FROM user_like_collection WHERE user_id = ? AND collection_id = ?`;
                const [likeStatusResult] = await connection.promise().query(checkLikeStatus, [userid, collectionid]);
 
                if (likeStatusResult.length > 0) {
                    likeStatus = true;
                }
                
            }

            res.render('collectioninfo', {collectioninfo: collectionResult, cardcollectioninfo: cardcollectionResult, message: message, cardCount, collectionownerstatus, likeStatus, sessionobj});
        });

    } else {
        res.redirect(`/login`);
    }

});

// edit collection name and delete collection route
router.post('/collections/:collectionid?', async (req, res) => {

    const sessionobj = req.session;

    let collectionid = req.params.collectionid;
    let formId = req.body.collectionSettings;
    let userid = sessionobj.authen;
    let newcollectionname = req.body.collectionName;
    let cardid = req.body.cardId;

    try {

        if (formId === 'editCollectionName') {

            // check if name of collection already exists by user
            const checkCollectionName = `SELECT collection_name FROM collection WHERE user_id = ? AND collection_name = ?;`;
            let [collectionNameResult] = await connection.promise().query(checkCollectionName, [userid, newcollectionname]);

            // if collection name exist - error message
            if (collectionNameResult.length > 0) {

                req.session.message = 'Name already being used by yourself';
                res.redirect(`/collections/${collectionid}`);
                
            // if name doesn't exist - change name   
            } else {

                const editCollectionName = `UPDATE collection SET collection_name = ? WHERE collection_id = ?;`;
                await connection.promise().query(editCollectionName, [newcollectionname, collectionid]);

                // redirect with message
                req.session.message = 'Name updated';
                res.redirect(`/collections/${collectionid}`);

            }
                

        } else if (formId === 'deleteCollection') {

            // start transaction
            const startTransaction = `START TRANSACTION;`;
            await connection.promise().query(startTransaction);

            try {
                // delete call cards associated with collection
                const deleteCardsFromCollection = `DELETE FROM card_collection WHERE collection_id = ?`;
                await connection.promise().query(deleteCardsFromCollection, [collectionid]) 

                // delete collection 
                const deleteCollection = `DELETE FROM collection WHERE collection_id = ?;`;
                await connection.promise().query(deleteCollection, [collectionid]);

                // redirect with message
                req.session.message = 'Collection Deleted';
                res.redirect(`/collections/mycollections`);

            } catch (err) {

                // rollback the transaction
                const rollbackTransaction = `ROLLBACK;`;
                await connection.promise().query(rollbackTransaction);
                
                req.session.message = 'Failed to delete collection';
                res.redirect(`/collections/${collectionid}`);
            }


        } else if (formId === 'deleteCard') {

            const deleteCard = `DELETE FROM card_collection WHERE card_id = ? AND collection_id = ?;`;
            await connection.promise().query(deleteCard, [cardid, collectionid]);

            // redirect with message
            req.session.message = 'Card Deleted from Collection';
            res.redirect(`/collections/${collectionid}`);


        } else if (formId ==='likeCollection') {

            // start transaction
            const startTransaction = `START TRANSACTION;`;
            await connection.promise().query(startTransaction);

            try {
                
                const likeCollection = `INSERT INTO user_like_collection (collection_id, user_id) VALUES (? , ?);`;
                await connection.promise().query(likeCollection, [collectionid, userid]);

                // increase like count by 1
                const incrementLikeCount = `UPDATE collection SET like_count = like_count + 1 WHERE collection_id = ?;`;
                await connection.promise().query(incrementLikeCount, [collectionid]);

                // redirect with message
                req.session.message = `You've liked this collection`;

            } catch (err) {

                // rollback the transaction
                const rollbackTransaction = `ROLLBACK;`;
                await connection.promise().query(rollbackTransaction);

                // redirect with message
                req.session.message = 'Failed to like collection';
                    
            } finally {
                res.redirect(`/collections/${collectionid}`);
            }

            
        } else if (formId === 'unlikeCollection') {

            // start transaction
            const startTransaction = `START TRANSACTION;`;
            await connection.promise().query(startTransaction);

            try {

                const unlikeCollection = `DELETE FROM user_like_collection WHERE collection_id = ? AND user_id = ?;`;
                await connection.promise().query(unlikeCollection, [collectionid, userid]);

                // increase like count by 1
                const decrementLikeCount = `UPDATE collection SET like_count = like_count - 1 WHERE collection_id = ?;`;
                await connection.promise().query(decrementLikeCount, [collectionid]);

                // end transaction
                const commitTransaction = `COMMIT;`;
                await connection.promise().query(commitTransaction);

                // redirect with message
                req.session.message = `You've unliked this collection`;

            } catch (err) {

                // rollback the transaction
                const rollbackTransaction = `ROLLBACK;`;
                await connection.promise().query(rollbackTransaction);

                // redirect with message
                req.session.message = 'Failed to unlike collection';
                
            } 
            finally {

                res.redirect(`/collections/${collectionid}`);
            }
            
        }

    } catch (err) {
            
        console.error("Error:", err);
        req.session.message = `Failed to edit or delete collection, unexpected error`;
        res.redirect(`/collections/${collectionid}`);
       

    }

});



module.exports = router;