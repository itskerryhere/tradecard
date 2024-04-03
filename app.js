const express = require('express');
const app = express();
const path = require('path');
const PORT = 4000;
const connection = require("./connection.js");

// gets the .ejs files from views folder directly
app.set('view engine', 'ejs'); 

// middleware to render static images 
app.use(express.static(path.join(__dirname,'./images' ))); // may have to take away the folder links within the html files 
// middleware to render static css (?)
app.use(express.static(path.join(__dirname,'./public' ))); 
// middleware to allow POST requests
app.use(express.urlencoded({ extended: true }));


// homepage route 
app.get('/',  (req, res) =>  {
    
    res.render('index', {title: 'Home'});
});

// sign up route 
app.get('/signup',  (req, res) =>  {

    


    res.render('signup', {title: 'Sign Up'});
});

// log in route 
app.get('/login',  (req, res) =>  {

    res.render('login', {title: 'Login'});
});

// cards route 
app.get('/cards',  (req, res) =>  {

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
            res.render('cards', { title: 'Cards', cardlist: cardResult, typelist: typeResult });
        });       
    });

   
});



// cardinfo route 
app.get('/cardinfo',  (req, res) =>  {
//app.get('/cards/:cardid',  (req, res) =>  {

    let cardid = req.query.cardid;
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
        let attackResult=  result[1];
        let weaknessResult = result[2];

        res.render('cardinfo', {cardinfo : cardResult, attackinfo : attackResult, weaknessinfo: weaknessResult});
    });

    
});


// filter route 
app.get('/filter',  (req, res) =>  {

    res.render('filter', {title: 'Filter'});
});


app.listen(PORT, (err) => { 
    if(err) return console.log(err);
    console.log(`Server listening on port http://localhost:${PORT}/`)
});