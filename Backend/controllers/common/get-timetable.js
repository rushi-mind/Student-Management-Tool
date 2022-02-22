const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.params;
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
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { departmentId, semester } = input;
    
    let query = `SELECT lectureNo, Monday, Tuesday, Wednesday, Thursday, Friday FROM timetable WHERE semester = ${semester} AND departmentId = ${departmentId};`;

    try {
        let result = (await db.sequelize.query(query))[0];
        if(!result.length) responses.successResponseData(res, result, 1, 'No Timetable found', null);
        else responses.successResponseData(res, result, 1, 'Timetable fetched successfully', null);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});