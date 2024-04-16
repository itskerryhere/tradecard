const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

const getUserAndWishlist = `SELECT * FROM user WHERE user_id = ?;
SELECT * FROM wishlist 
INNER JOIN card ON wishlist.card_id = card.card_id
INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
WHERE user_id = ?;`; 

// wishlist route 
router.get('/wishlist', (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // get user, and get their wishlist

        connection.query(getUserAndWishlist, [userid, userid], (err, result) => {
            if (err) throw err;

            let userResult = result[0];
            let wishlistResult = result[1];
            
            // pass the fetched user data to the accounts route
            res.render('wishlist', { title: 'My Wishlist', userinfo: userResult, wishlistinfo: wishlistResult, sessionobj });
        });

    } else {
        res.redirect('login');
    }
});

router.post('/wishlist', async (req, res) => {

    const sessionobj = req.session;
    const deleteCardWishlist = `DELETE FROM wishlist WHERE user_id = ? AND card_id = ?;`;
    let userid = sessionobj.authen;
    let cardid = req.body.deleteCardWishlist;


    await connection.promise().query(deleteCardWishlist, [userid, cardid]);
    
    // reload page
    connection.query(getUserAndWishlist, [userid, userid], (err, result) => {
        if (err) throw err;

        let userResult = result[0];
        let wishlistResult = result[1];
        
        // pass the fetched user data to the accounts route
        res.render('wishlist', { title: 'My Wishlist', userinfo: userResult, wishlistinfo: wishlistResult, sessionobj });
    });

    



});

module.exports = router;