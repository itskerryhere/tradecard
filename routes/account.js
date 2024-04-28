const express = require('express');
const router = express.Router();
const connection = require("../connection.js");
const bcrypt = require('bcrypt');

// account route 
router.get('/account', async (req, res) => {

    const sessionobj = req.session;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;
        let adminStatus = false;
        let requestStatus = false;

        // fetch user data 
        const getUser = `SELECT * FROM user WHERE user_id = ?;`;
        let [userResult] = await connection.promise().query(getUser, [userid])

        // allow access if session user is admin
        const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`
        let [admin] = await connection.promise().query(checkAdmin, [userid]);

        // if admin
        if (admin.length > 0) { 
            adminStatus = true;
        } 

        // check if admin request already sent 
        const checkAdminRequest = `SELECT * FROM admin_request WHERE user_id = ? AND admin_request_status = 'Pending';`;
        let [requestResult] = await connection.promise().query(checkAdminRequest, [userid]);

        if (requestResult.length > 0 && !adminStatus) {
            requestStatus = true;
        }
;

        // pass the fetched user data to the accounts route
        res.render('account', { title: 'Account', userinfo: userResult, adminStatus, requestStatus, sessionobj });

    } else {
        res.redirect(`/login`);
    }

});

// account settings route
router.get('/account/settings', (req, res) => {

    const sessionobj = req.session;

    const message = req.session.message;
    req.session.message = null;

    if (sessionobj.authen) {
        // get userid
        let userid = sessionobj.authen;

        // fetch the new user data after successful insertion
        let getUser = `SELECT * FROM user WHERE user_id = ?`;

        connection.query(getUser, [userid], (err, userResult) => {
            if (err) throw err;

            // pass the fetched user data to the accounts route
            res.render('accountsettings', {title: 'Account Settings', userinfo: userResult, message: message, sessionobj });
        });

    } else {
        res.redirect(`/login`);
    }

});

// edit account details, change password and delete account posts
router.post('/account/settings/editdetails', async (req, res) => {

    const sessionobj = req.session;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email; 
    let userid = sessionobj.authen;


    try {

        // check if email exist in system
        const checkEmail = `SELECT * FROM user WHERE email = ?;`;
        let [result] = await connection.promise().query(checkEmail, [email]);

        if (result.length > 0) {

            req.session.message = 'Email already taken';
            res.redirect(`/account/settings`);

        } else {

            // execute the update query
            const editDetails = `UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?;`;
            await connection.promise().query(editDetails, [firstname, lastname, email, userid]);

            // redirect with new message
            req.session.message = 'Details changed successfully';
            res.redirect(`/account/settings`);

        }

    } catch (err) {

        console.error("Error:", err);
        req.session.message = 'Failed to edit name, unexpected error';
        res.redirect(`/account/settings`);

    }
    
});

router.post('/account/settings/changepassword', async (req, res) => {

    const sessionobj = req.session;
    let oldpassword = req.body.oldpassword;
    let newpassword = req.body.newpassword;
    let userid = sessionobj.authen;

    try {

        // bcrypt
        // check old password is correct
        const checkUser = `SELECT * FROM user WHERE user_id = ? `;
        let [checkUserResult] = await connection.promise().query(checkUser, [userid]);

        let storedPassword = checkUserResult[0].password.toString(); // convert to string as its an object
        let match = await bcrypt.compare(oldpassword, storedPassword);

        if (match) {

            // bcrypt new password 
            const saltRounds = 10;
            let newbcrypthash = await bcrypt.hash(newpassword, saltRounds);

            // execute the update query
            const changePassword = `UPDATE user SET password = ? WHERE user_id = ?;`;
            await connection.promise().query(changePassword, [newbcrypthash, userid]);

             // redirect with message
            req.session.message = 'Password Changed Successfully';
            res.redirect(`/account/settings`);
    
            
        } else {

            // redirect with message
            req.session.message = 'Old Password Incorrect';
            res.redirect(`/account/settings`);

        }



        // // SHA1
        // // check old password is correct
        // // unhash password 
        // const getSaltInUse = `SELECT SUBSTRING(password, 1, 6) AS salt FROM user WHERE user_id = ?;`;
        // let saltInUse = await connection.promise().query(getSaltInUse, [userid]);
        // saltInUse = saltInUse[0][0].salt; // accessing the Buffer values, auto converts from numerical to values

    
        // const getStoredSaltedHashInUse = `SELECT SUBSTRING(password, 7, 40) AS storedSaltedHash FROM user WHERE user_id = ?;`;
        // let storedSaltedHashInUse = await connection.promise().query(getStoredSaltedHashInUse, [userid]);
        // storedSaltedHashInUse = storedSaltedHashInUse[0][0].storedSaltedHash;
        

        // const getSaltedHash = `SELECT SHA1(CONCAT(?, ?)) AS saltedHash;`
        // let saltedHash = await connection.promise().query(getSaltedHash, [saltInUse, oldpassword]);
        // saltedHash = saltedHash[0][0].saltedHash;

        
        // const getSaltedInputPassword = `SELECT CONCAT(?, ?) AS saltedPassword;`;
        // let saltedInputPassword = await connection.promise().query(getSaltedInputPassword, [saltInUse, saltedHash]);
        // saltedInputPassword = JSON.stringify(saltedInputPassword[0][0].saltedPassword);

        // // get stored password
        // const getStoredPassword = `SELECT password AS oldpassword FROM user WHERE user_id = ?;`;
        // let storedPassword = await connection.promise().query(getStoredPassword, [userid]);
        // storedPassword = JSON.stringify(storedPassword[0][0].oldpassword);


        // //if old password correct
        // if (storedPassword === saltedInputPassword) {

        //     // salt new input password 
        //     const hashPassword = `SELECT @salt := SUBSTRING(SHA1(RAND()), 1, 6);
        //     SELECT @saltedHash := SHA1(CONCAT(@salt, ?));
        //     SELECT @storedSaltedHash := CONCAT(@salt, @saltedHash);`

        //     await connection.promise().query(hashPassword, [newpassword]);

        //     // execute the update query
        //     const changePassword = `UPDATE user SET password = @storedSaltedHash WHERE user_id = ?;`;
        //     await connection.promise().query(changePassword, [userid]);

        //     // redirect with message
        //     req.session.message = 'Password Changed Successfully';
        //     res.redirect(`/account/settings`);


        // // if old password wrong.. error
        // } else {

        //     // redirect with message
        //     req.session.message = 'Old Password Incorrect';
        //     res.redirect(`/account/settings`);

            
        // }

    } catch (err) {

        console.error("Error:", err);
        req.session.message = 'Failed to change password, unexpected error';
        res.redirect(`/account/settings`);

    }

});


router.post('/account/settings/deleteaccount', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    // start transaction
    const startTransaction = `START TRANSACTION;`;
    await connection.promise().query(startTransaction);

    try {
        // delete user wishlist
        const deleteUserWishlist = `DELETE FROM wishlist WHERE user_id = ?;`;
        await connection.promise().query(deleteUserWishlist, [userid]);

        
        // update collection like counts 
        // get all collection ids the user has liked
        const getUserLikedCollections = `SELECT collection_id FROM user_like_collection WHERE user_id = ?;`;
        let [userLikedCollections] = await connection.promise().query(getUserLikedCollections, [userid]);


        // if user liked any collections
        if (userLikedCollections.length > 0) {
            // put in array
            let likedCollectionIds = [];
            userLikedCollections.forEach((collection) => {
                likedCollectionIds.push(collection.collection_id);
            });

            // decrease all those like_counts by 1
            for (const eachcollectionid of likedCollectionIds) {
                const decrementLikeCount = `UPDATE collection SET like_count = like_count - 1 WHERE collection_id = ?;`;
                await connection.promise().query(decrementLikeCount, [eachcollectionid]);
            };

            // delete user liked collections
            const deleteUserLikedCollections = `DELETE FROM user_like_collection WHERE user_id = ?;`;
            await connection.promise().query(deleteUserLikedCollections, [userid]);

            
        }

        // get all collections owned by user and store ids in array
        const getUserCollections = `SELECT * FROM collection WHERE user_id = ?;`; 
        let [userCollections] = await connection.promise().query(getUserCollections, [userid]);

        // if user owns any collections
        if (userCollections.length > 0) {

            let userCollectionIds = [];
            
            userCollections.forEach((collection) => {
                userCollectionIds.push(collection.collection_id);
            });
    
            
            // delete all cards in each user collection
            for (const eachcollectionid of userCollectionIds) {
                const deleteUserCardInCollections = `DELETE FROM card_collection WHERE collection_id = ?`;
                await connection.promise().query(deleteUserCardInCollections, [eachcollectionid]);
            };


            // delete all user collections 
            const deleteUserCollections = `DELETE FROM collection WHERE user_id = ?`;
            await connection.promise().query(deleteUserCollections, [userid]);
        }

        // delete comments on collections 
        const deleteUserComments = `DELETE FROM comment WHERE user_id = ?;`;
        await connection.promise().query(deleteUserComments, [userid]);

        // delete admin request
        const deleteAdminRequest = `DELETE FROM admin_request WHERE user_id = ?;`;
        await connection.promise().query(deleteAdminRequest, [userid]);
        
        // delete account
        const deleteAccount = `DELETE FROM user WHERE user_id = ?`;
        await connection.promise().query(deleteAccount, [userid]);

        // end transaction
        const commitTransaction = `COMMIT;`;
        await connection.promise().query(commitTransaction);

        // delete session
        req.session.destroy();

        // 1 sec delay
        setTimeout( () => {
            res.redirect(`/`);
        }, 1000);

    } catch (err) {

        // rollback the transaction
        const rollbackTransaction = `ROLLBACK;`;
        await connection.promise().query(rollbackTransaction);

        // redirect with message
        req.session.message = 'Failed to delete account, unexpected error';
        res.redirect(`/account/settings`);
        
    }

});

router.get('/account/sendadminrequest/:userid?', async (req, res) => {
    
    const userid = req.params.userid;

    const addRequest = `INSERT INTO admin_request (user_id) VALUES ( ? );`;
    await connection.promise().query(addRequest, [userid]);

    res.redirect(`/account`);
            
});

module.exports = router;