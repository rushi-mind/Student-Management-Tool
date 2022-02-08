const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, oldPassword = input.oldPassword, newPassword = input.newPassword;
    let response = {};

    let isVerified = (await db.sequelize.query(`select password from students where rollNo = ${rollNo};`))[0][0]['password'] === oldPassword;
    if(isVerified) {
        let query = `update students set password = "${newPassword}" where rollNo = ${rollNo};`;
        try {
            let [result, metadata] = await db.sequelize.query(query);
            response.status = 'ok';
            response.message = 'Password updated successfully.';
        } catch (error) {
            res.status(400);
            response.status = 'fail';
            response.message = error.parent.sqlMessage;
        }
    }
    else {
        res.status(400);
        response.status = 'fail';
        response.message = 'Invalid password.';
    }

    res.send(response);
});