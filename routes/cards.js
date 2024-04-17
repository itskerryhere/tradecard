const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// cards route 
router.get('/cards',  (req, res) =>  {

    const sessionobj = req.session;
    let userid = sessionobj.authen;
    const searchKeyword = req.query.search; // catch search keyword
    let adminStatus = false; // default

    // show all cards 
    let getCardsAndAdmin = `SELECT * FROM card 
    INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
    INNER JOIN type ON card.type_id = type.type_id;

    SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;
    
    SELECT * FROM type;`;

    connection.query(getCardsAndAdmin, [userid], (err, result) => {
        if (err) throw err;


        let cardResult = result[0];
        let admin = result[1];
        let typeResult = result[2];

        // check admin
        if (admin.length > 0) {
            adminStatus = true;
        }  

        res.render('cards', { title: 'Cards', cardlist: cardResult, typelist: typeResult, adminStatus, sessionobj });


    });

    // // add more search queries

    // // If a search keyword is provided, add search filtering to the query
    // if (searchKeyword) {
    //     getCards += `WHERE pokemon_name LIKE '%${searchKeyword}%' 
    //     OR rarity_name LIKE '%${searchKeyword}%'
    //     OR type_name LIKE '%${searchKeyword}%'`;
    //     // add more search queries
    // }



   
});

module.exports = router;