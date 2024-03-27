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

    res.render('cards', {title: 'Cards'});
});

// cardinfo route 
app.get('/cardinfo',  (req, res) =>  {

    res.render('cardinfo');
});

// filter route 
app.get('/filter',  (req, res) =>  {

    res.render('filter', {title: 'Filter'});
});


app.listen(PORT, (err) => { 
    if(err) return console.log(err);
    console.log(`Server listening on port http://localhost:${PORT}/`)
});