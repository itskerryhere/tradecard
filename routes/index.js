const express = require('express');
const router = express.Router();


// homepage route 
router.get('/',  (req, res) =>  {

    const sessionobj = req.session;

    res.render('index', {title: 'Pokemon TCG', sessionobj});
});

module.exports = router;