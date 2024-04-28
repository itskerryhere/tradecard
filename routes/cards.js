const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const axios = require('axios'); 

// cards route 
router.get('/cards', async (req, res) =>  {

    const sessionobj = req.session;
    let userid = sessionobj.authen;
    const searchKeyword = req.query.search; // catch search keyword
    const {sort, typeFilter, weaknessFilter, hpFilter, rarityFilter, stageFilter, pokedexFilter, expansionFilter, seriesFilter} = req.query; // for filter
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

        // // show all cards 
        // let getCards = `SELECT DISTINCT card.*, rarity.rarity_name, rarity.rarity_symbol_url, type.type_name, type.type_symbol_url FROM card 
        // INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
        // INNER JOIN type ON card.type_id = type.type_id
        // INNER JOIN card_attack ON card.card_id = card_attack.card_id
        // INNER JOIN attack ON card_attack.attack_id = attack.attack_id`;

        // // If a search keyword is provided, add search filtering to the query
        // if (searchKeyword) {
        //     getCards += ` WHERE pokemon_name LIKE '%${searchKeyword}%' 
        //     OR rarity_name = '${searchKeyword}'
        //     OR type_name = '${searchKeyword}'
        //     OR attack_name LIKE '%${searchKeyword}%'
        //     OR attack_description LIKE '%${searchKeyword}%'`;
        // }

        // // add filters based on the query parameters
        // if (typeFilter) {
        //     getCards += ` AND type.type_id = ${typeFilter}`;
        // }

        // if (weaknessFilter) {
        //     getCards += ` AND weakness_id = ${weaknessFilter}`;
        // }

        // if (hpFilter) {
        //     getCards += ` AND card_hp = ${hpFilter}`;
        // }

        // if (rarityFilter) {
        //     getCards += ` AND rarity.rarity_id = ${rarityFilter}`;
        // }

        // if (stageFilter) {
        //     getCards += ` AND stage_id = ${stageFilter}`;
        // }

        // if (pokedexFilter) {
        //     getCards += ` AND pokedex_num = ${pokedexFilter}`;
        // }

        // if (expansionFilter) {
        //     getCards += ` AND expansion_id = ${expansionFilter}`;
        // }

        // if (seriesFilter) {
        //     getCards += ` AND expansion_id IN (SELECT expansion_id FROM expansion WHERE series_id = ${seriesFilter})`;
        // }

        // // sorting depending on option 
        // if (sort === 'alphabeticalAscend') {
        //     getCards += ` ORDER BY pokemon_name ASC`;

        // } else if (sort === 'alphabeticalDescend') {
        //     getCards += ` ORDER BY pokemon_name DESC`;

        // } else if (sort === 'hpAscend') {
        //     getCards += ` ORDER BY card_hp ASC`;

        // } else if (sort === 'hpDescend') {
        //     getCards += ` ORDER BY card_hp DESC`;

        // } else if (sort === 'pokedexAscend') {
        //     getCards += ` ORDER BY pokedex_num ASC`;

        // } else if (sort === 'pokedexDescend') {
        //     getCards += ` ORDER BY pokedex_num DESC`;

        // } else if (sort === 'cardId') {
        //     getCards += ` ORDER BY card_id ASC;`;

        // }


        // let [cardsResult] = await connection.promise().query(getCards);


        // // count number of cards returned 
        // let cardCount = cardsResult.length;

        // // lists for filter tab
        // const getTypes = `SELECT * FROM type ORDER BY type_name ASC;`;
        // let [typesResult] = await connection.promise().query(getTypes); 

        // const getWeakness = `SELECT * FROM weakness 
        // INNER JOIN type ON weakness.type_id = type.type_id ORDER BY type_name ASC;`;
        // let [weaknessResult] = await connection.promise().query(getWeakness);

        // const getRarity = `SELECT * FROM rarity ORDER BY rarity_id ASC;`;
        // let [rarityResult] = await connection.promise().query(getRarity);

        // const getStage = `SELECT * FROM stage ORDER BY stage_id ASC;`;
        // let[stageResult] = await connection.promise().query(getStage);

        // const getExpansion = `SELECT * FROM expansion ORDER BY expansion_name ASC;`;
        // let [expansionResult] = await connection.promise().query(getExpansion);

        // const getSeries = `SELECT * FROM series ORDER BY series_name ASC;`;
        // let [seriesResult] = await connection.promise().query(getSeries);
        

        // res.render('cards', { title: 'Cards', cardlist: cardsResult, typelist: typesResult, weaknesslist: weaknessResult, 
        // raritylist: rarityResult, stagelist: stageResult, expansionlist: expansionResult, serieslist: seriesResult, cardCount, adminStatus, message: message, sessionobj });

        // api fetch
        let baseURL = `http://localhost:3000`;
        let apiResult = await axios.get(`${baseURL}/cards`);
        

        if (searchKeyword) {
            apiResult = await axios.get(`${baseURL}/cards?search=${searchKeyword}`);
        }

        if (sort || typeFilter || weaknessFilter || hpFilter || rarityFilter || stageFilter || pokedexFilter || expansionFilter || seriesFilter) {
            apiResult = await axios.get(`${baseURL}/cards?sort=${sort}&typeFilter=${typeFilter}&weaknessFilter=${weaknessFilter}&hpFilter=${hpFilter}&rarityFilter=${rarityFilter}&stageFilter=${stageFilter}&pokedexFilter=${pokedexFilter}&expansionFilter=${expansionFilter}&seriesFilter=${seriesFilter}`);
        }

        cardsResult = apiResult.data.cardsResult; 
        let cardCount = apiResult.data.cardCount;

        let typesResult = apiResult.data.typesResult;
        let weaknessResult = apiResult.data.weaknessResult;
        let rarityResult = apiResult.data.rarityResult;
        let stageResult = apiResult.data.stageResult;
        let expansionResult = apiResult.data.expansionResult;
        let seriesResult = apiResult.data.seriesResult;

        res.render('cards', {title : 'Cards', cardlist: cardsResult, typelist: typesResult, weaknesslist: weaknessResult, raritylist: rarityResult, stagelist: stageResult, expansionlist: expansionResult, serieslist: seriesResult, cardCount, adminStatus, message, sessionobj});

    } catch (err) {
            
        console.error("Error:", err);
        res.redirect(`/`);
    }
   
});


module.exports = router;