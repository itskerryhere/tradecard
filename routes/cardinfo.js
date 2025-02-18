const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const axios = require('axios'); 


// cardinfo route (api, direct sql code commented out)
router.get('/cards/:cardid?', async (req, res) => {
    
    const sessionobj = req.session;
    let cardid = req.params.cardid;
    let adminStatus = false; // default

    const message = req.session.message;
    req.session.message = null;
    
    try {

        // const getcardinfo = `SELECT * FROM card 
        //     INNER JOIN type ON card.type_id = type.type_id
        //     INNER JOIN stage ON card.stage_id = stage.stage_id
        //     INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        //     INNER JOIN expansion ON card.expansion_id = expansion.expansion_id
        //     INNER JOIN series ON expansion.series_id = series.series_id
        //     WHERE card.card_id = ?;
        
        //     SELECT * FROM attack 
        //     INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
        //     WHERE card_id = ?;
            
        //     SELECT * FROM type 
        //     INNER JOIN weakness ON type.type_id = weakness.type_id
        //     INNER JOIN card ON weakness.weakness_id = card.weakness_id
        //     WHERE card_id = ?;`;

        // connection.query(getcardinfo, [cardid, cardid, cardid], async (err, result) => {
        //     if (err) throw err;

        //     let cardResult = result[0];
        //     let attackResult = result[1];
        //     let weaknessResult = result[2];

        // api fetch
        let baseURL = `http://localhost:3000`;
        let apiResult = await axios.get(`${baseURL}/cards/${cardid}`);

        let cardResult = apiResult.data.cardResult;
        let attackResult = apiResult.data.attackResult;
        let weaknessResult = apiResult.data.weaknessResult;


            // show appropriate buttons if logged in or not
            if (sessionobj.authen) {
                let userid = sessionobj.authen;

                // get collections user owns
                const getUserCollections = `SELECT * FROM collection WHERE user_id = ?;`;
                let userCollectionsResult = await connection.promise().query(getUserCollections, [userid]);
                userCollectionsResult = userCollectionsResult[0];

                // check admin
                const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`;
                let [admin] = await connection.promise().query(checkAdmin, [userid]);

                // check admin
                if (admin.length > 0) {
                    adminStatus = true;
                } 
                

                res.render('cardinfo', {cardinfo: cardResult, attackinfo: attackResult, weaknessinfo: weaknessResult, usercollectionsinfo: userCollectionsResult, message: message, adminStatus, sessionobj});

            } else {
                res.render('cardinfo', {cardinfo: cardResult, attackinfo: attackResult, weaknessinfo: weaknessResult, message: message, sessionobj});
            }

        // });



    } catch (err) {
                
        console.error("Error:", err);
        req.session.message = `Failed to load card, unexpected error`;
        res.redirect(`/cards`);
    }


});

// route for add card to collection and wishlist
router.post('/cards/:cardid?', async (req, res) => {

    const sessionobj = req.session;
    let cardid = req.params.cardid;
    let formId = req.body.cardAction;
  
    try {

        // if add to wishlist 
        if (formId === 'addToWishlist') {
            // get userid
            let userid = sessionobj.authen;

            // check for if card already exists in that wishlist before adding 
            const checkDuplicateCardWishlist = `SELECT * FROM wishlist WHERE user_id = ? AND card_id = ?;`;
            let [result] = await connection.promise().query(checkDuplicateCardWishlist, [userid, cardid]);
                
            // if card exist in wishlist - error message
            if (result.length > 0) {

                // redirect with message
                req.session.message = 'Card already in wishlist';


            // else if card doesn't exist in wishlist - add card to wishlist
            } else {
                const addtowishlist = `INSERT INTO wishlist (card_id, user_id) VALUES (?, ?);`;

                await connection.promise().query(addtowishlist, [cardid, userid]);

                // redirect with message
                req.session.message = 'Card added to wishlist';

            }


        } else if (formId === 'addToCollection') {
            
            let collectionid = req.body.collectionId;

            // check if user selected an id
            if (collectionid !== undefined) {

                // check if card already in that collection 
                const checkDuplicateCardCollection = `SELECT * FROM card_collection WHERE collection_id = ? AND card_id = ?;`;
                let [result] = await connection.promise().query(checkDuplicateCardCollection, [collectionid, cardid]);
                    
                // if card exist in collection - error message
                if (result.length > 0) {

                    // redirect with message
                    req.session.message = `Card already in selected Collection`;


                // else if not exist - add to collection 
                } else {
                    const addToCollection = `INSERT INTO card_collection (card_id, collection_id) VALUES (?, ?);`;

                    await connection.promise().query(addToCollection, [cardid, collectionid]);

                    // redirect with message
                    req.session.message = `Card added to selected Collection`;

                }

            } else {
                // redirect with message
                req.session.message = `No collection was selected`;
                
            }

        }

    } catch (err) {
            
        console.error("Error:", err);
        req.session.message = `Unexpected error`;

    } finally {

        res.redirect(`/cards/${cardid}`);
    }

});



module.exports = router;