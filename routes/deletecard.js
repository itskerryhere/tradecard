const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// edit new card route
router.get('/deletecard', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;
    let cardid = req.params.cardid;

    req.session.message = null;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`;
    let [adminResult] = await connection.promise().query(checkAdmin, [userid]);

    // if admin
    if (adminResult.length > 0) {

        req.session.message = `Card deleted`;
        res.redirect(`/cards`);
    
    // if not admin 
    } else {
        // redirect with message
        res.redirect(`/cards`);
    }

});

router.post('/deletecard', async (req, res) => {

    let cardid = req.body.deleteCard;

    // being transaction
    const startTransaction = `START TRANSACTION;`;
    await connection.promise().query(startTransaction);
    
    try {
        // check if attacks are being used by other cards
        // get current stored attacks info before deleting
        const currentAttackInfo = `SELECT * FROM attack 
        INNER JOIN card_attack ON attack.attack_id = card_attack.attack_id 
        WHERE card_id = ?;`; 
        let [currentAttackInfoResult] = await connection.promise().query(currentAttackInfo, [cardid]);
        let currentAttack1Id = currentAttackInfoResult[0].attack_id;

        // delete the card attack 1 id link 
        const deleteLinkCardAttack1 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
        await connection.promise().query(deleteLinkCardAttack1, [currentAttack1Id, cardid]);

        // check if current attack 1 is used for any other card
        const checkCurrentAttack1InUse = `SELECT card_id FROM card_attack 
        INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
        WHERE attack.attack_id = ?`;
        let [attack1InUseResult] = await connection.promise().query(checkCurrentAttack1InUse, [currentAttack1Id]);

        // if no other cards are using the attack - delete
        if (attack1InUseResult.length === 0) {
            const deleteAttack = `DELETE FROM attack WHERE attack_id = ?;`;
            await connection.promise().query(deleteAttack, [currentAttack1Id]);
        } // else keep 

        // if there's second attack 
        if (currentAttackInfoResult.length > 1) {
            let currentAttack2Id = currentAttackInfoResult[1].attack_id;

            // delete the old card attack id link 
            const deleteLinkCardAttack2 = `DELETE FROM card_attack WHERE attack_id = ? AND card_id = ?;`;
            await connection.promise().query(deleteLinkCardAttack2, [currentAttack2Id, cardid]);

            // check if current attack 2 is used for any other card
            const checkCurrentAttack2InUse = `SELECT card_id FROM card_attack 
            INNER JOIN attack ON attack.attack_id = card_attack.attack_id 
            WHERE attack.attack_id = ?`;
            let [attack2InUseResult] = await connection.promise().query(checkCurrentAttack2InUse, [currentAttack2Id]);

            // if no other cards are using the attack - delete
            if (attack2InUseResult.length === 0) {
                const deleteAttack = `DELETE FROM attack WHERE attack_id = ?;`;
                await connection.promise().query(deleteAttack, [currentAttack2Id]);
            } // else keep 
        }


        // delete card 
        const deleteCard = `DELETE FROM card WHERE card_id = ?;`;
        await connection.promise().query(deleteCard, [cardid]);

        // end transaction
        const commitTransaction = `COMMIT;`;
        await connection.promise().query(commitTransaction);

        res.redirect(`/deletecard`);

    } catch (err) {

        // rollback the transaction
        const rollbackTransaction = `ROLLBACK;`;
        await connection.promise().query(rollbackTransaction);

        console.error("Error:", err);
        req.session.message = `Failed to delete card, unexpected error`;
        res.redirect(`/editcard/${cardid}`);
        
    }

    
    

});

module.exports = router;