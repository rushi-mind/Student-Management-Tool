const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.query;
    let params = req.params;
    let response = {};

    const schemaParams = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required()
    });
    const schemaInput = Joi.object({
        pageNumber: Joi.number().integer().min(1),
        pageSize: Joi.number().integer().min(1),
        sortType: Joi.string(),
        sortBy: Joi.string()
    });
    let isValidInput = true;
    try {
        isValidInput = await schemaParams.validateAsync(params);
        isValidInput = await schemaInput.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { pageNumber, pageSize, sortType, sortBy } = input;

    if(!pageNumber) pageNumber = 1;
    if(!pageSize) pageSize = 7;
    if(!sortType) sortType = 'ASC';
    if(!sortBy) sortBy = 'rollNo';

    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);

    let { departmentId, semester } = params;

    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup FROM students WHERE semester = ${semester} AND departmentId = ${departmentId} ORDER BY ${sortBy} ${sortType} LIMIT ${pageSize} OFFSET ${pageSize*(pageNumber-1)};`;

    try {
        const students = (await db.sequelize.query(query))[0];
        const totalRecords = (await db.sequelize.query(`select count(id) as total from students where semester = ${semester} and departmentId = ${departmentId};`))[0][0]['total'];
        if(students.length) response.message = `Students fetched successfully`;
        else response.message = `No students found on this page`;
        responses.successResponseData(res, students, 1, response.message, { totalRecords, pageNumber, pageSize });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});