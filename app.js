const express = require('express');
const app = express();
const path = require('path');
const PORT = 4000;
const connection = require("./connection.js");
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());
const oneHour = 1000 * 60 * 60 * 1;
app.use(sessions({
    secret: "secretkey",
    saveUninitialized: true,
    cookie: {maxAge : oneHour},
    resave: false
}));

// routes
const indexRoute = require('./routes/index')
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const cardsRoute = require('./routes/cards');
const cardinfoRoute = require('./routes/cardinfo');
const accountRoute = require('./routes/account');
const wishlistRoute = require('./routes/wishlist');
const collectionsRoute = require('./routes/collections');
const collectioninfoRoute = require('./routes/collectioninfo');
const addcardRoute = require('./routes/addcard');
const editcardRoute = require('./routes/editcard');
const addexpansionseriesRoute = require('./routes/addexpansionseries');


app.use(indexRoute);
app.use(signupRoute);
app.use(loginRoute);
app.use(cardsRoute);
app.use(cardinfoRoute);
app.use(accountRoute);
app.use(wishlistRoute);
app.use(collectionsRoute);
app.use(collectioninfoRoute);
app.use(addcardRoute);
app.use(editcardRoute);
app.use(addexpansionseriesRoute);


app.listen(PORT, (err) => { 
    if(err) return console.log(err);
    console.log(`Server listening on port http://localhost:${PORT}/`)
});