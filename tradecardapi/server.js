require('dotenv').config();
const express = require("express");
const app = express();
const mysql = require('mysql2');

const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:10,
    port: process.env.DB_PORT,
    multipleStatements: true
});

connection.getConnection((err)=>{
    if(err) return console.log(err.message);
    console.log("connected to local mysql db using .env properties");
});


app.get('/cards', async (req, res)=> { 

    const searchKeyword = req.query.search; // catch search keyword
    const {typeFilter, weaknessFilter, hpFilter, rarityFilter, stageFilter, pokedexFilter, expansionFilter, seriesFilter} = req.query; // for filter
    const {sort} = req.query;
    

    // show all cards 
    let getCards = `SELECT DISTINCT card.*, rarity.rarity_name, rarity.rarity_symbol_url, type.type_name, type.type_symbol_url FROM card 
    INNER JOIN rarity ON card.rarity_id = rarity.rarity_id
    INNER JOIN type ON card.type_id = type.type_id
    INNER JOIN card_attack ON card.card_id = card_attack.card_id
    INNER JOIN attack ON card_attack.attack_id = attack.attack_id`;

    // If a search keyword is provided, add search filtering to the query
    if (searchKeyword) {
        getCards += ` WHERE pokemon_name LIKE '%${searchKeyword}%' 
        OR rarity_name = '${searchKeyword}'
        OR type_name = '${searchKeyword}'
        OR attack_name LIKE '%${searchKeyword}%'
        OR attack_description LIKE '%${searchKeyword}%'`;
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
    

    res.json({cardsResult, typesResult, weaknessResult, rarityResult, stageResult, expansionResult, seriesResult, cardCount });


});

app.get('/cards/:cardid?', (req, res) => {

    let cardid = req.params.cardid;

    const getcardinfo = `SELECT * FROM card 
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

    connection.query(getcardinfo, [cardid, cardid, cardid], async (err, result) => {
        if (err) throw err;

        let cardResult = result[0];
        let attackResult = result[1];
        let weaknessResult = result[2];
            

        res.json({cardResult, attackResult, weaknessResult});

    });


});


app.post('/addcard', async (req, res) => {


    // start transaction
    const startTransaction = `START TRANSACTION;`;
    await connection.promise().query(startTransaction);

    try {

        // grab fields 
        const {
            pokemonname: pokemonname,
            pokedexnumber : pokedexnumber,
            hp : hp,
            url : url,
            stage : stage,
            evolvesfrom : evolvesfrom,
            rarity : rarity,
            type : type,
            weakness : weakness,
            holo : holo,
            expansion : expansion,
        
            attackname : attackname,
            attackdamage : attackdamage,
            attackdesc : attackdesc,
        
            attack2name : attack2name,
            attack2damage : attack2damage,
            attack2desc : attack2desc
        } = req.body;


        // check if attack 1 exists  
        const checkAttackExist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
        let [checkAttackResult] = await connection.promise().query(checkAttackExist, [attackname, attackdamage]);

        // if attack 1 does not exist - add new attack details
        let attackid = null;
        if (checkAttackResult.length === 0) {
            // add to attack table
            const addAttack = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
            await connection.promise().query(addAttack, [attackname, attackdesc, attackdamage]);

            // get new attackid 
            const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
            [attackid] = await connection.promise().query(getAttackID, [attackname, attackdamage]);
            attackid = JSON.stringify(attackid[0].attack_id);

        } else {

            // get existing attackid 
            const getAttackID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
            [attackid] = await connection.promise().query(getAttackID, [attackname, attackdamage]);
            attackid = JSON.stringify(attackid[0].attack_id);

        }


        // if all necessary details for attack 2 entered
        let attack2id = null;
        if (attack2name !== '' && attack2damage !== '') {

            const checkAttack2Exist = `SELECT * FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
            let [checkAttack2Result] = await connection.promise().query(checkAttack2Exist, [attack2name, attack2damage]);

            // if not exist - add new attack details 
            if (checkAttack2Result.length === 0) {

                // add to attack table
                const addAttack2 = `INSERT INTO attack (attack_name, attack_description, attack_damage) VALUES (? , ? , ?);`;
                await connection.promise().query(addAttack2, [attack2name, attack2desc, attack2damage]);

                // get new attackid 
                const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
                [attack2id] = await connection.promise().query(getAttack2ID, [attack2name, attack2damage]);
                attack2id = JSON.stringify(attack2id[0].attack_id);

            } else {

                // get existing attackid 
                const getAttack2ID = `SELECT attack_id FROM attack WHERE attack_name = ? AND attack_damage = ?;`;
                [attack2id] = await connection.promise().query(getAttack2ID, [attack2name, attack2damage]);
                attack2id = JSON.stringify(attack2id[0].attack_id);

            }
            
        } 

        // add card details 
        const addCard = `INSERT INTO card (pokemon_name, card_img_url, card_hp, pokedex_num, evolves_from, holo, 
            rarity_id, type_id, stage_id, weakness_id, expansion_id) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? );`;

        let [addCardResult] = await connection.promise().query(addCard, [pokemonname, url, hp, pokedexnumber, evolvesfrom, holo, rarity, type, stage, weakness, expansion]);

        // get new cardid
        let newcardid = addCardResult.insertId;
        
        // link card to its attacks 
        const linkCardAttack = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
        await connection.promise().query(linkCardAttack, [newcardid, attackid]);

        if (attack2id !== null) {
            const linkCardAttack2 = `INSERT INTO card_attack (card_id, attack_id) VALUES (? ,?);`;
            await connection.promise().query(linkCardAttack2, [newcardid, attack2id]);
        }

        // end transaction
        const commitTransaction = `COMMIT;`;
        await connection.promise().query(commitTransaction);
        
        res.json({newcardid});
        

    } catch (err) {

        // rollback the transaction
        const rollbackTransaction = `ROLLBACK;`;
        await connection.promise().query(rollbackTransaction);

        res.sendStatus(500);
        
        
    } 

});


const server = app.listen(PORT, () => {
    console.log(`API started on port ${server.address().port}`);
});
