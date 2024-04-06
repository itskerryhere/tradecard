const express = require('express');
const router = express.Router();
const connection = require("../connection.js");


// cardinfo route 
router.get('/cards/:cardid?', (req, res) => {
    //app.get('/cards/:cardid',  (req, res) =>  {

    let cardid = req.params.cardid;
    //const cardid = req.params.cardid;

    let readsql = `SELECT * FROM card 
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


    connection.query(readsql, [cardid, cardid, cardid], (err, result) => {
        if (err) throw err;

        let cardResult = result[0];
        let attackResult = result[1];
        let weaknessResult = result[2];

        res.render('cardinfo', { cardinfo: cardResult, attackinfo: attackResult, weaknessinfo: weaknessResult });
    });


});


module.exports = router;