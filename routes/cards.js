const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// cards route 
router.get('/cards', async (req, res) =>  {

    const sessionobj = req.session;
    let userid = sessionobj.authen;
    const searchKeyword = req.query.search; // catch search keyword
    const {typeFilter, weaknessFilter, hpFilter, rarityFilter, stageFilter, pokedexFilter, expansionFilter, seriesFilter} = req.query; // for filter
    const {sort} = req.query;
    let adminStatus = false; // default

    const message = req.session.message;
    req.session.message = null;

    try {

        // get admin
        const getAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`;
        let [admin] = await connection.promise().query(getAdmin, [userid]);

        // check admin
        if (admin.length > 0) {
            adminStatus = true;
        } 

        // show all cards 
        let getCards = `SELECT * FROM card 
        INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        INNER JOIN type ON card.type_id = type.type_id`;

        // If a search keyword is provided, add search filtering to the query
        if (searchKeyword) {
            getCards += ` WHERE pokemon_name LIKE '%${searchKeyword}%' 
            OR rarity_name = '${searchKeyword}'
            OR type_name = '${searchKeyword}'`;
            // add more search queries
        }

        // add filters based on the query parameters
        if (typeFilter) {
            getCards += ` AND type.type_id = ${typeFilter}`;
        }

        if (weaknessFilter) {
            getCards += ` AND weakness_id = ${weaknessFilter}`;
        }

        if (hpFilter) {
            getCards += ` AND card_hp = ${hpFilter}`;
        }

        if (rarityFilter) {
            getCards += ` AND rarity.rarity_id = ${rarityFilter}`;
        }

        if (stageFilter) {
            getCards += ` AND stage_id = ${stageFilter}`;
        }

        if (pokedexFilter) {
            getCards += ` AND pokedex_num = ${pokedexFilter}`;
        }

        if (expansionFilter) {
            getCards += ` AND expansion_id = ${expansionFilter}`;
        }

        if (seriesFilter) {
            getCards += ` AND expansion_id IN (SELECT expansion_id FROM expansion WHERE series_id = ${seriesFilter})`;
        }

        // sorting depending on option 
        if (sort === 'alphabeticalAscend') {
            getCards += ` ORDER BY pokemon_name ASC`;

        } else if (sort === 'alphabeticalDescend') {
            getCards += ` ORDER BY pokemon_name DESC`;

        } else if (sort === 'hpAscend') {
            getCards += ` ORDER BY card_hp ASC`;

        } else if (sort === 'hpDescend') {
            getCards += ` ORDER BY card_hp DESC`;

        } else if (sort === 'pokedexAscend') {
            getCards += ` ORDER BY pokedex_num ASC`;

        } else if (sort === 'pokedexDescend') {
            getCards += ` ORDER BY pokedex_num DESC`;

        } else if (sort === 'cardId') {
            getCards += ` ORDER BY card_id ASC;`;

        }


        let [cardsResult] = await connection.promise().query(getCards);

        // count number of cards returned 
        let cardCount = cardsResult.length;

        // lists for filter tab
        const getTypes = `SELECT * FROM type ORDER BY type_name ASC;`;
        let [typesResult] = await connection.promise().query(getTypes); 

        const getWeakness = `SELECT * FROM weakness 
        INNER JOIN type ON weakness.type_id = type.type_id ORDER BY type_name ASC;`;
        let [weaknessResult] = await connection.promise().query(getWeakness);

        const getRarity = `SELECT * FROM rarity ORDER BY rarity_id ASC;`;
        let [rarityResult] = await connection.promise().query(getRarity);

        const getStage = `SELECT * FROM stage ORDER BY stage_id ASC;`;
        let[stageResult] = await connection.promise().query(getStage);

        const getExpansion = `SELECT * FROM expansion ORDER BY expansion_name ASC;`;
        let [expansionResult] = await connection.promise().query(getExpansion);

        const getSeries = `SELECT * FROM series ORDER BY series_name ASC;`;
        let [seriesResult] = await connection.promise().query(getSeries);
        
        res.render('cards', { title: 'Cards', cardlist: cardsResult, typelist: typesResult, weaknesslist: weaknessResult, 
        raritylist: rarityResult, stagelist: stageResult, expansionlist: expansionResult, serieslist: seriesResult, cardCount, adminStatus, message: message, sessionobj });

    } catch (err) {
            
        console.error("Error:", err);
        res.redirect(`/`);
    }
   
});


module.exports = router;