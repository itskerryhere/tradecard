const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// cards route 
router.get('/cards',  (req, res) =>  {

    const sessionobj = req.session;

    // catch search keyword
    const searchKeyword = req.query.search;

    // base query with no search or filter
    let getCards = `SELECT * FROM card INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
    INNER JOIN type ON card.type_id = type.type_id `;
    // add more search queries

    // If a search keyword is provided, add search filtering to the query
    if (searchKeyword) {
        getCards += `WHERE pokemon_name LIKE '%${searchKeyword}%' 
        OR rarity_name LIKE '%${searchKeyword}%'
        OR type_name LIKE '%${searchKeyword}%'`;
        // add more search queries
    }

    // filter
    let getTypes = "SELECT * FROM type";

    // sort
    // const sort = req.query.sort;

    // if (sort) {
    //     getCards += `ORDER BY ${sort}`;
    // }


    // Perform the database query to get card details
    connection.query(getCards, getTypes,  (err, cardResult) => {
 
        if (err) throw err;

        // Perform the database query to get types
        connection.query(getTypes, (err, typeResult) => {
            if (err) throw err;

            // Render the 'cards' view with the query results
            res.render('cards', { title: 'Cards', cardlist: cardResult, typelist: typeResult, sessionobj });
        });       
    });

   
});

module.exports = router;