const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// cardinfo route 
router.get('/cards/:cardid?', (req, res) => {
    
    const sessionobj = req.session;
    let cardid = req.params.cardid;

    const message = req.session.message;
    req.session.message = null;

    const getcardinfo = `SELECT * FROM card 
        INNER JOIN category ON category_id = category.category_id
        INNER JOIN type ON card.type_id = type.type_id
        INNER JOIN stage ON card.stage_id = stage.stage_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        INNER JOIN expansion ON card.expansion_id = expansion.expansion_id
        INNER JOIN series ON expansion.series_id = series.series_id
        WHERE card.card_id = ?;
    
        SELECT * FROM attack 
        INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
        WHERE card_id = ?;
        
        SELECT * FROM type 
        INNER JOIN weakness ON type.type_id = weakness.type_id
        INNER JOIN card ON weakness.weakness_id = card.weakness_id
        WHERE card_id = ?;`;

    connection.query(getcardinfo, [cardid, cardid, cardid], (err, result) => {
        if (err) throw err;

        let cardResult = result[0];
        let attackResult = result[1];
        let weaknessResult = result[2];

        res.render('cardinfo', {cardinfo: cardResult, attackinfo: attackResult, weaknessinfo: weaknessResult, message: message, sessionobj});
    });


});

// route for add card to collection and wishlist
router.post('/cards/:cardid?', async (req, res) => {

    const sessionobj = req.session;
    let cardid = req.params.cardid;

    // check if user is logged in before allowing collection and wishlist functions 
    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // check for if card already exists in that wishlist before adding 
        const checkDuplicateCard = `SELECT * FROM wishlist WHERE user_id = ? AND card_id = ?;`;

        connection.query(checkDuplicateCard, [userid, cardid], async (err, result) => {
            if (err) throw err;
            
            // if card exist in wishlist - error message
            if (result.length > 0) {

                // redirect with message
                req.session.message = 'Card already in wishlist';
                res.redirect(`/cards/${cardid}`);


            // else if card doesn't exist in wishlist - add card to wishlist
            } else {
                const addtowishlist = `INSERT INTO wishlist (card_id, user_id) VALUES (?, ?);`;

                await connection.promise().query(addtowishlist, [cardid, userid]);

                // redirect with message
                req.session.message = 'Card added to wishlist';
                res.redirect(`/cards/${cardid}`);

            }

        });

    } else {

        res.redirect(`/login`); 
    }

});





module.exports = router;