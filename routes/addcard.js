const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const axios = require('axios'); 

// add new card route
router.get('/addcard', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    const message = req.session.message;
    req.session.message = null;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`

    connection.query(checkAdmin, [userid], async (err, result) => {
        if (err) throw err;

        // if admin
        if (result.length > 0) {

            // get button functions
            const getAddCardOptions = `SELECT * FROM stage;
            SELECT * FROM rarity;
            SELECT * FROM type;
            SELECT * FROM expansion;`;

            let [result] = await connection.promise().query(getAddCardOptions);

            let stageResult = result[0];
            let rarityResult = result[1];
            let typeResult = result[2];
            let expansionResult = result[3];

            res.render('addcard', {title: 'Add Card', stagelist: stageResult, raritylist: rarityResult, typelist: typeResult,
            expansionlist: expansionResult, message: message, sessionobj});

        // if not admin 
        } else {
            res.redirect(`/cards`);
        }
       
    });


});

// submit add card (via api)
router.post('/addcard', async (req, res) => {
    

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
    // let attacktype = req.body.attackType;
    // let attackstrength = req.body.attackStrength;
    // let attacktype2 = req.body.attackType2;
    // let attacktype2strength = req.body.attackType2Strength;

    let attack2name = req.body.attack2Name.trim();
    let attack2damage = req.body.attack2Damage;
    let attack2desc = req.body.attack2Desc.trim();
    // let attack2type = req.body.attack2Type;
    // let attack2strength = req.body.attack2Strength;
    // let attack2type2 = req.body.attack2Type2;
    // let attack2type2strength = req.body.attack2Type2Strength;


    // if valid numbers entered
    if (pokedexnumber < 0) {
        req.session.message = `Pokedex number cannot be a negative value`;
        return res.redirect(`/addcard`);
    }
    
    if (hp < 0) {
        req.session.message = `HP cannot be a negative value`;
        return res.redirect(`/addcard`);
    }
    console.log(attackdamage,attack2damage);
    // if (attackdamage || attack2damage < 0) {
    //     req.session.message = `Attack damage cannot be a negative value`;
    //     return res.redirect(`/addcard`);
    // }
    
    // check if card exists (1 attack only)
    if (attack2name === '' && attack2damage === '') {

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
            req.session.message = `Card already exists, try another card`;
            return res.redirect(`/addcard`);
        }

    }
    
    

    // check if user attempted entering any of the minimum options needed for second attack entry
    // check if at least one option is entered but not all needed - error message
    if (attack2name !== '' || attack2damage !== '') {

        if (attack2name === '' || attack2damage === '') {

            // redirect with message
            req.session.message = `Fill in attack name, damage (minimum requirement) for second attack. Leave blank if no second attack`;
            return res.redirect(`/addcard`);
        }

    }

    // check if attack2 exists if / is the same 
    if (attack2name !== '' && attack2damage !== '') {

        // check if attack 2 is same name as attack 1
        if (attack2name.toLowerCase() === attackname.toLowerCase() && attack2damage === attackdamage) {
            // reload page with return message that need to fill for second attack for card to add
            req.session.message = `Second attack cannot have the same details as first attack`;
            return res.redirect(`/addcard`);

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
            let [checkCard2Result] = await connection.promise().query(checkCard2Exist,
                [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion, 
                    attackname, attackdamage, attack2name, attack2damage]);
    
            // check card exist
            if (checkCard2Result.length > 0) {
                // redirect with message
                req.session.message = `Card already exists, try another card`;
                return res.redirect(`/addcard`);
            }
        }

    } 
    
    // if card does not exist and all criterias checked
    try {

        const sendtoAPI = {
            // grab fields 
            pokemonname : req.body.pokemonName.trim(),
            pokedexnumber : req.body.pokedexNumber,
            hp : req.body.hp,
            url : req.body.cardURL.trim(),
            stage : req.body.stage,
            evolvesfrom : req.body.evolvesFrom.trim(),
            rarity : req.body.rarity,
            type : req.body.type,
            weakness : req.body.weakness,
            holo : req.body.holo,
            expansion : req.body.expansion,
        
            attackname : req.body.attackName.trim(),
            attackdamage : req.body.attackDamage,
            attackdesc : req.body.attackDesc.trim(),
        
            attack2name : req.body.attack2Name.trim(),
            attack2damage : req.body.attack2Damage,
            attack2desc : req.body.attack2Desc.trim()
        }

        const config = {

            headers : { 
                'Content-Type' :'application/x-www-form-urlencoded'
            }

        }

        let apiAddCard = await axios.post('http://localhost:3000/addcard', sendtoAPI, config);
        //let newcardid = apiAddCard.data.newcardid;

        
        // redirect with successful message
        req.session.message = `Card added, add a new card`;
        //res.redirect(`/cards/${newcardid}`);
        

    } catch (err) {

        // redirect with unsuccessful message
        req.session.message = `Cannot add card, unexpected error`;
        
        
    } finally {

        res.redirect(`/addcard`);

    }

    


});

// submit add card (direct to sql)
// router.post('/addcard', async (req, res) => {

//         // grab fields 
//         let pokemonname = req.body.pokemonName.trim();
//         let pokedexnumber = req.body.pokedexNumber;
//         let hp = req.body.hp;
//         let url = req.body.cardURL.trim();
//         let stage = req.body.stage;
//         let evolvesfrom = req.body.evolvesFrom.trim();
//         let rarity = req.body.rarity;
//         let type = req.body.type;
//         let weakness = req.body.weakness;
//         let holo = req.body.holo;
//         let expansion = req.body.expansion;

//         let attackname = req.body.attackName.trim();
//         let attackdamage = req.body.attackDamage;
//         let attackdesc = req.body.attackDesc.trim();
//         // let attacktype = req.body.attackType;
//         // let attackstrength = req.body.attackStrength;
//         // let attacktype2 = req.body.attackType2;
//         // let attacktype2strength = req.body.attackType2Strength;

//         let attack2name = req.body.attack2Name.trim();
//         let attack2damage = req.body.attack2Damage;
//         let attack2desc = req.body.attack2Desc.trim();
//         // let attack2type = req.body.attack2Type;
//         // let attack2strength = req.body.attack2Strength;
//         // let attack2type2 = req.body.attack2Type2;
//         // let attack2type2strength = req.body.attack2Type2Strength;


        
//         // check if card exists (1 attack only)
//         if (attack2name === '' && attack2damage === '') {

//             const checkCardExist = `SELECT * FROM card
//             INNER JOIN card_attack ON card.card_id = card_attack.card_id
//             INNER JOIN attack ON card_attack.attack_id = attack.attack_id
//             WHERE pokemon_name = ? AND card_img_url = ? AND card_hp = ? AND pokedex_num = ? AND evolves_from = ? 
//             AND holo = ? AND rarity_id = ? AND type_id = ? AND stage_id = ? AND weakness_id = ? AND expansion_id = ?
//             AND attack_name = ? AND attack_damage = ?;`;
//             let [checkCardResult] = await connection.promise().query(checkCardExist, 
//                 [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion, attackname, attackdamage]);

//             if (checkCardResult.length > 0) {
//                 // redirect with message
//                 req.session.message = `Card already exists, try another card`;
//                 return res.redirect(`/addcard`);
//             }

//         }
        
        

//         // check if user attempted entering any of the minimum options needed for second attack entry
//         // check if at least one option is entered but not all needed - error message
//         if (attack2name !== '' || attack2damage !== '') {

//             if (attack2name === '' || attack2damage === '') {

//                 // redirect with message
//                 req.session.message = `Fill in attack name, damage (minimum requirement) for second attack. Leave blank if no second attack`;
//                 return res.redirect(`/addcard`);
//             }

//         }

//         // check if attack2 exists if / is the same 
//         if (attack2name !== '' && attack2damage !== '') {

//             // check if attack 2 is same name as attack 1
//             if (attack2name.toLowerCase() === attackname.toLowerCase() && attack2damage === attackdamage) {
//                 // reload page with return message that need to fill for second attack for card to add
//                 req.session.message = `Second attack cannot have the same details as first attack`;
//                 return res.redirect(`/addcard`);

//             } else {
//                 const checkCard2Exist = `SELECT * FROM card
//                 INNER JOIN card_attack AS card1 ON card.card_id = card1.card_id
//                 INNER JOIN attack AS attack1 ON card1.attack_id = attack1.attack_id
//                 INNER JOIN card_attack AS card2 ON card.card_id = card2.card_id
//                 INNER JOIN attack AS attack2 ON card2.attack_id = attack2.attack_id
//                 WHERE pokemon_name = ? AND card_img_url = ? AND card_hp = ? AND pokedex_num = ? AND evolves_from = ? 
//                 AND holo = ? AND rarity_id = ? AND type_id = ? AND stage_id = ? AND weakness_id = ? AND expansion_id = ?
//                 AND attack1.attack_name = ? AND attack1.attack_damage = ?
//                 AND attack2.attack_name = ? AND attack2.attack_damage = ?;`;
//                 let [checkCard2Result] = await connection.promise().query(checkCard2Exist,
//                     [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion, 
//                         attackname, attackdamage, attack2name, attack2damage]);
        
//                 // check card exist
//                 if (checkCard2Result.length > 0) {
//                     // redirect with message
//                     req.session.message = `Card already exists, try another card`;
//                     return res.redirect(`/addcard`);
//                 }
//             }

//         } 
        
//         // if card does not exist and all criterias checked

//         // start transaction
//         const startTransaction = `START TRANSACTION;`;
//         await connection.promise().query(startTransaction);

//         try{

//             // check if attack 1 exists  
//             const checkAttackExist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//             let [checkAttackResult] = await connection.promise().query(checkAttackExist, [attackname, attackdamage]);

//             // if attack 1 does not exist - add new attack details
//             let attackid = null;
//             if (checkAttackResult.length === 0) {

//             // add to attack table
//             const addAttack = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
//             await connection.promise().query(addAttack, [attackname, attackdesc, attackdamage]);

//             // get new attackid 
//             const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//             [attackid] = await connection.promise().query(getAttackID, [attackname, attackdamage]);
//             attackid = JSON.stringify(attackid[0].attack_id);


//             // // link attack info with attack types and strength in attack_type table
//             // const linkAttackTypeStrength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
//             // await connection.promise().query(linkAttackTypeStrength, [attackid, attacktype, attackstrength]);


//             // // if attack type 2 and strength entered
//             // if (attacktype2 !== 'None') {

//             //     // if attacktype 2 is not the same as attacktype 1 - link to attacktype table 
//             //     if (attacktype !== attacktype2) {

//             //         const linkAttackType2Strength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
//             //         await connection.promise().query(linkAttackType2Strength, [attackid, attacktype2, attacktype2strength]);

//             //     }
                
//             // }

//         // if attack already exists - get existing attackid
//         } else {

//             // get existing attackid 
//             const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//             [attackid] = await connection.promise().query(getAttackID, [attackname, attackdamage]);
//             attackid = JSON.stringify(attackid[0].attack_id);

//         }


//         // if all necessary details for attack 2 entered
//         let attack2id = null;
//         if (attack2name !== '' && attack2damage !== '') {

//             const checkAttack2Exist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//             let [checkAttack2Result] = await connection.promise().query(checkAttack2Exist, [attack2name, attack2damage]);

//             // if not exist - add new attack details 
//             if (checkAttack2Result.length === 0) {

//                 // add to attack table
//                 const addAttack2 = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
//                 await connection.promise().query(addAttack2, [attack2name, attack2desc, attack2damage]);

//                 // get new attackid 
//                 const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//                 [attack2id] = await connection.promise().query(getAttack2ID, [attack2name, attack2damage]);
//                 attack2id = JSON.stringify(attack2id[0].attack_id);

//                 // // link attack info with attack types and strength in attack_type table
//                 // const linkAttack2TypeStrength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
//                 // await connection.promise().query(linkAttack2TypeStrength, [attack2id, attack2type, attack2strength]);

//                 // // if attack 2 type 2 and strength entered
//                 // if (attack2type2 !== 'None') {

//                 //     // if attacktype 2 is not the same as attacktype 1 - link to attacktype table 
//                 //     if (attack2type !== attack2type2) {

//                 //         const linkAttack2Type2Strength = `INSERT INTO attack_type (attack_id, type_id, strength) VALUES ( ? , ? , ? );`;
//                 //         await connection.promise().query(linkAttack2Type2Strength, [attack2id, attack2type2, attack2type2strength]);

//                 //     }
                
//                 // }

//             // if attack 2 exists - get existing attack id    
//             } else {

//                 // get existing attackid 
//                 const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
//                 [attack2id] = await connection.promise().query(getAttack2ID, [attack2name, attack2damage]);
//                 attack2id = JSON.stringify(attack2id[0].attack_id);

//             }
            
//         } 

//         // add card details 
//         const addCard = `INSERT INTO card (pokemon_name, card_img_url, card_hp, pokedex_num, evolves_from, holo, 
//             rarity_id, type_id, stage_id, weakness_id, expansion_id) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? );`;

//         let [addCardResult] = await connection.promise().query(addCard, [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion]);

//         // get new cardid
//         let newcardid = addCardResult.insertId;
        
//         // link card to its attacks 
//         const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
//         await connection.promise().query(linkCardAttack, [newcardid, attackid]);

//         if (attack2id !== null) {
//             const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
//             await connection.promise().query(linkCardAttack2, [newcardid, attack2id]);
//         }

//         // end transaction
//         const commitTransaction = `COMMIT;`;
//         await connection.promise().query(commitTransaction);
        
//         // redirect with successful message
//         req.session.message = `Card added, add a new card`;
        

//     } catch (err) {

//         // rollback the transaction
//         const rollbackTransaction = `ROLLBACK;`;
//         await connection.promise().query(rollbackTransaction);

//         // redirect with unsuccessful message
//         req.session.message = `Cannot add card, unexpected error`;
        
        
//     } finally {

//         res.redirect(`/addcard`);

//     }
 


// });

module.exports = router;