const express = require('express');
const router = express.Router();


// homepage route 
router.get('/',  (req, res) =>  {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    res.render('index', {title: 'Home', sessionobj});
});

module.exports = router;