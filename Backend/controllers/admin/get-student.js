const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.params;
    let response = {};

    const schema = Joi.object({
        rollNo: Joi.number().integer().min(1).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let student = null;
    try {
        student = (await db.sequelize.query(`select id, rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup from students where rollNo = ${input.rollNo};`))[0][0];
    } catch (error) {
        student = 'fail';
        response.message = error.parent.sqlMessage;
    }
    if(!student) return responses.errorResponseWithoutData(res, 'Invalid RollNo', 0, 200);
    if(student === 'fail') return responses.errorResponseWithoutData(res, response.message, 0, 200);

    responses.successResponseData(res, student, 1, 'Student fetched successfully', null);
});