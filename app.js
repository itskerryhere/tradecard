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

// routes
const indexRoute = require('./routes/index')
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
// const welcomeRoute = require('./routes/welcome');
const cardsRoute = require('./routes/cards');
const cardinfoRoute = require('./routes/cardinfo');
const accountRoute = require('./routes/account');


app.use(indexRoute);
app.use(signupRoute);
app.use(loginRoute);
// app.use(welcomeRoute);
app.use(cardsRoute);
app.use(cardinfoRoute);
app.use(accountRoute);


// filter route 
app.get('/filter',  (req, res) =>  {

    res.render('filter', {title: 'Filter'});
});



app.listen(PORT, (err) => { 
    if(err) return console.log(err);
    console.log(`Server listening on port http://localhost:${PORT}/`)
});