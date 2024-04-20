const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// edit new card route
router.get('/editcard/:cardid?', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;
    let cardid = req.params.cardid;

    const message = req.session.message;
    req.session.message = null;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`

    connection.query(checkAdmin, [userid], async (err, result) => {
        if (err) throw err;

        // if admin
        if (result.length > 0) {

            const getPokemonInfo = `SELECT * FROM card 
            INNER JOIN type ON card.type_id = type.type_id
            INNER JOIN stage ON card.stage_id = stage.stage_id
            INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
            INNER JOIN expansion ON card.expansion_id = expansion.expansion_id
            INNER JOIN series ON expansion.series_id = series.series_id
            WHERE card.card_id = ?;`;
            let pokemonResult = await connection.promise().query(getPokemonInfo, [cardid]);
            pokemonResult = pokemonResult[0][0];

        
            const getAttackIds = `SELECT attack.attack_id FROM attack 
            INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
            WHERE card_id = ?;`;
            let [attackIds] = await connection.promise().query(getAttackIds, [cardid]);


            const getAttackInfo = `SELECT DISTINCT attack.attack_id, attack_name, attack_damage, attack_description, type_name, strength FROM attack 
            INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
            INNER JOIN attack_type ON attack.attack_id = attack_type.attack_id
            INNER JOIN type ON attack_type.type_id = type.type_id
            WHERE card_id = ? AND attack.attack_id = ?;`;
            let [attackResult] = await connection.promise().query(getAttackInfo, [cardid, attackIds[0].attack_id]);

            // if 2 attacks  
            let attack2Result = null;
            if (attackIds.length === 2) {

                const getAttack2Info = `SELECT DISTINCT attack.attack_id, attack_name, attack_damage, attack_description, type_name, strength FROM attack 
                INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
                INNER JOIN attack_type ON attack.attack_id = attack_type.attack_id
                INNER JOIN type ON attack_type.type_id = type.type_id
                WHERE card_id = ? AND attack.attack_id = ?;`;
                [attack2Result] = await connection.promise().query(getAttack2Info, [cardid, attackIds[1].attack_id]);
            }


            
            const getWeaknessInfo =`SELECT * FROM type 
            INNER JOIN weakness ON type.type_id = weakness.type_id
            INNER JOIN card ON weakness.weakness_id = card.weakness_id
            WHERE card_id = ?;`;
            let weaknessResult = await connection.promise().query(getWeaknessInfo, [cardid]);
            weaknessResult = weaknessResult[0][0];

            const getAddCardOptions = `SELECT * FROM stage;
            SELECT * FROM rarity;
            SELECT * FROM type;
            SELECT * FROM expansion;
            SELECT * FROM series;`;

            let [result] = await connection.promise().query(getAddCardOptions);

            let stageResult = result[0];
            let rarityResult = result[1];
            let typeResult = result[2];
            let expansionResult = result[3];
            let seriesResult = result[4];
            

            res.render('editcard', {title: 'Edit Card', pokemon: pokemonResult, attack: attackResult, attack2: attack2Result, weakness: weaknessResult, 
            stagelist: stageResult, raritylist: rarityResult, typelist: typeResult, expansionlist: expansionResult, serieslist: seriesResult,
            message: message, sessionobj});
            

        // if not admin 
        } else {
            // redirect with message
            res.redirect(`/cards`);
        }
       
    });


    
});

module.exports = router;