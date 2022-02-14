const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    if(req.student.rollNo !== input.rollNo) return res.status(400).send('Invalid auth token.');

    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
        oldPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JOSN input');

    let rollNo = input.rollNo, enteredOldPassword = input.oldPassword, newPassword = input.newPassword;


    let response = {};

    let actualPassword = (await db.sequelize.query(`select password from students where rollNo = ${rollNo};`))[0][0]['password'];
    let isValidPassword = await bcrypt.compare(enteredOldPassword, actualPassword);

    if(isValidPassword || ((actualPassword === rollNo.toString()) && enteredOldPassword === rollNo.toString())) {
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