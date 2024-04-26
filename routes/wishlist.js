const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// wishlist route 
router.get('/wishlist', async (req, res) => {

    const sessionobj = req.session;

    const message = req.session.message;
    req.session.message = null;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;
        const searchKeyword = req.query.search;
        let searchStatus = false;

        // get user, and get their wishlist
        const getUser = `SELECT * FROM user WHERE user_id = ?;`
        let [userResult] = await connection.promise().query(getUser, [userid]);

        let getWishlist = `SELECT * FROM wishlist 
        INNER JOIN card ON wishlist.card_id = card.card_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        WHERE user_id = ?;`;

        let getWishlistSearch = `SELECT DISTINCT card.* FROM wishlist 
        INNER JOIN card ON wishlist.card_id = card.card_id
        INNER JOIN type ON card.type_id = type.type_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        INNER JOIN card_attack ON card.card_id = card_attack.card_id
        INNER JOIN attack ON card_attack.attack_id = attack.attack_id`;

        // If a search keyword is provided, add search filtering to the query
        let wishlistResult = null;
        if (searchKeyword) {
            getWishlistSearch += ` WHERE pokemon_name LIKE '%${searchKeyword}%' 
            OR rarity_name = '${searchKeyword}'
            OR type_name = '${searchKeyword}'
            OR attack_name LIKE '%${searchKeyword}%'
            OR attack_description LIKE '%${searchKeyword}%'
            AND user_id = ?;`;

            [wishlistResult] = await connection.promise().query(getWishlistSearch, [userid]);

            searchStatus = true;
            
        } else {

            [wishlistResult] = await connection.promise().query(getWishlist, [userid]);
        }

 
        let cardCount = wishlistResult.length;
            
        // pass the fetched user data to the accounts route
        res.render('wishlist', { title: 'My Wishlist', userinfo: userResult, wishlistinfo: wishlistResult, cardCount, searchStatus, message, sessionobj });


    } else {
        res.redirect(`/login`);
    }
});

// delete card from wishlist
router.post('/wishlist', async (req, res) => {

    try {

        const sessionobj = req.session;
        let userid = sessionobj.authen;
        let cardid = req.body.deleteCardWishlist;

        const deleteCardWishlist = `DELETE FROM wishlist WHERE user_id = ? AND card_id = ?;`;
        await connection.promise().query(deleteCardWishlist, [userid, cardid]);
        
        // reload page
        req.session.message = 'Deleted card from wishlist';
        res.redirect(`/wishlist`);

    } catch (err) {
                
        console.error("Error:", err);
        req.session.message = 'Failed to delete card from wishlist';
        res.redirect(`/wishlist`);
        
    }

});

module.exports = router;