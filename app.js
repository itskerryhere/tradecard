const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.set('view engine', 'ejs'); // gets the .ejs files from views folder directly

// middleware to render static images and css 
app.use(express.static(path.join(__dirname,'./images' ))); // may have to take away the folder links within the html files 

// homepage route 
app.get('/',  (req, res) =>  {
    res.sendFile(path.join(__dirname,'./views/index.ejs')); // change the href refs in the html to /
});

// homepage route 
app.get('/signup',  (req, res) =>  {
    res.sendFile(path.join(__dirname,'./views/signup.ejs')); // change the href refs in the html to /signup
});




app.listen(PORT, (err) => { 
    if(err) return console.log(err);
    console.log(`Server listening on port http://localhost:${PORT}/`)
});