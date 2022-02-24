const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.query;
    let response = {};

    const schema = Joi.object({
        from: Joi.date().required(),
        to: Joi.date().greater(Joi.ref('from')).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);
    

    let query = `SELECT date, status FROM attendance WHERE studentId = ${req.student.id} AND date BETWEEN "${input.from}" AND "${input.to}";`;

    try {
        let result = (await db.sequelize.query(query))[0];
        response.totalRecords = result.length;
        response.data = result;
        responses.successResponseData(res, result, 1, 'Attendance fetched successfully', { totalRecords: response.totalRecords });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});