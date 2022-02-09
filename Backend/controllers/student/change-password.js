const db = require('../../models');
const bcrypt = require('bcrypt');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, enteredOldPassword = input.oldPassword, newPassword = input.newPassword;

    if(req.student.rollNo !== rollNo) return res.status(400).send('Invalid auth token.');

    let response = {};

    
    let actualPassword = (await db.sequelize.query(`select password from students where rollNo = ${rollNo};`))[0][0]['password'];
    let isValid = await bcrypt.compare(enteredOldPassword, actualPassword);
    if(isValid) {

        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);

        let query = `update students set password = "${hashedPassword}" where rollNo = ${rollNo};`;
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