const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    if(req.student.rollNo !== input.rollNo) return responses.validationErrorResponseData(res, 'Invalid auth token', 400);

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
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);

    let { rollNo, oldPassword, newPassword } = input;
    
    let actualPassword = (await db.sequelize.query(`select password from students where rollNo = ${rollNo};`))[0][0]['password'];
    let isValidPassword = await bcrypt.compare(oldPassword, actualPassword);

    if(isValidPassword || (actualPassword === oldPassword)) {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(newPassword, salt);

        let query = `update students set password = "${hashedPassword}" where rollNo = ${rollNo};`;
        try {
            await db.sequelize.query(query);
            response.message = 'Password updated successfully';
            responses.successResponseWithoutData(res, response.message, 1);
        } catch (error) {
            response.message = error.parent.sqlMessage;
            responses.errorResponseWithoutData(res, response.message, 0, 200);
        }
    }
    else {
        return responses.validationErrorResponseData(res, 'Invalid Password Entered', 400);
    }
});