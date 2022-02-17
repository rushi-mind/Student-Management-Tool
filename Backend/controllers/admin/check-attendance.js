const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required(),
        dateRange: Joi.object({
            from: Joi.date().required(),
            to: Joi.date().greater(Joi.ref('from')).required()
        }).required()
    });
    let isValidInput = true;
    try {
        isValidInput = schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.code = 400;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, response.code);


    
    let { semester, departmentId, dateRange } = input;

    let query = `
        SELECT students.rollNo, CONCAT(students.firstName, ' ', students.lastName) AS name, attendance.date, attendance.status 
        FROM attendance
        INNER JOIN students ON students.id = attendance.studentId
        WHERE students.semester = ${semester} AND students.departmentId = ${departmentId} AND attendance.date BETWEEN "${dateRange.from}" AND "${dateRange.to}";
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