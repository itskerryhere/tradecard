const express = require('express');
const router = express.Router();
const connection = require("../connection.js");

// account route 
router.get('/manageadmin', async (req, res) => {

    const sessionobj = req.session;
    let userid = sessionobj.authen;

    const message = req.session.message;
    req.session.message = null;

    // allow access if session user is admin
    const checkAdmin = `SELECT user_id FROM user WHERE role = 'admin' AND user_id = ?;`
    let [admin] = await connection.promise().query(checkAdmin, [userid]);

    // if admin
    if (admin.length > 0) {


        // get requests
        let getRequests = `SELECT * FROM admin_request
        INNER JOIN user ON admin_request.user_id = user.user_id WHERE admin_request_status = ?;`;

        let requeststatus = `Pending`;
        let [requestPending] = await connection.promise().query(getRequests, [requeststatus]);

        let pendingCount = requestPending.length;

        // get all previous 
        let getPreviousRequests = `SELECT * FROM admin_request
        INNER JOIN user ON admin_request.user_id = user.user_id 
        WHERE admin_request_status = 'Accepted' OR admin_request_status = 'Declined'
        ORDER BY request_response_timestamp DESC;`;
        let [requestPrevious] = await connection.promise().query(getPreviousRequests);


        // get user roles
        const getRoles = `SELECT * FROM user WHERE role = ?;`;

        let userrole = 'admin';
        let [adminResult] = await connection.promise().query(getRoles, [userrole]);

        let adminCount = adminResult.length;

        userrole = 'member';
        let [memberResult] = await connection.promise().query(getRoles, [userrole]);

        let memberCount = memberResult.length;

        res.render('adminrequests', {title : 'Manage Admin and Requests', requestlist : requestPending, pendingCount, previouslist: requestPrevious,
        adminlist: adminResult, adminCount, memberlist: memberResult, memberCount, message, sessionobj})

    // if not admin 
    } else {
        // redirect with message
        res.redirect(`/login`);
    }

        
});

router.post('/manageadmin/:userid?', async (req, res) => {

    const userid = req.params.userid;
    const action = req.body.action;
    let updatedstatus = null;

    try {
        if (action === 'accept') {

            const updateUserRole = `UPDATE user SET role = 'admin' WHERE user_id = ?;`;
            await connection.promise().query(updateUserRole, [userid]);
            updatedstatus = 'Accepted';

        } else if (action === 'decline') {

            updatedstatus = 'Declined';
            
        }

        let timestamp = new Date().toISOString().slice(0, -1); // remove the Z 
        const changeRequestStatus = `UPDATE admin_request SET admin_request_status = ?, request_response_timestamp = ? WHERE user_id = ?;`;
        await connection.promise().query(changeRequestStatus, [updatedstatus, timestamp, userid]);

        req.session.message = 'Responded to request';


    } catch (err) {
        console.error("Error:", err);
        req.session.message = `Failed to respond to request, unexpected error`;

    } finally {
        res.redirect(`/manageadmin`);
    }

});

router.post('/manageadmin/:adminrequestid?/delete', async (req, res) => {

    const adminrequestid = req.params.adminrequestid;

    try {
        const deleteRequest = `DELETE FROM admin_request WHERE admin_request_id = ?;`;
        await connection.promise().query(deleteRequest, [adminrequestid]);

        req.session.message = 'Request deleted from database';
        
    } catch (err) {
        console.error("Error:", err);
        req.session.message = `Failed to delete request, unexpected error`;

    } finally {
        res.redirect(`/manageadmin`);
    }

});

router.post('/manageadmin/:userid?/change', async (req, res) => {

    const userid = req.params.userid;
    const newrole = req.body.changeRole;

    try {
        let role = null;
        const changeRole = `UPDATE user SET role = ? WHERE user_id = ?;`;

        if (newrole === 'makeAdmin') {
            role = 'admin';

            req.session.message = 'User changed to admin';

        } else if (newrole === 'makeMember') {
            role = 'member';

            req.session.message = 'User changed to member';
        }

        await connection.promise().query(changeRole, [role, userid]);

    } catch (err) {
        console.error("Error:", err);
        req.session.message = `Failed to change user role, unexpected error`;

    } finally {
        res.redirect(`/manageadmin`);
    }
});


module.exports = router;