const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.query;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        departmentId: Joi.number().integer().min(1).required(),
        semester: Joi.number().integer().min(1).max(8).required()
    });
    const schema = Joi.object({
        dateFrom: Joi.date().required(),
        dateTo: Joi.date().greater(Joi.ref('dateFrom')).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
        isValidInput = await schemaParams.validateAsync(params);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);

    
    let { semester, departmentId } = params;
    let { dateFrom, dateTo } = input;

    let query = `
        SELECT students.rollNo, CONCAT(students.firstName, ' ', students.lastName) AS name, attendance.date, attendance.status 
        FROM attendance
        INNER JOIN students ON students.id = attendance.studentId
        WHERE students.semester = ${semester} AND students.departmentId = ${departmentId} AND attendance.date BETWEEN "${dateFrom}" AND "${dateTo}";
    `;
    try {
        let result = (await db.sequelize.query(query))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Attendance fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No data found', null);
    } catch (error) {
        console.log(error);
        responses.errorResponseWithoutData(res, error.parent.sqlMessage, 0, 200);
    }
});