const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/account',  (req, res) =>  {

    res.render('account', {title: 'My Account'});
});

module.exports = router;