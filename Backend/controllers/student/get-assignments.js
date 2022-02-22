const db = require('../../models');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.params;
    let response = {};

    if(req.student.rollNo !== parseInt(input.rollNo)) return responses.validationErrorResponseData(res, 'Invalid Auth Token', 400);

    const schema = Joi.object({
        rollNo: Joi.number().integer().required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);


    let { rollNo } = input; 
    try {
        let result = (await db.sequelize.query(`select semester, departmentId from students where rollNo = ${rollNo};`))[0][0];
        const semester = result.semester, departmentId = result.departmentId;
        let query = `SELECT name, deadline, CONCAT("http://192.168.1.169:5000/assignments/", filePath) AS fileURL FROM assignments WHERE semester = ${semester} AND departmentId = ${departmentId};`;
        result = (await db.sequelize.query(query))[0];
        if(result.length) responses.successResponseData(res, result, 1, 'Assignments fetched successfully', null);
        else responses.successResponseData(res, result, 1, 'No assignments found', null);
    } catch (error) {
        response.message = error.parent.sqlMessage;
        responses.errorResponseWithoutData(res, response.message, 0, 200);
    }
});