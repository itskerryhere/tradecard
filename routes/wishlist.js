const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// wishlist route 
router.get('/wishlist', async (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;
        const searchKeyword = req.query.search;

        // get user, and get their wishlist
        const getUser = `SELECT * FROM user WHERE user_id = ?;`
        let [userResult] = await connection.promise().query(getUser, [userid]);

        let getWishlist = `SELECT * FROM wishlist 
        INNER JOIN card ON wishlist.card_id = card.card_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        WHERE user_id = ?;`;

        let getWishlistSearch = `SELECT * FROM wishlist 
        INNER JOIN card ON wishlist.card_id = card.card_id
        INNER JOIN type ON card.type_id = type.type_id
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id`;

        // If a search keyword is provided, add search filtering to the query
        let wishlistResult = null;
        if (searchKeyword) {
            getWishlistSearch += ` WHERE pokemon_name LIKE '%${searchKeyword}%' 
            OR rarity_name = '${searchKeyword}'
            OR type_name = '${searchKeyword}'
            AND user_id = ?;`;

            [wishlistResult] = await connection.promise().query(getWishlistSearch, [userid]);
            
        } else {

            [wishlistResult] = await connection.promise().query(getWishlist, [userid]);
        }

 
        let cardCount = wishlistResult.length;
            
        // pass the fetched user data to the accounts route
        res.render('wishlist', { title: 'My Wishlist', userinfo: userResult, wishlistinfo: wishlistResult, cardCount, sessionobj });


    } else {
        res.redirect(`/login`);
    }
});

// delete card from wishlist
router.post('/wishlist', async (req, res) => {

    const sessionobj = req.session;
    const deleteCardWishlist = `DELETE FROM wishlist WHERE user_id = ? AND card_id = ?;`;
    let userid = sessionobj.authen;
    let cardid = req.body.deleteCardWishlist;

    await connection.promise().query(deleteCardWishlist, [userid, cardid]);
    
    // reload page
    res.redirect(`/wishlist`);

});

module.exports = router;