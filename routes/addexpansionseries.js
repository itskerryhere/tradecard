const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// add new expansion/series route
router.get('/addexpansionseries', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    const message = req.session.message;
    req.session.message = null;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`
    let [adminResult] = await connection.promise().query(checkAdmin, [userid]);

    // if admin
    if (adminResult.length > 0) {

        // get series list
        const getSeries = `SELECT * FROM series;`;
        let [seriesResult] = await connection.promise().query(getSeries);

        res.render('addexpansionseries', {title: 'Add Expansion and Series', serieslist: seriesResult, message: message, sessionobj});

    // if not admin 
    } else {
        res.redirect(`/cards`);
    }

});

// post new expansion/series route
router.post('/addexpansionseries', async (req, res) => {

    const sessionobj = req.session;  
    const formId = req.body.expanseriesForm;

    try {

        // edit details form
        if (formId === 'addSeries') {

            let seriesname = req.body.seriesName;

            // check is series name already exists
            const checkSeriesExist = `SELECT * FROM series WHERE series_name = ?;`;
            let [seriesExistResult] = await connection.promise().query(checkSeriesExist, [seriesname]);

            // if do
            if (seriesExistResult.length > 0) {

                // redirect with message
                req.session.message = 'Series Already Exists';

            // if don't 
            } else {

                // add
                const addSeries = `INSERT INTO series(series_name) VALUES (?);`;
                await connection.promise().query(addSeries, [seriesname]);

                // redirect with message
                req.session.message = 'Series Added';

            }

        } else if (formId === 'addExpansion') {

            let expansionname = req.body.expansionName;
            let seriesbelong = req.body.seriesBelong;
            let expansiondate = req.body.expansionDate;

            // check if expansion name exists
            const checkExpansionExist = `SELECT * FROM expansion WHERE expansion_name = ?;`;
            let [expansionExistResult] = await connection.promise().query(checkExpansionExist, [expansionname]);

            // if does
            if (expansionExistResult.length > 0) {

                // redirect with message
                req.session.message = 'Expansion Already Exists';

            // if doesn't
            } else {

                // add expansion and link to series
                const addExpansion = `INSERT INTO expansion (expansion_name, expansion_release_date, series_id) VALUES (? , ?, ?);`;
                await connection.promise().query(addExpansion, [expansionname, expansiondate, seriesbelong]);

                // redirect with message
                req.session.message = 'Expansion Added';

            }
            
        }

    } catch (err) {
        
        console.error("Error:", err);
        req.session.message = 'Failed to add expansion or series, unexpected error';

    } finally {

        res.redirect(`/addexpansionseries`);
    }

});

module.exports = router;