const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required(),
        pageNumber: Joi.number().integer().min(1).required(),
        pageSize: Joi.number().integer().min(1).required(),
        sort: Joi.object({
            type: Joi.string().required(),
            by: Joi.string().required()
        }).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { semester, departmentId, pageNumber, pageSize, sort } = input;

    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup FROM students WHERE semester = ${semester} AND departmentId = ${departmentId} ORDER BY ${sort.by} ${sort.type} LIMIT ${pageSize} OFFSET ${pageSize*(pageNumber-1)};`;

    try {
        const students = (await db.sequelize.query(query))[0];
        const totalRecords = (await db.sequelize.query(`select count(id) as total from students where semester = ${semester} and departmentId = ${departmentId};`))[0][0]['total'];
        responses.successResponseData(res, students, 1, 'Students fetched successfully', { totalRecords });
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});