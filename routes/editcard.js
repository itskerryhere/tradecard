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
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`;
    let [adminResult] = await connection.promise().query(checkAdmin, [userid]);

    // if admin
    if (adminResult.length > 0) {

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



        const getAttackInfo = `SELECT DISTINCT attack.attack_id, attack_name, attack_damage, attack_description FROM attack 
        INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
        WHERE card_id = ? AND attack.attack_id = ?;`;
        let [attackResult] = await connection.promise().query(getAttackInfo, [cardid, attackIds[0].attack_id]);



        // if 2 attacks  
        let attack2Result = null;
        if (attackIds.length === 2) {

            const getAttack2Info = `SELECT DISTINCT attack.attack_id, attack_name, attack_damage, attack_description FROM attack 
            INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id
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
        SELECT * FROM expansion;`;

        let [result] = await connection.promise().query(getAddCardOptions);

        let stageResult = result[0];
        let rarityResult = result[1];
        let typeResult = result[2];
        let expansionResult = result[3];
        

        res.render('editcard', {title: 'Edit Card', pokemon: pokemonResult, attack: attackResult, attack2: attack2Result, weakness: weaknessResult, 
        stagelist: stageResult, raritylist: rarityResult, typelist: typeResult, expansionlist: expansionResult,
        message: message, sessionobj});
        

    // if not admin 
    } else {
        // redirect with message
        res.redirect(`/cards`);
    }
    


    
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

    let attackname = req.body.attackName.trim();
    let attackdamage = req.body.attackDamage;
    let attackdesc = req.body.attackDesc.trim();

    let attack2name = req.body.attack2Name.trim();
    let attack2damage = req.body.attack2Damage;
    let attack2desc = req.body.attack2Desc.trim();


    // get current stored attack 1 info before changes
    const currentAttackInfo = `SELECT * FROM attack 
    INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id 
    WHERE card_id = ?;`; 
    let [currentAttackInfoResult] = await connection.promise().query(currentAttackInfo, [cardid]);
    let currentAttack1Id = currentAttackInfoResult[0].attack_id;
    let currentAttack1Name = currentAttackInfoResult[0].attack_name;
    let currentAttack1Damage = currentAttackInfoResult[0].attack_damage;

    // if second attack exists , get current stored attack 2 info before changes
    let currentAttack2Id = null;
    let currentAttack2Name = null;
    let currentAttack2Damage = null;
    if (currentAttackInfoResult.length > 1) {
        currentAttack2Id = currentAttackInfoResult[1].attack_id;
        currentAttack2Name = currentAttackInfoResult[1].attack_name;
        currentAttack2Damage = currentAttackInfoResult[1].attack_damage;
    }


    // set conditions
    let a1change = null;  
    if (attackname.toLowerCase() !== currentAttack1Name.toLowerCase() && attackdamage !== currentAttack1Damage) {
        a1change = true; // if attack 1 info change
    } else {
        a1change = false; // if attack 1 info doesn't change
    }

    let a2currentstatus = false; // attack 2 doesn't exist
    if (currentAttackInfoResult.length > 1) {
        a2currentstatus = true; // attack 2 exist 
    }
    
    // if details given 
    a2given = null;
    if (attack2name === '' && attack2damage === '') {
        a2given = false;
    } else {
        a2given = true;
    }

    let a2change = null; // not assigned if does not exist 
    if (a2currentstatus === true) {
        
        if (attack2name.toLowerCase() !== currentAttack2Name.toLowerCase() && attack2damage !== currentAttack2Damage) {
            a2change = true; // if a2 exist and changed
        } else {
            a2change = false; // if a2 exist and not changed
        }
    
    } 
    

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // if attack 2 does not exist and doesn't want to be added
    if (!a2currentstatus && !a2given) {

        // check if card exists / card details the same as before (1 attack only)
        const checkCardExist = `SELECT * FROM card
        INNER JOIN card_attack ON card.card_id = card_attack.card_id
        INNER JOIN attack ON card_attack.attack_id = attack.attack_id
        WHERE pokemon_name = ? AND card_img_url = ? AND card_hp = ? AND pokedex_num = ? AND evolves_from = ? 
        AND holo = ? AND rarity_id = ? AND type_id = ? AND stage_id = ? AND weakness_id = ? AND expansion_id = ?
        AND attack_name = ? AND attack_damage = ?;`;
        let [checkCardResult] = await connection.promise().query(checkCardExist, 
            [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion, attackname, attackdamage]);

        if (checkCardResult.length > 0) {
            // redirect with message
            req.session.message = `Card already exists, or details have not changed`;
            return res.redirect(`/editcard/${cardid}`);
        }

    }
    

    // check if user attempted entering any of the minimum options needed for second attack entry
    // check if at least one option is entered
    if (attack2name !== '' || attack2damage !== '') {
        // if at least one option is entered but not all three - error message
        if (attack2name === '' || attack2damage === '') {

            // redirect with message
            req.session.message = `Fill in attack name, damage (minimum requirement) for second attack. Leave blank if no second attack`;
            return res.redirect(`/editcard/${cardid}`);
        }

    }

    
    
    // if current attack 2 exists and attack 2 may want to be changed
    let checkCard2Result = null;
    if (a2currentstatus && a2given) {

        // check if attack 2 is same details as attack 1
        if (attack2name.toLowerCase() === attackname.toLowerCase() && attack2damage === attackdamage) {
            // reload page with return message that need to fill for second attack for card to add
            req.session.message = `Second attack cannot have the same details as first attack`;
            return res.redirect(`/editcard/${cardid}`);

        // check if card info exist
        } else {

            const checkCard2Exist = `SELECT * FROM card
            INNER JOIN card_attack AS card1 ON card.card_id = card1.card_id
            INNER JOIN attack AS attack1 ON card1.attack_id = attack1.attack_id
            INNER JOIN card_attack AS card2 ON card.card_id = card2.card_id
            INNER JOIN attack AS attack2 ON card2.attack_id = attack2.attack_id
            WHERE pokemon_name = ? AND card_img_url = ? AND card_hp = ? AND pokedex_num = ? AND evolves_from = ? 
            AND holo = ? AND rarity_id = ? AND type_id = ? AND stage_id = ? AND weakness_id = ? AND expansion_id = ?
            AND attack1.attack_name = ? AND attack1.attack_damage = ?
            AND attack2.attack_name = ? AND attack2.attack_damage = ?;`;
            [checkCard2Result] = await connection.promise().query(checkCard2Exist,
                [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion, 
                    attackname, attackdamage, attack2name, attack2damage]);

            // check card exist
            if (checkCard2Result.length > 0) {
                // redirect with message
                req.session.message = `Card already exists, or details have not changed`;
                return res.redirect(`/editcard/${cardid}`);
            }
        }


    } 

    // start transaction
    const startTransaction = `START TRANSACTION;`;
    await connection.promise().query(startTransaction);
    
    try {
        

        if (a1change) { // if attack 1 exist and change 
            // change a1 info 
    
            // check if new attack 1 information entered already exist (used for another card) / same as before 
            const checkNewAttackExist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
            let [checkNewAttackResult] = await connection.promise().query(checkNewAttackExist, [attackname, attackdamage]);
            
        
            // if it does exist
            if (checkNewAttackResult.length > 0) {
        
                // get existing attackid 
                let attackid = JSON.stringify(checkNewAttackResult[0].attack_id);
        
                // link attack with the card id
                const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                await connection.promise().query(linkCardAttack, [cardid, attackid]);
        
        
                // delete the old card attack id link 
                const deleteLinkCardAttack1 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                await connection.promise().query(deleteLinkCardAttack1, [currentAttack1Id, cardid]);
    
                // check if current attack 1 is used for any other card
                const checkCurrentAttack1InUse = `SELECT card_id FROM card_attack 
                INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
                WHERE attack.attack_id = ?`;
                let [attack1InUseResult] = await connection.promise().query(checkCurrentAttack1InUse, [currentAttack1Id]);
    
                // if no other cards are using the attack - delete
                if (attack1InUseResult.length === 0) {
                    const deleteAttack = `DELETE FROM attack WHERE attack_id = ?;`;
                    await connection.promise().query(deleteAttack, [currentAttack1Id]);
                } // else keep 
        
        
            // if it doesn't exist 
            } else {
        
                // check if current attack 1 is used for any other card
                const checkCurrentAttack1InUse = `SELECT card_id FROM card_attack 
                INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
                WHERE attack.attack_id = ?`;
                let [attack1InUseResult] = await connection.promise().query(checkCurrentAttack1InUse, [currentAttack1Id]);
        
        
                // if is used by other cards
                if (attack1InUseResult.length > 1) { // still used by current card
        
                    // add new attack to attack table
                    const addAttack = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
                    let [addAttackResult] = await connection.promise().query(addAttack, [attackname, attackdesc, attackdamage]);
        
                    // get new attackid 
                    const newattackid = addAttackResult.insertId;
        
                    // link new attack id with the card id
                    const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                    await connection.promise().query(linkCardAttack, [cardid, newattackid]);
        
                    // delete the old card attack id link
                    const deleteLinkCardAttack1 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                    await connection.promise().query(deleteLinkCardAttack1, [currentAttack1Id, cardid]);
        
                // if it is not used by another card 
                } else {
        
                    // update the information of the same attack id - as this won't affect other cards
                    const updateCurrentAttack = `UPDATE attack SET attack_name = ?, attack_description = ?, attack_damage = ? WHERE attack_id = ?;`;
                    await connection.promise().query(updateCurrentAttack, [attackname, attackdesc, attackdamage, currentAttack1Id]);
        
                
                } 
            }
            
        }
        
        
    
        if (a2currentstatus && a2given && a2change) { // change attack 2
        
                // check if new attack 2 information entered already exist (used for another card) / same as before 
                const checkNewAttack2Exist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
                let [checkNewAttack2Result] = await connection.promise().query(checkNewAttack2Exist, [attack2name, attack2damage]);
            
                // if it does exist
                if (checkNewAttack2Result.length > 0) {
            
                    // get existing attackid 
                    attack2id = JSON.stringify(checkNewAttack2Result[0].attack_id);
            
                    // link attack with the card id
                    const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                    await connection.promise().query(linkCardAttack2, [cardid, attack2id]);
            
                    // delete the old card attack id link 
                    const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                    await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);
    
                    // check if current attack 2 is used for any other card
                    const checkCurrentAttack2InUse = `SELECT card_id FROM card_attack 
                    INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
                    WHERE attack.attack_id = ?`;
                    let [attack2InUseResult] = await connection.promise().query(checkCurrentAttack2InUse, [currentAttack2Id]);
    
                    // if no other cards are using the attack - delete
                    if (attack2InUseResult.length === 0) {
                        const deleteAttack = `DELETE FROM attack WHERE attack_id = ?;`;
                        await connection.promise().query(deleteAttack, [currentAttack2Id]);
                    } // else keep 
            
            
                // if it doesn't exist 
                } else {
    
                    // check if current attack 2 is used for any other card
                    const checkCurrentAttack2InUse = `SELECT card_id FROM card_attack 
                    INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
                    WHERE attack.attack_id = ?`;
                    let [attack2InUseResult] = await connection.promise().query(checkCurrentAttack2InUse, [currentAttack2Id]);
            
            
                    // if is used by other cards
                    if (attack2InUseResult.length > 1) { // currently still in use by current card
            
                        // add new attack to attack table
                        const addAttack2 = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
                        let [addAttack2Result] = await connection.promise().query(addAttack2, [attack2name, attack2desc, attack2damage]);
            
                        // get new attackid 
                        const newattack2id = addAttack2Result.insertId;
            
            
                        // link new attack 2 id with the card id
                        const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                        await connection.promise().query(linkCardAttack2, [cardid, newattack2id]);
            
                        // delete the old card attack id link
                        const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                        await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);
            
            
                    // if it is not used by another card 
                    } else {
            
                        // update the information of the same attack id - as this won't affect other cards
                        const updateCurrentAttack2 = `UPDATE attack SET attack_name = ?, attack_description = ?, attack_damage = ? WHERE attack_id = ?;`;
                        await connection.promise().query(updateCurrentAttack2, [attack2name, attack2desc, attack2damage, currentAttack2Id]);
            
                    } 
    
                }
        
    
        }
    
        if (!a2currentstatus && a2given) { // add attack 2
    
            // check if new attack 2 information entered already exist (used for another card) / same as before 
            const checkNewAttack2Exist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
            let [checkNewAttack2Result] = await connection.promise().query(checkNewAttack2Exist, [attack2name, attack2damage]);
        
            // if it does exist
            if (checkNewAttack2Result.length > 0) {
        
                // get existing attackid 
                attack2id = JSON.stringify(checkNewAttack2Result[0].attack_id);
        
                // link attack with the card id
                const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                await connection.promise().query(linkCardAttack2, [cardid, attack2id]);
        
                // delete the old card attack id link 
                const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);
        
        
            // if it doesn't exist 
            } else {
    
                // add new attack to attack table
                const addAttack2 = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
                let [addAttack2Result] = await connection.promise().query(addAttack2, [attack2name, attack2desc, attack2damage]);
    
                // get new attackid 
                const newattack2id = addAttack2Result.insertId;
    
    
                // link new attack 2 id with the card id
                const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
                await connection.promise().query(linkCardAttack2, [cardid, newattack2id]);
    
                // delete the old card attack id link
                const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
                await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);
            }
    
        }
        
        
        
        if (a2currentstatus && !a2given) {
        
            // delete the card attack link
            const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
            await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);
        
            // check if the current / now deleted attack 2 id is not in use by other cards
            const checkAttack2InUse = `SELECT card_id FROM card_attack WHERE attack_id = ?;`;
            let [attack2InUseResult] = await connection.promise().query(checkAttack2InUse, [currentAttack2Id]);
        
            // if no other cards are using the attack,
            if (attack2InUseResult.length === 0) { 
                
                // delete attack from database
                const deleteAttack = `DELETE FROM attack WHERE attack_id = ?;`;
                await connection.promise().query(deleteAttack, [currentAttack2Id]);
        
        
            }
        }

        // end transaction
        const commitTransaction = `COMMIT;`;
        await connection.promise().query(commitTransaction);
        
        // redirect with successful message
        req.session.message = `Card edited, edit a new card`;
        // res.redirect(`/cards`);
        res.redirect(`/editcard/${cardid}`);

    } catch (err) {

        // rollback the transaction
        const rollbackTransaction = `ROLLBACK;`;
        await connection.promise().query(rollbackTransaction);

        // redirect with unsuccessful message
        req.session.message = `Cannot edit card, contact...`;
        res.redirect(`/editcard/${cardid}`);
    }
    
    


});

   // edit attacks logic
    // if attack 1 exist and doesn't change 
        // attack 2 doesn't exist - no details changed message
            // no attack 2 added
            // attack 2 added 
        // attack 2 exist 
            // doesn't change - no details changed message
            // change
            // deleted 


    // if attack 1 exists and change
        // attack 2 doesn't exist 
            // no attack 2 added
            // attack 2 added 
        // attack 2 exist 
            // doesn't change
            // change
            // deleted 

     // if (!a1change) { // if attack 1 exist and doesn't change 
        
    //     if (!a2currentstatus) { // if attack 2 doesn't exist 
            
    //         if (!a2given) { // if no details added for a2 (1 attack only)
    //             // no details changed message V
    //             // redirect edit card V

    //         } else { // if details added for a2 ( 1 to 2 attacks)
    //             // add attack 2 V
    //         }
            
    //     } else { // if attack 2 exist 
            
    //         if (!a2given) { // attack 2 deleted 
    //             // delete attack 2

    //         } else { // attack 2 info given

    //             if (!a2change) { // if attack 2 info didn't change 
    //                 // no details changed V
    //                 // redirect edit card V

    //             } else { // attack 2 info changed
    //                 // change a2 info V
    //             }
    //         }
    //     }

    //     // successfully edited
    // }

    // if (a1change) { // if attack 1 exist and change 
    //     // change a1 info V
        
    //     if (!a2currentstatus) { // if attack 2 doesn't exist 
            
    //         if (a2given) { // if attack 2 info given (1 to 2 attacks)
    //             // add attack 2 V

    //         } 
            
    //     } else { // if attack 2 exist 
            
    //         if (!a2given) { // attack 2 deleted 
    //             // delete attack 2

    //         } else { // attack 2 info given

    //             if (a2change) { // attack 2 info changed
    //                // change a2 info V

    //             }
    //         }
    //     }
    //     // successfully edited

    // }


module.exports = router;