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

router.post('/editcard/:cardid?', async (req, res) => {

    let cardid = req.params.cardid;

    // grab fields 
    let pokemonname = req.body.pokemonName.trim();
    let pokedexnumber = req.body.pokedexNumber;
    let hp = req.body.hp;
    let url = req.body.cardURL.trim();
    let stage = req.body.stage;
    let evolvesfrom = req.body.evolvesFrom.trim();
    let rarity = req.body.rarity;
    let type = req.body.type;
    let weakness = req.body.weakness;
    let holo = req.body.holo;
    let expansion = req.body.expansion;
    let series = req.body.series;

    let attackname = req.body.attackName.trim();
    let attackdamage = req.body.attackDamage;
    let attackdesc = req.body.attackDesc.trim();
    let attacktype = req.body.attackType;
    let attackstrength = req.body.attackStrength;
    let attacktype2 = req.body.attackType2;
    let attacktype2strength = req.body.attackType2Strength;

    let attack2name = req.body.attack2Name.trim();
    let attack2damage = req.body.attack2Damage;
    let attack2desc = req.body.attack2Desc.trim();
    let attack2type = req.body.attack2Type;
    let attack2strength = req.body.attack2Strength;
    let attack2type2 = req.body.attack2Type2;
    let attack2type2strength = req.body.attack2Type2Strength;

    // check if card exists / card details the same as before 
    const checkCardExist = `SELECT * FROM card WHERE pokemon_name = ? AND card_img_url = ? AND card_hp = ? AND pokedex_num = ? AND evolves_from = ? 
        AND holo = ? AND rarity_id = ? AND type_id = ? AND stage_id = ? AND weakness_id = ? AND expansion_id = ?;`;
    let [checkCardResult] = await connection.promise().query(checkCardExist, [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion]);

    // check if attack 1 exists  
    const checkAttackExist = `SELECT * FROM attack WHERE attack_name = ?;`;
    let [checkAttackResult] = await connection.promise().query(checkAttackExist, [attackname]);


    // check if user attempted entering any of the minimum options needed for second attack entry
    // check if at least one option is entered
    if (attack2name !== '' || attack2damage !== '' || attack2type !== 'None') {
        // if at least one option is entered but not all three - error message
        if (attack2name === '' || attack2damage === '' || attack2type === 'None') {

        // redirect with message
        req.session.message = `Fill in attack name, damage and type (minimum requirement) for second attack. Leave blank if no second attack`;
        return res.redirect(`/editcard/${cardid}`);
        }

    }

    // check card exist if 1 attack / is the same
    if (checkCardResult.length > 0 && checkAttackResult.length > 0) {
        // redirect with message
        req.session.message = `Card already exists, or details have not changed`;
        return res.redirect(`/editcard/${cardid}`);
    }

    // // check if attack2 exists if / is the same 
    // let checkAttack2Result = null;
    // if (attack2name !== '') {
    //     const checkAttack2Exist = `SELECT * FROM attack WHERE attack_name = ?;`;
    //     [checkAttack2Result] = await connection.promise().query(checkAttack2Exist, [attack2name]);

    //     // check card exist
    //     if (checkCardResult.length > 0 && checkAttackResult.length > 0 && checkAttack2Result.length > 0) {
    //         // redirect with message
    //         req.session.message = `Card already exists, or details have not changed`;
    //         return res.redirect(`/editcard/${cardid}`);
    //     }

    // } 

    // check if attack 2 is same name as attack 1
    if (attack2name === attackname) {
        // reload page with return message that need to fill for second attack for card to add
        req.session.message = `Second attack cannot have the same name as first attack`;
        return res.redirect(`/editcard/${cardid}`);

    }

    // if card does not exist / details not changed and all criterias checked

    // get current stored attack 1 info before changes
    const currentAttackInfo = `SELECT * FROM attack 
    INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id 
    WHERE card_id = ?;`; 
    let [currentAttackInfoResult] = await connection.promise().query(currentAttackInfo, [cardid]);
    let currentAttack1Name = currentAttackInfoResult[0].attack_name;
    let currentAttack1Id = currentAttackInfoResult[0].attack_id;


    // check if new attack 1 information entered already exist (used for another card) / same as before 
    const checkNewAttackExist = `SELECT * FROM attack WHERE attack_name = ?;`;
    let [checkNewAttackResult] = await connection.promise().query(checkNewAttackExist, [attackname]);

    // if it does exist
    if (checkNewAttackResult.length > 0) {

        // get existing attackid 
        const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ?;`;
        let [attackid] = await connection.promise().query(getAttackID, [attackname]);
        attackid = JSON.stringify(attackid[0].attack_id);

        // link attack with the card id
        const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
        await connection.promise().query(linkCardAttack, [cardid, attackid]);

        // delete the old card attack id link 
        const deleteLinkCardAttack1 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
        await connection.promise().query(deleteLinkCardAttack1, [currentAttack1Id, cardid]);

    // if it doesn't exist 
    } else {

        // check if current attack 1 is used for any other card
        const checkAttack1InUse = `SELECT card_id FROM card_attack 
        INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
        WHERE attack_name = ?;`;
        let [attack1InUseResult] = await connection.promise().query(checkAttack1InUse, [currentAttack1Name]);
        attack1InUseResult = JSON.stringify(attack1InUseResult);

        // if is used by other cards
        if (attack1InUseResult.length > 1) { // currently still in use by current card

            // add new attack to attack table
            const addAttack = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
            await connection.promise().query(addAttack, [attackname, attackdesc, attackdamage]);

            // get new attackid 
            const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ?;`;
            let [newattackid] = await connection.promise().query(getAttackID, [attackname]);
            newattackid = JSON.stringify(newattackid[0].attack_id);

            // link attack info with attack type 1 and strength in attack_type table
            const linkAttackTypeStrength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
            await connection.promise().query(linkAttackTypeStrength, [newattackid, attacktype, attackstrength]);

            // if attack type 2 and strength entered
            if (attacktype2 !== 'None') {

                // if attacktype 2 is not the same as attacktype 1 - link to attacktype table 
                if (attacktype !== attacktype2) {

                    const linkAttackType2Strength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
                    await connection.promise().query(linkAttackType2Strength, [newattackid, attacktype2, attacktype2strength]);

                }
            }

            // link new attack id with the card id
            const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
            await connection.promise().query(linkCardAttack, [cardid, newattackid]);

            // delete the old card attack id link
            const deleteLinkCardAttack1 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
            await connection.promise().query(deleteLinkCardAttack1, [currentAttack1Id, cardid]);

        // if it is not used by another card 
        } else {

            // update the information of the same attack id - as this won't affect other cards
            const updateCurrentAttack = `UPDATE attack SET attack_name= ?, attack_description= ?, attack_damage= ? WHERE attack_id = ?;`;
            await connection.promise().query(updateCurrentAttack, [attackname, attackdesc, attackdamage, currentAttack1Id]);

            // get attack type id of current attack type 1
            const getCurrentAttackTypeInfo = `SELECT * FROM attack_type 
            INNER JOIN attack ON attack_type.attack_id = attack.attack_id 
            INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
            WHERE card_id = ? AND attack.attack_id = ?;`;
            let [currentAttackTypeInfo] = await connection.promise().query(getCurrentAttackTypeInfo, [cardid, currentAttack1Id]);
            let attackType1Id = currentAttackTypeInfo[0].attack_type_id;

            // update first attack type and strength
            const updateCurrentAttackTypeStrength = `UPDATE attack_type SET type_id = ? , strength = ? WHERE attack_type_id = ?;`;
            await connection.promise().query(updateCurrentAttackTypeStrength, [attacktype, attackstrength, attackType1Id]);

            // if second type and strength, update 
            let attackType2Id = null;
            if (currentAttackTypeInfo.length === 2) {
                attackType2Id = currentAttackTypeInfo[1].attack_type_id;

                // update second attack type and strength
                const updateCurrentAttackType2Strength = `UPDATE attack_type SET type_id = ? , strength = ? WHERE attack_type_id = ?;`;
                await connection.promise().query(updateCurrentAttackType2Strength, [attacktype2, attacktype2strength, attackType2Id]);
            }        
        } 
    }
   
    // repeat for attack 2 if attack 2 exists

    // if second attack exists , get current stored attack 2 info before changes
    let currentAttack2Name = null;
    let currentAttack2Id = null;
    if (currentAttackInfoResult.length > 0) {
        currentAttack2Name = currentAttackInfoResult[1].attack_name;
        currentAttack2Id = currentAttackInfoResult[1].attack_id;
    }

    // if all necessary details for attack 2 entered
    if (attack2name !== '' && attack2damage !== '' && attack2type !== 'None') {

        // check if new attack 2 information entered already exist (used for another card) / same as before 
        const checkNewAttack2Exist = `SELECT * FROM attack WHERE attack_name = ?;`;
        let [checkNewAttack2Result] = await connection.promise().query(checkNewAttack2Exist, [attack2name]);

        // if it does exist
        if (checkNewAttack2Result.length > 0) {

            // get existing attackid 
            const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ?;`;
            let [attack2id] = await connection.promise().query(getAttack2ID, [attack2name]);
            attack2id = JSON.stringify(attack2id[0].attack_id);

            // link attack with the card id
            const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
            await connection.promise().query(linkCardAttack2, [cardid, attack2id]);

            // delete the old card attack id link 
            const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
            await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);

        // if it doesn't exist 
        } else {

            // check if current attack 2 is used for any other card
            const checkAttack2InUse = `SELECT card_id FROM card_attack 
            INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
            WHERE attack_name = ?;`;
            let [attack2InUseResult] = await connection.promise().query(checkAttack2InUse, [currentAttack2Name]);
            attack2InUseResult = JSON.stringify(attack2InUseResult);

            // if is used by other cards
            if (attack2InUseResult.length > 1) { // currently still in use by current card

                // add new attack to attack table
                const addAttack = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
                await connection.promise().query(addAttack, [attack2name, attack2desc, attack2damage]);

                // get new attackid 
                const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ?;`;
                let [newattack2id] = await connection.promise().query(getAttack2ID, [attack2name]);
                newattack2id = JSON.stringify(newattack2id[0].attack_id);

                // link attack info with attack type 1 and strength in attack_type table
                const linkAttack2TypeStrength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
                await connection.promise().query(linkAttack2TypeStrength, [newattack2id, attack2type, attack2strength]);

                // if attack type 2 and strength entered
                if (attacktype2 !== 'None') {

                    // if attacktype 2 is not the same as attacktype 1 - link to attacktype table 
                    if (attacktype !== attacktype2) {

                        const linkAttackType2Strength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
                        await connection.promise().query(linkAttackType2Strength, [newattack2id, attack2type2, attack2type2strength]);

                    }
                }

                // link new attack id with the card id
                const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                await connection.promise().query(linkCardAttack2, [cardid, newattack2id]);

                // delete the old card attack id link
                const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);

            // if it is not used by another card 
            } else {

                // update the information of the same attack id - as this won't affect other cards
                const updateCurrentAttack2 = `UPDATE attack SET attack_name= ?, attack_description= ?, attack_damage= ? WHERE attack_id = ?;`;
                await connection.promise().query(updateCurrentAttack2, [attack2name, attack2desc, attack2damage, currentAttack2Id]);

                // get attack type id of current attack type 1
                const getCurrentAttack2TypeInfo = `SELECT * FROM attack_type 
                INNER JOIN attack ON attack_type.attack_id = attack.attack_id 
                INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
                WHERE card_id = ? AND attack.attack_id = ?;`;
                let [currentAttack2TypeInfo] = await connection.promise().query(getCurrentAttack2TypeInfo, [cardid, currentAttack2Id]);
                let attackType2Id = currentAttack2TypeInfo[0].attack_type_id;

                // update first attack type and strength
                const updateCurrentAttackTypeStrength = `UPDATE attack_type SET type_id = ? , strength = ? WHERE attack_type_id = ?;`;
                await connection.promise().query(updateCurrentAttackTypeStrength, [attack2type, attack2strength, attackType2Id]);

                // if second type and strength, update 
                let attack2Type2Id = null;
                if (currentAttack2TypeInfo.length === 2) {
                    attack2Type2Id = currentAttack2TypeInfo[1].attack_type_id;

                    // update second attack type and strength
                    const updateCurrentAttack2Type2Strength = `UPDATE attack_type SET type_id = ? , strength = ? WHERE attack_type_id = ?;`;
                    await connection.promise().query(updateCurrentAttack2Type2Strength, [attack2type2, attack2type2strength, attack2Type2Id]);
                }        
            } 
        }
    }

    // // if attack 2 deleted / left empty 
    // if (attack2name === '' && attack2strength === '' && attack2type === 'None') {
        
    //     // if current attack 2 name is in use by other cards
    //     if (attack2InUseResult.length > 1) { // still used by this card before being deleted 

    //         // delete the old card attack id link
    //         const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
    //         await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);

    //     // if it's not in use 
    //     } else {
            
    //         // delete attack_type of attack id 
    //         const deleteLinkAttack2Type = `DELETE attack_type 
    //         FROM attack_type
    //         INNER JOIN attack ON attack_type.attack_id = attack.attack_id
    //         INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
    //         WHERE card_id = ? AND attack_id = ?;`;

    //         // delete card_attack link to cardid and attackid

    //         // delete attack from attack table
    //     }
    // }

    // if attack 2 type 2 left blank 



    res.send(`${currentAttack1Name} <br> <br> ${currentAttack2Name} <br> <br> ${attack1InUseResult}`);



});


module.exports = router;