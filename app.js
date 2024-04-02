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

    const getcards = `SELECT card_id, pokemon_name, card_img_url, rarity_name, rarity_symbol_url FROM card JOIN rarity ON card.rarity_id = rarity.rarity_id;`;

    connection.query(getcards, (err, result) => {
        if (err) throw err;
        res.render('cards', {title: 'Cards', cardlist: result});
    });

   
});

// cardinfo route 
app.get('/cardinfo',  (req, res) =>  {
    const cardid = req.query.cardid;

    const readsql = `SELECT * FROM card 
    JOIN category ON category_id = category.category_id
    JOIN type ON card.type_id = type.type_id
    JOIN weakness ON card.weakness_id = weakness.weakness_id
    JOIN stage ON card.stage_id = stage.stage_id
    JOIN rarity ON card.rarity_id = rarity.rarity_id
    JOIN expansion ON card.expansion_id = expansion.expansion_id
    JOIN series ON expansion.series_id = series.series_id
    WHERE card.card_id = ?`;

    //     JOIN card_attack ON card.card_id = card_attack.card_id
    //JOIN attack ON card_attack.attack_id = attack.attack_id
   // JOIN attack_type ON attack.attack_id = attack_type.attack_id
  //  JOIN type AS attack_type_table ON attack_type_table.type_id = attack_type.type_id

    connection.query(readsql, [cardid], (err, result) => {
        if (err) throw err;


        res.render('cardinfo', {cardinfo : result});
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