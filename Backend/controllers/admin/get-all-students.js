const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 0);


    let { semester, departmentId } = input;
    try {
        let result = (await db.sequelize.query(`select id, rollNo, CONCAT(firstName, ' ', lastName) as name from students where semester = ${semester} and departmentId = ${departmentId};`))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Students fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No students found', null);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});