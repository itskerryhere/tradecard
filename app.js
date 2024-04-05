const express = require('express');
const app = express();
const path = require('path');
const PORT = 4000;
const connection = require("./connection.js");
const sessions = require('express-session');

// gets the .ejs files from views folder directly
app.set('view engine', 'ejs'); 

// middleware to render static images 
app.use(express.static(path.join(__dirname,'./images' ))); // may have to take away the folder links within the html files 
// middleware to render static css (?)
app.use(express.static(path.join(__dirname,'./public' ))); 
// middleware to allow POST requests
app.use(express.urlencoded({ extended: true }));
// middleware for sessions
const halfDay = 1000 * 60 * 60 * 12;
app.use(sessions({
    secret: "secretkey",
    saveUninitialized: true,
    cookie: {maxAge : halfDay},
    resave: false
}));


// homepage route 
app.get('/',  (req, res) =>  {

    
    res.render('index', {title: 'Home'});
});

// sign up route 
app.get('/signup',  (req, res) =>  {


    res.render('signup', {title: 'Sign Up', errorMessage: ''});
});

app.post('/signup', (req, res) => {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email; 
    let password = req.body.password;

    // check if email already exists in the database
    let checkEmailExist = 'SELECT * FROM user WHERE email = ?';

    connection.query(checkEmailExist, [email], async (err, userResult) => {
        if (err) throw err;

        // if duplicate email
        if (userResult.length > 0) {

            res.render('signup', { title: 'Sign Up', errorMessage: 'Email already exists' });
        
        // if new email
        } else {
            // salt password 
            let hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
            SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
            SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

            await connection.promise().query(hashPassword, [password]);

            // insert data with hashed password
            let insertUser = `INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, @storedSaltedHash);`;

            connection.query(insertUser, [firstname, lastname, email], (err, result) => {
                if (err) throw err;
        
                // Get the new user id
                let newuserid = result.insertId;
        
                res.redirect(`/welcome?userid=${newuserid}`);
            });   
        }

    });                        
   
});






// log in route 
app.get('/login',  (req, res) =>  {

    res.render('login', {title: 'Login', errorMessage: ''});
});

app.post('/login', async (req, res) =>  {

    // get input data 
    let email = req.body.email;
    let password = req.body.password;


    // see if any user in database matches email and password 
    let checkUser = `SELECT * FROM user WHERE email = ? `;

    connection.query(checkUser, [email], async (err, result) => {
       if (err) throw err;

       let getNumOfUsers = result.length; // should be 1 always, as no duplicate email 

       // if user exist
       if (getNumOfUsers > 0) {
    //        let sessionObj = req.session;
    //        sessionObj.sess_valid = true;
    //        sessionObj.email = result[0].email;
    //        sessionObj.password = result[0].password;

            // unhash password 
            let getSaltInUse = `SELECT SUBSTRING(password, 1, 6) AS salt FROM user WHERE email = ?;`;
            let saltInUse = await connection.promise().query(getSaltInUse, [email]);
            saltInUse = saltInUse[0][0].salt; // accessing the Buffer values, aut oconverts from numerical to values

           
            let getStoredSaltedHashInUse = `SELECT SUBSTRING(password, 7, 40) AS storedSaltedHash FROM user WHERE email = ?;`;
            let storedSaltedHashInUse = await connection.promise().query(getStoredSaltedHashInUse, [email]);
            storedSaltedHashInUse = storedSaltedHashInUse[0][0].storedSaltedHash;
            

            let getSaltedHash = `SELECT SHA1(CONCAT(?, ?)) AS saltedHash;`
            let saltedHash = await connection.promise().query(getSaltedHash, [saltInUse, password]);
            // saltedHash = JSON.stringify(saltedHash[0]); // to test 
            saltedHash = saltedHash[0][0].saltedHash;

            
            let getSaltedInputPassword = `SELECT @saltedPassword := CONCAT(?, ?) AS saltedPassword;`;
            let saltedInputPassword = await connection.promise().query(getSaltedInputPassword, [saltInUse, saltedHash]);
            saltedInputPassword = saltedInputPassword[0][0].saltedPassword;


            let attemptLogin = `SELECT user_id FROM user WHERE email = ? AND password = ?;`;
            let result = await connection.promise().query(attemptLogin, [email, saltedInputPassword]);
            

            // if correct password
            if (result[0].length > 0) {
                let userid = JSON.stringify(result[0][0].user_id);
                res.redirect(`/welcome?userid=${userid}`); 
            
            // if incorrect password 
            } else {
                res.render('login', { title: 'Login', errorMessage: 'Incorrect password, try again' })
            }

        // if user does not exists
       } else {
            
           res.render('login', {title: 'Login', errorMessage: 'Invalid email, try again'});
       }
       
   });

});





// welcome route
app.get('/welcome', (req, res) => {

    // get userid
    let userid = req.query.userid;

    // fetch the new user data after successful insertion
    let getUser = `SELECT * FROM user WHERE user_id = ?`;

    connection.query(getUser, [userid], (err, userResult) => {
        if (err) throw err;

        // pass the fetched user data to the accounts route
        res.render('welcome', { title: 'Welcome',  userinfo: userResult });
    });
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